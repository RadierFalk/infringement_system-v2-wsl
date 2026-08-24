from app.repositories import DepartmentRepository


def test_create_and_get_department(db_session):
    repo = DepartmentRepository(db_session)
    created = repo.create({"name": "Financeiro", "manager_email": "fin@teste.com"})

    found = repo.get(created.id)
    assert found is not None
    assert found.name == "Financeiro"


def test_get_by_name_returns_none_when_not_found(db_session):
    repo = DepartmentRepository(db_session)
    assert repo.get_by_name("Departamento Inexistente") is None


def test_get_all_with_employee_count(db_session, department):
    from app.models import Employee
    emp = Employee(name="Func", username="func.count", department_id=department.id)
    db_session.add(emp)
    db_session.commit()

    repo = DepartmentRepository(db_session)
    results = repo.get_all_with_employee_count()

    match = next(d for d in results if d["id"] == department.id)
    assert match["employee_count"] == 1