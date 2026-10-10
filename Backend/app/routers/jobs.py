"""
Job matching: ranks every job in the jobs collection by how well it fits the
logged-in student's profile, with a per-signal breakdown and the skills
they match or are missing.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db
from app.models.jobs import JobMatchesResponse
from app.utils.deps import get_current_user
from app.utils.job_matching import rank_jobs

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/matches/me", response_model=JobMatchesResponse)
async def get_my_job_matches(user_id: str = Depends(get_current_user)):
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

    jobs = await db.jobs.find({}, {"_id": 0}).to_list(length=500)
    ranked = rank_jobs(profile, jobs)

    career_goal = profile.get("career_goal") or {}
    return JobMatchesResponse(
        target_role=career_goal.get("target_role"),
        total=len(ranked),
        jobs=ranked,
    )
