from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class OccurrenceCategory(Base):
    __tablename__ = "occurrence_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True, index=True)
    description = Column(String(500), nullable=False)

    occurrences = relationship("Occurrence", back_populates="category")
    sending_rules = relationship(
        "OccurrenceCategorySendingRule",
        back_populates="category",
        cascade="all, delete-orphan",
    )