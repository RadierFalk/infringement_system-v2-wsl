from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.repositories import DepartmentRepository
from app.schemas import DepartmentCreate, DepartmentRead, DepartmentWithCount
from app.dependencies.auth import get_current_user, require_super_admin
from app.models import Employee

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("/", response_model=List[DepartmentWithCount])
def list_departments(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = DepartmentRepository(db)
    return repo.get_all_with_employee_count()


@router.get("/{id}", response_model=DepartmentRead)
def get_department(
    id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = DepartmentRepository(db)
    dept = repo.get(id)

    if not dept:
        raise HTTPException(
            status_code=404,
            detail="Departamento não encontrado",
        )

    return dept


@router.post("/", response_model=DepartmentRead, status_code=201)
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_super_admin),
):
    repo = DepartmentRepository(db)

    if repo.get_by_name(payload.name):
        raise HTTPException(
            status_code=409,
            detail="Já existe um departamento com esse nome",
        )

    return repo.create(payload.model_dump())


@router.put("/{id}", response_model=DepartmentRead)
def update_department(
    id: int,
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_super_admin),
):
    repo = DepartmentRepository(db)
    updated = repo.update(id, payload.model_dump())

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Departamento não encontrado",
        )

    return updated


@router.delete("/{id}", status_code=204)
def delete_department(
    id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_super_admin),
):
    repo = DepartmentRepository(db)

    try:
        deleted = repo.delete(id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=(
                "Não é possível excluir: há funcionários vinculados "
                "a este departamento"
            ),
        )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Departamento não encontrado",
        )