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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(department_router)
app.include_router(employee_router)
app.include_router(occurrence_category_router)
app.include_router(occurrence_router)
app.include_router(feedback_router)


@app.get("/")
async def root():
    return {"message": "API rodando"}