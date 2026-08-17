from pydantic import BaseModel
from typing import Optional
from .department import DepartmentRead


class EmployeeBase(BaseModel):
    name: str
    username: str
    email: Optional[str] = None
    global_id: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    department_id: int


class EmployeeCreate(EmployeeBase):
    password: Optional[str] = None
    is_admin: Optional[bool] = False


class EmployeeRead(EmployeeBase):
    id: int
    is_admin: bool = False
    department: Optional[DepartmentRead] = None

    class Config:
        from_attributes = True