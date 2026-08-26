from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.repositories import EmployeeRepository
from app.schemas import EmployeeCreate, EmployeeRead, PaginatedResponse
from app.dependencies.auth import get_current_user, require_admin
from app.core.security import hash_password
from app.models import Employee

router = APIRouter(prefix="/employees", tags=["employees"])


def _to_employee_read(emp: Employee) -> dict:
    """Converte o Model (is_admin: 'Y'/'N') para o formato esperado pelo Schema (is_admin: bool)."""
    return {
        "id": emp.id,
        "name": emp.name,
        "username": emp.username,
        "email": emp.email,
        "global_id": emp.global_id,
        "company": emp.company,
        "role": emp.role,
        "department_id": emp.department_id,
        "is_admin": emp.is_admin == "Y",
        "department": emp.department,
    }


@router.get("/", response_model=PaginatedResponse[EmployeeRead])
def list_employees(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    filter_text: Optional[str] = Query(None, alias="filter"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
):
    repo = EmployeeRepository(db)
    items, total = repo.get_filtered(filter_text=filter_text, page=page, size=size)
    return PaginatedResponse(
        items=[_to_employee_read(e) for e in items],
        total=total,
        page=page,
        size=size,
    )


@router.get("/{id}", response_model=EmployeeRead)
def get_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = EmployeeRepository(db)
    emp = repo.get(id)
    if not emp:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    return _to_employee_read(emp)


@router.post("/", response_model=EmployeeRead, status_code=201)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_admin),
):
    repo = EmployeeRepository(db)
    if repo.get_by_username(payload.username):
        raise HTTPException(status_code=409, detail="Username já cadastrado")

    data = payload.model_dump()
    plain_password = data.pop("password", None)
    is_admin = data.pop("is_admin", False)

    data["hashed_password"] = hash_password(plain_password) if plain_password else None
    data["is_admin"] = "Y" if is_admin else "N"

    try:
        emp = repo.create(data)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Erro de integridade (username/email duplicado ou departamento inválido)")

    return _to_employee_read(emp)


@router.put("/{id}", response_model=EmployeeRead)
def update_employee(
    id: int,
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_admin),
):
    repo = EmployeeRepository(db)

    data = payload.model_dump()
    plain_password = data.pop("password", None)
    is_admin = data.pop("is_admin", False)

    if plain_password:
        data["hashed_password"] = hash_password(plain_password)
    data["is_admin"] = "Y" if is_admin else "N"

    updated = repo.update(id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    return _to_employee_read(updated)


@router.delete("/{id}", status_code=204)
def delete_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_admin),
):
    repo = EmployeeRepository(db)
    if not repo.delete(id):
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")