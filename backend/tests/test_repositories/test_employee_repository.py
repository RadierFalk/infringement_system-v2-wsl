from app.repositories import EmployeeRepository


def test_get_filtered_by_name(db_session, department):
    repo = EmployeeRepository(db_session)
    repo.create({"name": "Ana Souza", "username": "ana.souza", "department_id": department.id})
    repo.create({"name": "Bruno Lima", "username": "bruno.lima", "department_id": department.id})

    items, total = repo.get_filtered(filter_text="Ana", page=1, size=10)

    assert total == 1
    assert items[0].name == "Ana Souza"


def test_pagination_respects_size(db_session, department):
    repo = EmployeeRepository(db_session)
    for i in range(5):
        repo.create({"name": f"Pessoa {i}", "username": f"pessoa{i}", "department_id": department.id})

    items, total = repo.get_filtered(page=1, size=2)

    assert total == 5
    assert len(items) == 2