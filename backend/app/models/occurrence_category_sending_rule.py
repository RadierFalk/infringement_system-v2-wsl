from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from .base import Base


class OccurrenceCategorySendingRule(Base):
    __tablename__ = "occurrence_category_sending_rules"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("occurrence_categories.id"), nullable=False)
    role = Column(String(50), nullable=False)
    send_type = Column(String(10), nullable=False)

    category = relationship("OccurrenceCategory", back_populates="sending_rules")