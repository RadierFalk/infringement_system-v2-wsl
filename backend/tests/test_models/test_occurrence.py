from datetime import datetime
from app.models import Occurrence, StatusEnum


def test_occurrence_default_status_is_created(db_session, department):
    from app.models import Employee
    emp = Employee(name="Func", username="func.status", department_id=department.id)
    db_session.add(emp)
    db_session.commit()

    occ = Occurrence(title="Teste", date=datetime.now(), employee_id=emp.id)
    db_session.add(occ)
    db_session.commit()
    db_session.refresh(occ)

    assert occ.status == StatusEnum.CREATED


def test_get_next_status_sequence():
    occ = Occurrence(status=StatusEnum.CREATED)
    assert occ.get_next_status() == StatusEnum.SENT

    occ.status = StatusEnum.SENT
    assert occ.get_next_status() == StatusEnum.RESPONSE_RECEIVED

    occ.status = StatusEnum.RESOLVED
    assert occ.get_next_status() is None  # não há próximo status após RESOLVED


def test_update_status_changes_value():
    occ = Occurrence(status=StatusEnum.CREATED)
    occ.update_status(StatusEnum.SENT)
    assert occ.status == StatusEnum.SENT