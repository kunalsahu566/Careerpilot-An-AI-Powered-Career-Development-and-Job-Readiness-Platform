"""
Learning recommendations: reuses the skill-gap engine to find missing
skills, then maps them to courses from the learning_resources collection.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db
from app.models.learning import RecommendationsResponse
from app.utils.deps import get_current_user
from app.utils.skill_gap import calculate_skill_gap
from app.utils.learning import build_recommendations

router = APIRouter(prefix="/learning", tags=["learning"])


@router.get("/recommendations/me", response_model=RecommendationsResponse)
async def get_my_recommendations(user_id: str = Depends(get_current_user)):
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

    career_goal = profile.get("career_goal") or {}
    target_role_name = career_goal.get("target_role")

    if not target_role_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Set a target role in your career goal before getting learning recommendations.",
        )

    role = await db.career_roles.find_one({"role_name": target_role_name}, {"_id": 0})
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"'{target_role_name}' isn't in our career roles database yet.",
        )

    gap_result = calculate_skill_gap(profile.get("skills", []), role)

    all_resources_cursor = db.learning_resources.find({}, {"_id": 0})
    all_resources = await all_resources_cursor.to_list(length=500)

    recommendations = build_recommendations(
        gap_result["missing_high_priority"],
        gap_result["missing_medium_priority"],
        all_resources,
    )

    return RecommendationsResponse(
        target_role=target_role_name,
        recommendations=recommendations,
    )
