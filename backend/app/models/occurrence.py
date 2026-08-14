from datetime import datetime
from enum import Enum as PyEnum
from zoneinfo import ZoneInfo

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from .base import Base


def manaus_now() -> datetime:
    return datetime.now(ZoneInfo("America/Manaus")).replace(tzinfo=None)


class StatusEnum(PyEnum):
    CREATED = "Created"
    SENT = "Sent"
    RESPONSE_RECEIVED = "Response received"
    RESPONSE_REJECTED = "Response rejected"
    RESOLVED = "Resolved"


class Occurrence(Base):
    __tablename__ = "occurrences"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    description = Column(String(2000), nullable=True)
    status = Column(SQLAlchemyEnum(StatusEnum), index=True, default=StatusEnum.CREATED)
    date = Column(DateTime, default=manaus_now, nullable=False)

    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    employee = relationship("Employee", back_populates="occurrences")

    file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    file = relationship("File", back_populates="occurrences")

    feedbacks = relationship("Feedback", back_populates="occurrence")

    category_id = Column(Integer, ForeignKey("occurrence_categories.id"), nullable=True)
    category = relationship("OccurrenceCategory", back_populates="occurrences")

    def get_next_status(self):
        order = [
            StatusEnum.CREATED,
            StatusEnum.SENT,
            StatusEnum.RESPONSE_RECEIVED,
            StatusEnum.RESPONSE_REJECTED,
            StatusEnum.RESOLVED,
        ]
        try:
            return order[order.index(self.status) + 1]
        except (ValueError, IndexError):
            return None

    def update_status(self, new_status: StatusEnum):
        self.status = new_status