from fastapi import APIRouter
from app.database import db
from app.models.roles import CareerRole

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("", response_model=list[CareerRole])
async def list_roles():
    cursor = db.career_roles.find({}, {"_id": 0})
    roles = await cursor.to_list(length=100)
    return roles