def test_login_success(client, admin_user):
    response = client.post(
        "/auth/login",
        json={"username": "admin.teste", "password": "admin123"},
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, admin_user):
    response = client.post(
        "/auth/login",
        json={
            "username": "admin.teste",
            "password": "senha_errada",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Usuário ou senha inválidos"


def test_login_nonexistent_user(client):
    response = client.post(
        "/auth/login",
        json={
            "username": "nao.existe",
            "password": "qualquer",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Usuário ou senha inválidos"


def test_me_without_token_returns_401(client):
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_me_with_valid_token(client, admin_headers):
    response = client.get("/auth/me", headers=admin_headers)

    assert response.status_code == 200

    data = response.json()

    assert data["username"] == "admin.teste"
    assert data["user_type"] == "super_admin"