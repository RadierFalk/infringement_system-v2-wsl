from pydantic import BaseModel
from typing import Optional
from app.models.employee import UserType
from .department import DepartmentRead


class EmployeeBase(BaseModel):
    name: str
    username: str
    email: Optional[str] = None
    global_id: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[int] = None


class EmployeeCreate(EmployeeBase):
    password: Optional[str] = None
    user_type: UserType = UserType.NORMAL


class EmployeeRead(EmployeeBase):
    id: int
    user_type: UserType
    department: Optional[DepartmentRead] = None

    class Config:
        from_attributes = True