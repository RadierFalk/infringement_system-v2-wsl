from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.repositories import FeedbackRepository, FeedbackReviewRepository
from app.schemas import FeedbackCreate, FeedbackRead, FeedbackReviewCreate, FeedbackReviewRead
from app.dependencies.auth import get_current_user, require_admin
from app.models import Employee

router = APIRouter(prefix="/feedbacks", tags=["feedbacks"])


@router.get("/occurrence/{occurrence_id}", response_model=List[FeedbackRead])
def list_feedbacks_by_occurrence(
    occurrence_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = FeedbackRepository(db)
    return repo.get_by_occurrence_id(occurrence_id)


@router.get("/{id}", response_model=FeedbackRead)
def get_feedback(
    id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = FeedbackRepository(db)
    feedback = repo.get(id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback não encontrado")
    return feedback


@router.post("/", response_model=FeedbackRead, status_code=201)
def create_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    repo = FeedbackRepository(db)
    return repo.create(payload.model_dump())


@router.post("/{feedback_id}/review", response_model=FeedbackReviewRead, status_code=201)
def review_feedback(
    feedback_id: int,
    payload: FeedbackReviewCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_admin),
):
    feedback_repo = FeedbackRepository(db)
    review_repo = FeedbackReviewRepository(db)

    feedback = feedback_repo.get(feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback não encontrado")

    data = payload.model_dump()
    data["feedback_id"] = feedback_id
    return review_repo.create(data)