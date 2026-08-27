from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.repositories import OccurrenceRepository
from app.schemas import OccurrenceCreate, OccurrenceRead, PaginatedResponse
from app.dependencies.auth import get_current_user, require_super_admin
from app.models import Employee
from app.models.employee import UserType
from app.services.email_service import resolve_recipients, send_occurrence_email
from app.models.occurrence import StatusEnum


router = APIRouter(prefix="/occurrences", tags=["occurrences"])


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
    # Funcionário 'normal' só pode visualizar ocorrências
    # do próprio departamento.
    #
    # Admin e Super Admin podem consultar outros departamentos.
    effective_department_id = department_id

    if current_user.user_type == UserType.NORMAL:
        effective_department_id = current_user.department_id

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


@router.get("/employee/{employee_id}", response_model=list[OccurrenceRead])
def list_occurrences_by_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = OccurrenceRepository(db)
    return repo.get_by_employee(employee_id)


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

    return occurrence


@router.post("/", response_model=OccurrenceRead, status_code=201)
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

    to_emails, cc_emails = resolve_recipients(db, occurrence)
    sent = send_occurrence_email(
        occurrence,
        to_emails,
        cc_emails,
    )

    if sent:
        repo.update_status(id, StatusEnum.SENT)

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