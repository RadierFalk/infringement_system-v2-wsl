from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.repositories import FeedbackRepository, FeedbackReviewRepository
from app.schemas import FeedbackCreate, FeedbackRead, FeedbackReviewCreate, FeedbackReviewRead
from app.dependencies.auth import get_current_user, require_super_admin
from app.models import Employee
from app.repositories import OccurrenceRepository
from app.models.occurrence import StatusEnum

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
    feedback_repo = FeedbackRepository(db)
    occurrence_repo = OccurrenceRepository(db)

    occurrence = occurrence_repo.get(payload.occurrence_id)

    if not occurrence:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")

    if occurrence.status not in (StatusEnum.SENT, StatusEnum.RESPONSE_REJECTED):
        raise HTTPException(
            status_code=400,
            detail=f"Não é possível registrar feedback com a ocorrência no status '{occurrence.status.value}'",
        )

    feedback = feedback_repo.create(payload.model_dump())
    occurrence_repo.update_status(
        payload.occurrence_id,
        StatusEnum.RESPONSE_RECEIVED
    )

    return feedback


@router.post("/{feedback_id}/review", response_model=FeedbackReviewRead, status_code=201)
def review_feedback(
    feedback_id: int,
    payload: FeedbackReviewCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_super_admin),
):
    feedback_repo = FeedbackRepository(db)
    review_repo = FeedbackReviewRepository(db)
    occurrence_repo = OccurrenceRepository(db)

    feedback = feedback_repo.get(feedback_id)

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback não encontrado")

    occurrence = occurrence_repo.get(feedback.occurrence_id)

    if not occurrence or occurrence.status != StatusEnum.RESPONSE_RECEIVED:
        raise HTTPException(
            status_code=400,
            detail="Só é possível revisar feedback de ocorrências com status 'Response received'",
        )

    data = payload.model_dump()
    data["feedback_id"] = feedback_id

    review = review_repo.create(data)

    new_status = (
        StatusEnum.RESOLVED
        if payload.is_accepted
        else StatusEnum.RESPONSE_REJECTED
    )

    occurrence_repo.update_status(
        feedback.occurrence_id,
        new_status
    )

    return review