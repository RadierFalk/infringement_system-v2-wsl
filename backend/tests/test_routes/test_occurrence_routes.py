from datetime import datetime


def test_create_occurrence(client, admin_headers, common_user, department):
    response = client.post(
        "/api/occurrences/",
        headers=admin_headers,  # criar ocorrência agora é exclusivo de super_admin
        json={
            "title": "Atraso registrado via teste",
            "date": datetime.now().isoformat(),
            "employee_id": common_user.id,
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "Created"
    assert data["employee"]["username"] == "func.teste"


def test_occurrence_pagination_shape(client, common_headers, common_user):
    response = client.get("/api/occurrences/?page=1&size=5", headers=common_headers)

    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"items", "total", "page", "size"}
    assert data["page"] == 1
    assert data["size"] == 5


def test_feedback_blocked_when_occurrence_not_sent(client, admin_headers, common_headers, common_user):
    create_resp = client.post(
        "/api/occurrences/",
        headers=admin_headers,  # criação é super_admin
        json={"title": "Teste bloqueio", "date": datetime.now().isoformat(), "employee_id": common_user.id},
    )
    occurrence_id = create_resp.json()["id"]

    feedback_resp = client.post(
        "/api/feedbacks/",
        headers=common_headers,  # responder/dar feedback continua sendo o funcionário comum
        json={"occurrence_id": occurrence_id, "feedback_text": "teste", "respondent": "func.teste"},
    )

    assert feedback_resp.status_code == 400