import pytest
from sqlalchemy.exc import IntegrityError
from app.models import Employee


def test_create_employee(db_session, department):
    emp = Employee(name="Joao Silva", username="joao.silva", department_id=department.id)
    db_session.add(emp)
    db_session.commit()
    db_session.refresh(emp)

    assert emp.id is not None
    assert emp.name == "Joao Silva"
    assert emp.department_id == department.id


def test_username_must_be_unique(db_session, department):
    emp1 = Employee(name="Pessoa 1", username="duplicado", department_id=department.id)
    db_session.add(emp1)
    db_session.commit()

    emp2 = Employee(name="Pessoa 2", username="duplicado", department_id=department.id)
    db_session.add(emp2)

    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_email_must_be_unique(db_session, department):
    emp1 = Employee(name="Pessoa 1", username="user1", email="mesmo@teste.com", department_id=department.id)
    db_session.add(emp1)
    db_session.commit()

    emp2 = Employee(name="Pessoa 2", username="user2", email="mesmo@teste.com", department_id=department.id)
    db_session.add(emp2)

    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()