from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, index=True, nullable=False)
    manager_email = Column(String(255), index=True, nullable=True)
    director_name = Column(String(150), nullable=True)

    employees = relationship("Employee", back_populates="department")