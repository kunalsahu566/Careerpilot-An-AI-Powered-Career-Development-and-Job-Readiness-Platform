from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, auth, profile, roles, skill_gap

app = FastAPI(
    title="CareerPilot API",
    description="AI-powered career development, skill intelligence, and job readiness platform.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(roles.router)
app.include_router(skill_gap.router)


@app.get("/")
async def root():
    return {"message": "CareerPilot API - see /docs for the interactive API explorer."}