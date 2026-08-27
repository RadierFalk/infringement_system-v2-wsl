"""add user_type to employee, migrate from is_admin

Revision ID: <gerado automaticamente>
Revises: 76fdc4e22893
Create Date: ...
"""
from alembic import op
import sqlalchemy as sa

revision: str = "50e2da88819a"
down_revision = "76fdc4e22893"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "employees",
        sa.Column("user_type", sa.String(length=20), nullable=True),
    )

    employees = sa.table(
        "employees",
        sa.column("is_admin", sa.String),
        sa.column("user_type", sa.String),
    )
    op.execute(employees.update().where(employees.c.is_admin == "Y").values(user_type="super_admin"))
    op.execute(employees.update().where(employees.c.is_admin == "N").values(user_type="normal"))

    # MySQL precisa do existing_type pra montar o MODIFY COLUMN completo —
    # sem isso ele não sabe reescrever a coluna e falha com
    # "All MySQL CHANGE/MODIFY COLUMN operations require the existing type."
    op.alter_column(
        "employees",
        "user_type",
        existing_type=sa.String(length=20),
        nullable=False,
        server_default="normal",
    )

    op.drop_column("employees", "is_admin")


def downgrade() -> None:
    op.add_column(
        "employees",
        sa.Column("is_admin", sa.String(length=1), nullable=False, server_default="N"),
    )
    employees = sa.table(
        "employees",
        sa.column("is_admin", sa.String),
        sa.column("user_type", sa.String),
    )
    op.execute(
        employees.update()
        .where(employees.c.user_type.in_(["super_admin", "admin"]))
        .values(is_admin="Y")
    )
    op.drop_column("employees", "user_type")