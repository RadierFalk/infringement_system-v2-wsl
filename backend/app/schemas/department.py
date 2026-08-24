from pydantic import BaseModel
from typing import Optional


class DepartmentBase(BaseModel):
    name: str
    manager_email: Optional[str] = None
    director_name: Optional[str] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentRead(DepartmentBase):
    id: int

    class Config:
        from_attributes = True


class DepartmentWithCount(DepartmentBase):
    id: int
    employee_count: int = 0

    class Config:
        from_attributes = True