from typing import List
from sqlalchemy.orm import Session, joinedload

from .base_repository import BaseRepository
from app.models import OccurrenceCategory


class OccurrenceCategoryRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(OccurrenceCategory, db)

    def get_all_with_sending_rules(self) -> List[OccurrenceCategory]:
        return (
            self.db.query(OccurrenceCategory)
            .options(joinedload(OccurrenceCategory.sending_rules))
            .all()
        )