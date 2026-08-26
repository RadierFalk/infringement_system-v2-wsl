from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    auth_router,
    department_router,
    employee_router,
    occurrence_category_router,
    occurrence_router,
    feedback_router,
)

app = FastAPI(title="Infringement System API")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Achata os erros de validação do Pydantic num formato consistente com
    o resto da API: {"detail": "mensagem legível"}.
    Facilita o tratamento genérico de erros no interceptor HTTP do Angular.
    """
    first_error = exc.errors()[0]
    field = " -> ".join(str(loc) for loc in first_error["loc"] if loc != "body")
    message = f"{field}: {first_error['msg']}" if field else first_error["msg"]

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": message},
    )
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# /auth fica FORA do prefixo /api de propósito: o OAuth2PasswordBearer
# no dependencies/auth.py está configurado com tokenUrl="/auth/login"
# (hardcoded). Se colocássemos /api aqui, o Swagger/OpenAPI ficaria
# apontando pro token URL errado.
app.include_router(auth_router)

# Todos os routers de domínio (recursos de negócio) ficam sob /api,
# deixando claro na URL o que é "API de dados" — separado, por exemplo,
# de uma eventual rota de health-check ou página estática no futuro.
app.include_router(department_router, prefix="/api")
app.include_router(employee_router, prefix="/api")
app.include_router(occurrence_category_router, prefix="/api")
app.include_router(occurrence_router, prefix="/api")
app.include_router(feedback_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "API rodando"}