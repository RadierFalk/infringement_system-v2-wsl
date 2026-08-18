from datetime import datetime


def test_create_occurrence(client, common_headers, common_user, department):
    from app.models import OccurrenceCategory
    # cria categoria auxiliar direto no banco de teste via fixture db_session seria ideal,
    # mas aqui usamos a própria API para simular o fluxo real do frontend

    response = client.post(
        "/occurrences/",
        headers=common_headers,
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
    response = client.get("/occurrences/?page=1&size=5", headers=common_headers)

    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"items", "total", "page", "size"}
    assert data["page"] == 1
    assert data["size"] == 5


def test_feedback_blocked_when_occurrence_not_sent(client, common_headers, common_user):
    create_resp = client.post(
        "/occurrences/",
        headers=common_headers,
        json={"title": "Teste bloqueio", "date": datetime.now().isoformat(), "employee_id": common_user.id},
    )
    occurrence_id = create_resp.json()["id"]

    feedback_resp = client.post(
        "/feedbacks/",
        headers=common_headers,
        json={"occurrence_id": occurrence_id, "feedback_text": "teste", "respondent": "func.teste"},
    )

    assert feedback_resp.status_code == 400