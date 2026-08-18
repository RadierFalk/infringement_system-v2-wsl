from datetime import datetime
from app.repositories import OccurrenceRepository, EmployeeRepository
from app.models.occurrence import StatusEnum


def test_update_status(db_session, department):
    emp_repo = EmployeeRepository(db_session)
    occ_repo = OccurrenceRepository(db_session)

    emp = emp_repo.create({"name": "Func", "username": "func.occ", "department_id": department.id})
    occ = occ_repo.create({"title": "Teste", "date": datetime.now(), "employee_id": emp.id})

    assert occ.status == StatusEnum.CREATED

    updated = occ_repo.update_status(occ.id, StatusEnum.SENT)
    assert updated.status == StatusEnum.SENT


def test_update_status_returns_none_for_invalid_id(db_session):
    occ_repo = OccurrenceRepository(db_session)
    result = occ_repo.update_status(99999, StatusEnum.SENT)
    assert result is None