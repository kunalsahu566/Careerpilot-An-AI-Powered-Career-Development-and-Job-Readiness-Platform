from fastapi import APIRouter, HTTPException
from app.database import ping_database

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    try:
        await ping_database()
        db_status = "connected"
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"API is up but could not reach MongoDB: {exc}",
        )
    return {
        "status": "ok",
        "database": db_status,
        "message": "CareerPilot backend is alive and talking to MongoDB.",
    }