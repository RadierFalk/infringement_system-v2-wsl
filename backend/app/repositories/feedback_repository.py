from typing import List
from sqlalchemy.orm import Session

from .base_repository import BaseRepository
from app.models import Feedback


class FeedbackRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(Feedback, db)

    def get_by_occurrence_id(self, occurrence_id: int) -> List[Feedback]:
        return (
            self.db.query(Feedback)
            .filter(Feedback.occurrence_id == occurrence_id)
            .all()
        )