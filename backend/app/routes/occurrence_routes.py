from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.repositories import OccurrenceRepository
from app.schemas import OccurrenceCreate, OccurrenceRead, PaginatedResponse
from app.dependencies.auth import get_current_user
from app.models import Employee

router = APIRouter(prefix="/occurrences", tags=["occurrences"])


@router.get("/", response_model=PaginatedResponse[OccurrenceRead])
def list_occurrences(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    filter_text: Optional[str] = Query(None, alias="filter"),
    status: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
):
    repo = OccurrenceRepository(db)
    items, total = repo.get_filtered(
        filter_text=filter_text,
        status=status,
        category_id=category_id,
        page=page,
        size=size,
    )
    return PaginatedResponse(items=items, total=total, page=page, size=size)


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
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
    return occurrence


@router.post("/", response_model=OccurrenceRead, status_code=201)
def create_occurrence(
    payload: OccurrenceCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = OccurrenceRepository(db)
    data = payload.model_dump()
    created = repo.create(data)
    return repo.get(created.id)


@router.delete("/{id}", status_code=204)
def delete_occurrence(
    id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = OccurrenceRepository(db)
    if not repo.delete(id):
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")