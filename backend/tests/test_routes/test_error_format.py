def test_validation_error_has_consistent_format(client, admin_headers):
    response = client.post(
        "/api/departments/",
        headers=admin_headers,
        json={},  # falta o campo obrigatório "name"
    )

    assert response.status_code == 422

    body = response.json()

    assert "detail" in body
    assert isinstance(body["detail"], str)  # não é mais uma lista de objetos