from datetime import datetime
from app.models import Employee, Occurrence, OccurrenceCategory, OccurrenceCategorySendingRule
from app.services.email_service import resolve_recipients


def test_resolve_recipients_offender_role(db_session, department):
    employee = Employee(
        name="Ofensor", username="ofensor.teste", email="ofensor@teste.com",
        department_id=department.id,
    )
    db_session.add(employee)
    db_session.commit()

    category = OccurrenceCategory(name="CAT_TESTE", description="desc")
    db_session.add(category)
    db_session.commit()

    rule = OccurrenceCategorySendingRule(category_id=category.id, role="offender", send_type="to")
    db_session.add(rule)
    db_session.commit()

    occurrence = Occurrence(
        title="Teste", date=datetime.now(), employee_id=employee.id, category_id=category.id,
    )
    db_session.add(occurrence)
    db_session.commit()
    db_session.refresh(occurrence)

    to_emails, cc_emails = resolve_recipients(db_session, occurrence)

    assert to_emails == ["ofensor@teste.com"]
    assert cc_emails == []


def test_resolve_recipients_manager_role_cc(db_session, department):
    employee = Employee(
        name="Func", username="func.manager.rule", department_id=department.id,
    )
    db_session.add(employee)
    db_session.commit()

    category = OccurrenceCategory(name="CAT_MANAGER", description="desc")
    db_session.add(category)
    db_session.commit()

    rule = OccurrenceCategorySendingRule(category_id=category.id, role="manager", send_type="cc")
    db_session.add(rule)
    db_session.commit()

    occurrence = Occurrence(title="Teste", date=datetime.now(), employee_id=employee.id, category_id=category.id)
    db_session.add(occurrence)
    db_session.commit()
    db_session.refresh(occurrence)

    to_emails, cc_emails = resolve_recipients(db_session, occurrence)

    assert to_emails == []
    assert cc_emails == [department.manager_email]


def test_resolve_recipients_without_category_returns_empty(db_session):
    occurrence = Occurrence(title="Sem categoria", date=datetime.now())
    to_emails, cc_emails = resolve_recipients(db_session, occurrence)

    assert to_emails == []
    assert cc_emails == []