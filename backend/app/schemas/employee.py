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
    pass


class EmployeeRead(EmployeeBase):
    id: int
    department: Optional[DepartmentRead] = None

    class Config:
        from_attributes = True