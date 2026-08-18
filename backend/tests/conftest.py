import os
os.environ["ENV_FILE"] = ".env.test"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.config import Settings
from app.models import Base
from app.database import get_db
from app.main import app
from app.core.security import hash_password

# Settings apontando explicitamente para o .env.test
test_settings = Settings(_env_file=".env.test")

engine = create_engine(
    test_settings.database_url,
    connect_args={"charset": "utf8mb4"},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def create_test_schema():
    """Cria todas as tabelas uma vez no início da sessão de testes e remove ao final."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    """
    Cada teste roda dentro de uma transação própria que é revertida (rollback)
    ao final — garante isolamento total entre testes, sem precisar recriar
    o schema a cada execução (o que seria muito lento).
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db_session):
    """Cliente HTTP de teste, com o banco substituído pela sessão isolada acima."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# ---------- Fixtures de dados prontos ----------

@pytest.fixture()
def department(db_session):
    from app.models import Department
    dept = Department(name="TI", manager_email="ti@teste.com", director_name="Diretor TI")
    db_session.add(dept)
    db_session.commit()
    db_session.refresh(dept)
    return dept


@pytest.fixture()
def admin_user(db_session, department):
    from app.models import Employee
    user = Employee(
        name="Admin Teste",
        username="admin.teste",
        email="admin.teste@teste.com",
        department_id=department.id,
        hashed_password=hash_password("admin123"),
        is_admin="Y",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def common_user(db_session, department):
    from app.models import Employee
    user = Employee(
        name="Funcionario Teste",
        username="func.teste",
        email="func.teste@teste.com",
        department_id=department.id,
        hashed_password=hash_password("senha123"),
        is_admin="N",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def admin_headers(client, admin_user):
    response = client.post("/auth/login", json={"username": "admin.teste", "password": "admin123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def common_headers(client, common_user):
    response = client.post("/auth/login", json={"username": "func.teste", "password": "senha123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}