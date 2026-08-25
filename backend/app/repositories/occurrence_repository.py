from typing import List, Optional, Tuple
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from .base_repository import BaseRepository
from app.models import Occurrence, Employee, Department, OccurrenceCategory
from app.models import Occurrence, Employee, Department, OccurrenceCategory
from app.models.occurrence import StatusEnum


class OccurrenceRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(Occurrence, db)

    def get_by_employee(self, employee_id: int) -> List[Occurrence]:
        return (
            self.db.query(Occurrence)
            .filter(Occurrence.employee_id == employee_id)
            .all()
        )

    def get_filtered(
            self,
            filter_text: Optional[str] = None,
            status: Optional[str] = None,
            category_id: Optional[int] = None,
            department_id: Optional[int] = None,
            page: int = 1,
            size: int = 10,
        ) -> Tuple[List[Occurrence], int]:
        query = self.db.query(Occurrence).options(
            joinedload(Occurrence.employee).joinedload(Employee.department),
            joinedload(Occurrence.file),
            joinedload(Occurrence.category),
        )

        # Join explícito é obrigatório sempre que formos filtrar por uma coluna
        # de Employee (department_id) ou por texto que também busca em
        # Employee/Department. Sem isso, o SQLAlchemy adiciona Employee "solto"
        # no FROM (cross join) em vez de conectar via occurrence.employee_id —
        # o filtro "roda" sem erro, mas devolve linhas erradas.
        if filter_text or department_id:
            query = query.join(Employee)

        if filter_text:
            query = query.join(Department).filter(
                or_(
                    Occurrence.title.ilike(f"%{filter_text}%"),
                    Occurrence.description.ilike(f"%{filter_text}%"),
                    Employee.name.ilike(f"%{filter_text}%"),
                    Department.name.ilike(f"%{filter_text}%"),
                )
            )

        if status:
            query = query.filter(Occurrence.status == status)

        if category_id:
            query = query.filter(Occurrence.category_id == category_id)

        if department_id:
            query = query.filter(Employee.department_id == department_id)

        total = query.count()
        items = (
            query.order_by(Occurrence.date.desc())
            .offset((page - 1) * size)
            .limit(size)
            .all()
        )

        return items, total

    def update_status(self, occurrence_id: int, new_status: StatusEnum) -> Occurrence | None:
        occurrence = self.get(occurrence_id)
        if not occurrence:
            return None
        occurrence.update_status(new_status)
        self.db.commit()
        self.db.refresh(occurrence)
        return occurrence