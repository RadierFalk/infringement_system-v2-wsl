from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from .file import FileRead


class FeedbackReviewBase(BaseModel):
    review_text: Optional[str] = None
    reviewed_by: str
    is_accepted: bool


class FeedbackReviewCreate(FeedbackReviewBase):
    feedback_id: int


class FeedbackReviewRead(FeedbackReviewBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True


class FeedbackBase(BaseModel):
    occurrence_id: int
    feedback_text: Optional[str] = None
    respondent: str


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackRead(FeedbackBase):
    id: int
    date: datetime
    feedback_file: Optional[FileRead] = None
    review: Optional[FeedbackReviewRead] = None

    class Config:
        from_attributes = True