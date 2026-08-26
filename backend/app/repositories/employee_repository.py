from typing import List, Optional, Tuple
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from .base_repository import BaseRepository
from app.models import Employee, Department


class EmployeeRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(Employee, db)

    def get_by_username(self, username: str) -> Optional[Employee]:
        return self.db.query(Employee).filter(Employee.username == username).first()

    def get_by_email(self, email: str) -> Optional[Employee]:
        return self.db.query(Employee).filter(Employee.email == email).first()

    def get_filtered(
        self,
        filter_text: Optional[str] = None,
        page: int = 1,
        size: int = 10,
    ) -> Tuple[List[Employee], int]:
        query = self.db.query(Employee).options(joinedload(Employee.department))

        if filter_text:
            query = query.join(Department).filter(
                or_(
                    Employee.name.ilike(f"%{filter_text}%"),
                    Employee.username.ilike(f"%{filter_text}%"),
                    Employee.role.ilike(f"%{filter_text}%"),
                    Department.name.ilike(f"%{filter_text}%"),
                )
            )

        total = query.count()
        items = query.offset((page - 1) * size).limit(size).all()

        return items, total