from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.repositories import OccurrenceRepository, OccurrenceCategoryRepository
from app.schemas import OccurrenceCreate, OccurrenceRead, PaginatedResponse
from app.dependencies.auth import get_current_user, require_super_admin
from app.models import Employee
from app.models.employee import UserType
from app.services.email_service import resolve_recipients, send_occurrence_email
from app.models.occurrence import StatusEnum


router = APIRouter(prefix="/occurrences", tags=["occurrences"])


def _effective_department_id(
    current_user: Employee,
    department_id: Optional[int],
) -> Optional[int]:
    """
    Regra de segurança única, reaproveitada em toda rota que filtra por
    departamento: 'normal' NUNCA escolhe o department_id — o valor vindo do
    cliente só vale pra super_admin/admin. Pra 'normal', sobrescrevemos com
    o departamento do próprio usuário autenticado (dado que vem do token,
    não do cliente, então não dá pra falsificar).
    """
    if current_user.user_type == UserType.NORMAL:
        return current_user.department_id

    return department_id


def _ensure_can_view_occurrence(
    current_user: Employee,
    occurrence: OccurrenceRead,
) -> None:
    """
    Correção do IDOR: a listagem (GET /) já filtrava por departamento pra
    'normal', mas as rotas que recebem um ID direto (GET /{id},
    GET /employee/{employee_id}, POST /{id}/send-notification) não
    reaplicavam essa regra — bastava trocar o número na URL pra ver/disparar
    notificação de ocorrência de outro departamento. Esta função centraliza
    a checagem, pra toda rota que recebe um ID de ocorrência.

    404 (não 403) de propósito: pra um 'normal' fora do departamento certo,
    a resposta é idêntica a "esse ID não existe" — não revelamos que existe
    uma ocorrência ali, só que ele não pode vê-la.
    """
    if current_user.user_type is not UserType.NORMAL:
        return

    if occurrence.employee.department_id != current_user.department_id:
        raise HTTPException(
            status_code=404,
            detail="Ocorrência não encontrada",
        )


@router.get("/", response_model=PaginatedResponse[OccurrenceRead])
def list_occurrences(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    filter_text: Optional[str] = Query(None, alias="filter"),
    status: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
):
    # Regra de segurança: funcionário 'normal' (gestor/diretor) NUNCA pode ver
    # ocorrências de outro departamento. O valor vindo do cliente só é
    # respeitado se quem está pedindo for super_admin ou admin.
    effective_department_id = _effective_department_id(
        current_user,
        department_id,
    )

    repo = OccurrenceRepository(db)

    items, total = repo.get_filtered(
        filter_text=filter_text,
        status=status,
        category_id=category_id,
        department_id=effective_department_id,
        page=page,
        size=size,
    )

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
    )


# ---------- Estatísticas pro dashboard ----------
# Dois segmentos de path (/stats/algo), então nunca colidem com GET /{id}
# (que só casa com um segmento) — não precisa se preocupar com ordem aqui.


@router.get("/stats/available-years")
def get_available_years(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    department_id: Optional[int] = Query(None),
):
    effective_department_id = _effective_department_id(
        current_user,
        department_id,
    )

    repo = OccurrenceRepository(db)
    years = repo.get_available_years(
        department_id=effective_department_id,
    )

    return {"years": years}


@router.get("/stats/monthly-by-category")
def get_monthly_by_category(
    year: int = Query(...),
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    effective_department_id = _effective_department_id(
        current_user,
        department_id,
    )

    repo = OccurrenceRepository(db)

    rows = repo.get_monthly_counts_by_category(
        year=year,
        department_id=effective_department_id,
    )

    # (mes, category_id) -> total — monta a matriz completa com zero
    # explícito nos meses/categorias sem ocorrência, em vez de deixar
    # buracos que o frontend teria que preencher na mão.
    counts_map = {
        (month, category_id): total
        for month, category_id, total in rows
    }

    category_repo = OccurrenceCategoryRepository(db)
    categories = sorted(
        category_repo.get_all(),
        key=lambda c: c.name,
    )

    category_ids = [c.id for c in categories]

    category_items = [
        {"id": c.id, "name": c.name}
        for c in categories
    ]

    # Ocorrência sem categoria (category_id NULL) existe no model — se
    # ignorássemos isso aqui, o total do gráfico ficaria menor que o total
    # real de ocorrências do ano, de um jeito silencioso e difícil de notar.
    if any(cid is None for (_, cid) in counts_map.keys()):
        category_items.append(
            {"id": None, "name": "Sem categoria"}
        )
        category_ids.append(None)

    data = [
        {
            "month": month,
            "counts": [
                counts_map.get((month, category_id), 0)
                for category_id in category_ids
            ],
        }
        for month in range(1, 13)
    ]

    return {
        "year": year,
        "categories": category_items,
        "data": data,
    }


@router.get(
    "/employee/{employee_id}",
    response_model=list[OccurrenceRead],
)
def list_occurrences_by_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = OccurrenceRepository(db)
    occurrences = repo.get_by_employee(employee_id)

    # Mesma regra de posse do get_occurrence: um 'normal' só pode listar
    # ocorrências de funcionário do próprio departamento. Checa a partir do
    # primeiro item (todas pertencem ao mesmo employee_id, logo ao mesmo
    # departamento) — se a lista vier vazia não há nada a esconder.
    if occurrences:
        _ensure_can_view_occurrence(
            current_user,
            occurrences[0],
        )

    return occurrences


@router.get("/{id}", response_model=OccurrenceRead)
def get_occurrence(
    id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = OccurrenceRepository(db)
    occurrence = repo.get(id)

    if not occurrence:
        raise HTTPException(
            status_code=404,
            detail="Ocorrência não encontrada",
        )

    _ensure_can_view_occurrence(
        current_user,
        occurrence,
    )

    return occurrence


@router.post(
    "/",
    response_model=OccurrenceRead,
    status_code=201,
)
def create_occurrence(
    payload: OccurrenceCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_super_admin),
):
    repo = OccurrenceRepository(db)

    data = payload.model_dump()
    created = repo.create(data)

    return repo.get(created.id)


@router.post("/{id}/send-notification")
def send_notification(
    id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = OccurrenceRepository(db)
    occurrence = repo.get(id)

    if not occurrence:
        raise HTTPException(
            status_code=404,
            detail="Ocorrência não encontrada",
        )

    to_emails, cc_emails = resolve_recipients(
        db,
        occurrence,
    )

    sent = send_occurrence_email(
        occurrence,
        to_emails,
        cc_emails,
    )

    if sent:
        repo.update_status(
            id,
            StatusEnum.SENT,
        )

    return {
        "sent": sent,
        "to": to_emails,
        "cc": cc_emails,
        "status": occurrence.status.value,
    }


@router.delete("/{id}", status_code=204)
def delete_occurrence(
    id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_super_admin),
):
    repo = OccurrenceRepository(db)

    if not repo.delete(id):
        raise HTTPException(
            status_code=404,
            detail="Ocorrência não encontrada",
        )