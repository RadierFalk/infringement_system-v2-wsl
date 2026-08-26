import logging
from typing import List, Tuple
import requests
from app.config import settings

from sqlalchemy.orm import Session

from app.models import Occurrence, Department, OccurrenceCategorySendingRule

logger = logging.getLogger(__name__)


def resolve_recipients(db: Session, occurrence: Occurrence) -> Tuple[List[str], List[str]]:
    """
    Monta as listas de destinatários (To / Cc) da ocorrência, com base nas
    sending_rules configuradas na categoria. Cada variável de contexto é
    resolvida de forma isolada, evitando o acoplamento indevido entre ifs
    que causava NameError no sistema legado.
    """
    to_emails: List[str] = []
    cc_emails: List[str] = []

    if not occurrence.category:
        return to_emails, cc_emails

    for rule in occurrence.category.sending_rules:
        role = rule.role.lower()
        send_type = (rule.send_type or "to").lower()
        target_email = None

        if role == "president":
            president_dept = (
                db.query(Department)
                .filter(Department.name.ilike("%president%"))
                .first()
            )
            target_email = president_dept.manager_email if president_dept else None

        elif "cfo" in role:
            cfo_dept = (
                db.query(Department)
                .filter(Department.name.ilike("%cfo%"))
                .first()
            )
            target_email = cfo_dept.manager_email if cfo_dept else None

        elif role == "manager":
            employee = occurrence.employee
            target_email = (
                employee.department.manager_email
                if employee and employee.department
                else None
            )

        elif role == "offender":
            employee = occurrence.employee
            target_email = employee.email if employee else None

        else:
            logger.warning(f"Regra de envio com role desconhecida: {rule.role}")
            continue

        if not target_email:
            logger.info(f"Sem e-mail resolvido para role='{role}' na ocorrência {occurrence.id}")
            continue

        if send_type == "to":
            to_emails.append(target_email)
        else:
            cc_emails.append(target_email)

    return to_emails, cc_emails

EMAIL_TEMPLATE = """
<html><body>
<p>Prezado(a),</p>
<p>Uma ocorrência foi registrada e requer sua atenção.</p>
<p><strong>Título:</strong> {title}</p>
<p><strong>Descrição:</strong> {description}</p>
<p>Acesse o sistema para mais detalhes.</p>
</body></html>
"""


def send_occurrence_email(occurrence: Occurrence, to_emails: List[str], cc_emails: List[str]) -> bool:
    if not to_emails:
        logger.warning(f"Ocorrência {occurrence.id}: nenhum destinatário 'To' resolvido, e-mail não enviado")
        return False

    body = EMAIL_TEMPLATE.format(
        title=occurrence.title,
        description=occurrence.description or "-",
    )

    payload = {
        "To": to_emails,
        "CC": cc_emails,
        "Subject": f"Infringement System - {occurrence.title}",
        "Body": body,
    }

    try:
        response = requests.post(settings.smtp_relay_url, json=payload, timeout=10)
        response.raise_for_status()
        return True
    except requests.RequestException as exc:
        logger.error(f"Falha ao enviar e-mail da ocorrência {occurrence.id}: {exc}")
        return False