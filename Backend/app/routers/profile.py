from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db
from app.models.profile import ProfileResponse, ProfileUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        profile = {"user_id": user_id, "skills": [], "projects": []}

    return ProfileResponse(
        user_id=user_id,
        name=user["name"],
        email=user["email"],
        location=profile.get("location"),
        education=profile.get("education"),
        skills=profile.get("skills", []),
        projects=profile.get("projects", []),
        career_goal=profile.get("career_goal"),
    )


@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    payload: ProfileUpdate,
    user_id: str = Depends(get_current_user),
):
    update_data = payload.model_dump(exclude_unset=True, exclude_none=True)

    if update_data:
        await db.student_profiles.update_one(
            {"user_id": user_id},
            {"$set": update_data},
            upsert=True,
        )

    return await get_my_profile(user_id=user_id)
