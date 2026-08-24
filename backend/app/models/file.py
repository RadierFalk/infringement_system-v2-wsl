from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)

    occurrences = relationship("Occurrence", back_populates="file")