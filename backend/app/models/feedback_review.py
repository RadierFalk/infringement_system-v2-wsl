from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from .base import Base


def manaus_now() -> datetime:
    return datetime.now(ZoneInfo("America/Manaus")).replace(tzinfo=None)


class FeedbackReview(Base):
    __tablename__ = "feedback_reviews"

    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedbacks.id"), nullable=False)
    review_text = Column(Text, nullable=True)
    reviewed_by = Column(String(150), nullable=False)
    date = Column(DateTime, default=manaus_now, nullable=False)
    is_accepted = Column(Boolean, nullable=False)

    feedback = relationship("Feedback", back_populates="review")