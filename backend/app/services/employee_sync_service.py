import logging
from typing import List, Dict, Any

from sqlalchemy.orm import Session

from app.repositories import EmployeeRepository, DepartmentRepository

logger = logging.getLogger(__name__)


def sync_employee_record(
    db: Session,
    item: Dict[str, Any],
    default_department_name: str = "N/A",
) -> None:
    """
    Cria ou atualiza um único registro de funcionário a partir de um payload
    externo normalizado. Função extraída para eliminar a duplicação de ~200
    linhas entre sync_employees_ihr() e sync_employees_active_directory()
    do sistema legado.

    Payload esperado (já normalizado pelo chamador):
        {"name": str, "email": str, "username": str,
         "global_id": str, "role": str, "department_name": str | None}
    """
    emp_repo = EmployeeRepository(db)
    dept_repo = DepartmentRepository(db)

    email = (item.get("email") or "").strip()
    username = item.get("username") or (email.split("@")[0] if email else None)

    if not email or not username:
        logger.info(f"Registro ignorado (sem e-mail/username válido): {item.get('name')}")
        return

    department_name = item.get("department_name") or default_department_name
    department = dept_repo.get_by_name(department_name)
    if not department:
        department = dept_repo.create({"name": department_name})

    existing = emp_repo.get_by_username(username) or emp_repo.get_by_email(email)

    data = {
        "name": item.get("name"),
        "username": username,
        "email": email,
        "global_id": item.get("global_id"),
        "role": item.get("role"),
        "department_id": department.id,
    }

    if existing:
        emp_repo.update(existing.id, data)
        logger.info(f"Funcionário atualizado: {username}")
    else:
        emp_repo.create(data)
        logger.info(f"Funcionário criado: {username}")


def sync_employees_bulk(db: Session, items: List[Dict[str, Any]]) -> Dict[str, int]:
    processed = 0
    for item in items:
        sync_employee_record(db, item)
        processed += 1
    return {"processed": processed}