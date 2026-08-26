from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .base import Base


def manaus_now() -> datetime:
    return datetime.now(ZoneInfo("America/Manaus")).replace(tzinfo=None)


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    occurrence_id = Column(Integer, ForeignKey("occurrences.id"))
    occurrence = relationship("Occurrence", back_populates="feedbacks")

    feedback_text = Column(String(2000), nullable=True)
    feedback_file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    feedback_file = relationship("File", foreign_keys=[feedback_file_id])

    date = Column(DateTime, default=manaus_now, nullable=False)
    respondent = Column(String(150), nullable=False)

    review = relationship(
        "FeedbackReview", uselist=False, back_populates="feedback", cascade="all, delete-orphan"
    )