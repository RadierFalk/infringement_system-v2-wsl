from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.repositories import OccurrenceCategoryRepository
from app.schemas import (
    OccurrenceCategoryCreate,
    OccurrenceCategoryRead,
    SendingRuleCreate,
    SendingRuleRead,
)
from app.dependencies.auth import get_current_user, require_admin
from app.models import Employee, OccurrenceCategorySendingRule

router = APIRouter(prefix="/occurrence-categories", tags=["occurrence-categories"])


@router.get("/", response_model=List[OccurrenceCategoryRead])
def list_categories(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = OccurrenceCategoryRepository(db)
    return repo.get_all_with_sending_rules()


@router.get("/{id}", response_model=OccurrenceCategoryRead)
def get_category(
    id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = OccurrenceCategoryRepository(db)
    category = repo.get(id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return category


@router.post("/", response_model=OccurrenceCategoryRead, status_code=201)
def create_category(
    payload: OccurrenceCategoryCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_admin),
):
    repo = OccurrenceCategoryRepository(db)
    return repo.create(payload.model_dump())


@router.put("/{id}", response_model=OccurrenceCategoryRead)
def update_category(
    id: int,
    payload: OccurrenceCategoryCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_admin),
):
    repo = OccurrenceCategoryRepository(db)
    updated = repo.update(id, payload.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return updated


@router.delete("/{id}", status_code=204)
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_admin),
):
    repo = OccurrenceCategoryRepository(db)
    if not repo.delete(id):
        raise HTTPException(status_code=404, detail="Categoria não encontrada")


@router.post("/{category_id}/sending-rules", response_model=SendingRuleRead, status_code=201)
def add_sending_rule(
    category_id: int,
    payload: SendingRuleCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_admin),
):
    repo = OccurrenceCategoryRepository(db)
    category = repo.get(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")

    rule = OccurrenceCategorySendingRule(
        category_id=category_id,
        role=payload.role,
        send_type=payload.send_type,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule