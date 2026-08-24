from typing import List
from sqlalchemy.orm import Session

from .base_repository import BaseRepository
from app.models import FeedbackReview


class FeedbackReviewRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(FeedbackReview, db)

    def get_by_feedback_id(self, feedback_id: int) -> List[FeedbackReview]:
        return (
            self.db.query(FeedbackReview)
            .filter(FeedbackReview.feedback_id == feedback_id)
            .all()
        )