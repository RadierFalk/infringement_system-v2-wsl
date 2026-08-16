from typing import List
from sqlalchemy import func
from sqlalchemy.orm import Session

from .base_repository import BaseRepository
from app.models import Department, Employee


class DepartmentRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(Department, db)

    def get_all_with_employee_count(self) -> List[dict]:
        """Retorna departamentos com a contagem de funcionários vinculados."""
        results = (
            self.db.query(
                Department,
                func.coalesce(func.count(Employee.id), 0).label("employee_count"),
            )
            .outerjoin(Employee, Employee.department_id == Department.id)
            .group_by(Department.id)
            .all()
        )

        return [
            {
                "id": dept.id,
                "name": dept.name,
                "manager_email": dept.manager_email,
                "director_name": dept.director_name,
                "employee_count": count,
            }
            for dept, count in results
        ]

    def get_by_name(self, name: str) -> Department | None:
        return self.db.query(Department).filter(Department.name == name).first()