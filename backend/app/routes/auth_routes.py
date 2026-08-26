from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories import EmployeeRepository
from app.schemas import LoginRequest, Token
from app.core.security import verify_password, create_access_token
from app.dependencies.auth import get_current_user
from app.models import Employee

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    repo = EmployeeRepository(db)
    user = repo.get_by_username(credentials.username)

    if not user or not user.hashed_password or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário ou senha inválidos")

    access_token = create_access_token(
        data={"sub": user.username, "user_type": user.user_type.value}
    )
    return Token(access_token=access_token)


@router.get("/me")
def read_current_user(current_user: Employee = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "username": current_user.username,
        "email": current_user.email,
        "user_type": current_user.user_type.value,
        "department_id": current_user.department_id,
        "department": current_user.department.name if current_user.department else None,
    }