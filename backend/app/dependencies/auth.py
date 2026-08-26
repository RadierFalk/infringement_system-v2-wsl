from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import decode_access_token
from app.repositories import EmployeeRepository
from app.models import Employee
from app.models.employee import UserType

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Employee:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas ou expiradas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception

    repo = EmployeeRepository(db)
    user = repo.get_by_username(username)
    if user is None:
        raise credentials_exception
    return user


def require_role(*allowed: UserType):
    """
    Factory de dependency: em vez de escrever uma função 'require_admin',
    'require_super_admin' etc. na mão pra cada combinação, geramos a
    dependency dinamicamente. Uso: Depends(require_role(UserType.SUPER_ADMIN))
    """
    def dependency(current_user: Employee = Depends(get_current_user)) -> Employee:
        if current_user.user_type not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para executar esta ação",
            )
        return current_user
    return dependency


# Atalhos legíveis pras rotas
require_super_admin = require_role(UserType.SUPER_ADMIN)
require_admin_or_above = require_role(UserType.SUPER_ADMIN, UserType.ADMIN)