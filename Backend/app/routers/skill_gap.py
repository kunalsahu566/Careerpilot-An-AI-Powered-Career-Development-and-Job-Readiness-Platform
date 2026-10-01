from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db
from app.models.roles import SkillGapResponse
from app.utils.deps import get_current_user
from app.utils.skill_gap import calculate_skill_gap

router = APIRouter(prefix="/skill-gap", tags=["skill-gap"])


@router.get("/me", response_model=SkillGapResponse)
async def get_my_skill_gap(user_id: str = Depends(get_current_user)):
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

    career_goal = profile.get("career_goal") or {}
    target_role_name = career_goal.get("target_role")

    if not target_role_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Set a target role in your career goal before running a skill-gap analysis.",
        )

    role = await db.career_roles.find_one({"role_name": target_role_name}, {"_id": 0})
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"'{target_role_name}' isn't in our career roles database yet. "
                "Try one of the supported roles (see GET /roles)."
            ),
        )

    student_skills = profile.get("skills", [])
    gap_result = calculate_skill_gap(student_skills, role)

    return SkillGapResponse(
        target_role=target_role_name,
        **gap_result,
    )