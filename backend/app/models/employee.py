import enum

from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from .base import Base


class UserType(str, enum.Enum):
    SUPER_ADMIN = "super_admin" #GA E Monitoria
    ADMIN = "admin" # RH, Jurídico, Presidentes
    NORMAL = "normal" # Gestores/Diretores de departamento

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
    
    user_type = Column(
        SAEnum(
            UserType, 
            name="user_type_enum", 
            native_enum=False, 
            length=20,
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
            ),
        nullable=False,
        server_default=UserType.NORMAL.value,
    )

    department_id = Column(Integer, ForeignKey("departments.id"))
    department = relationship("Department", back_populates="employees")
    occurrences = relationship("Occurrence", back_populates="employee")

    @property
    def is_admin(self) -> bool:
        return self.user_type in (UserType.SUPER_ADMIN, UserType.ADMIN)
