"""
Career Readiness Score endpoint. Reuses the skill-gap calculation
(if the student has set a target role) and combines it with profile
completeness, project count, and certification count into one score.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db
from app.models.readiness import ReadinessResponse
from app.utils.deps import get_current_user
from app.utils.skill_gap import calculate_skill_gap
from app.utils.readiness import calculate_readiness_score

router = APIRouter(prefix="/readiness", tags=["readiness"])


@router.get("/me", response_model=ReadinessResponse)
async def get_my_readiness(user_id: str = Depends(get_current_user)):
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

    skill_match_percent = 0.0
    career_goal = profile.get("career_goal") or {}
    target_role_name = career_goal.get("target_role")

    if target_role_name:
        role = await db.career_roles.find_one({"role_name": target_role_name}, {"_id": 0})
        if role:
            gap_result = calculate_skill_gap(profile.get("skills", []), role)
            skill_match_percent = gap_result["overall_match_percent"]

    certifications_count = len(profile.get("certifications", []))

    result = calculate_readiness_score(
        skill_match_percent=skill_match_percent,
        profile=profile,
        certifications_count=certifications_count,
    )

    return ReadinessResponse(**result)
