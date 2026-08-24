from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    username = Column(String(150), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    global_id = Column(String(50), nullable=True, index=True)
    company = Column(String(100), nullable=True, index=True)
    role = Column(String(150), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    is_admin = Column("is_admin", String(1), nullable=False, server_default="N")

    department_id = Column(Integer, ForeignKey("departments.id"))
    department = relationship("Department", back_populates="employees")
    occurrences = relationship("Occurrence", back_populates="employee")