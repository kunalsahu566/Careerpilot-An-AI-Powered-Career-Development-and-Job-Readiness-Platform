"""
Study planner endpoints. A plan is generated from the student's current
skill gaps (via the same skill-gap + recommendation logic as earlier phases)
and stored in the study_plans collection, one plan per student.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db
from app.models.study_plan import StudyPlanCreate, StudyPlanResponse, TaskStatusUpdate
from app.utils.deps import get_current_user
from app.utils.skill_gap import calculate_skill_gap
from app.utils.learning import build_recommendations
from app.utils.study_planner import (
    DAY_ORDER,
    generate_study_plan,
    calculate_progress,
)

router = APIRouter(prefix="/study-plan", tags=["study-plan"])


def plan_to_response(plan: dict) -> StudyPlanResponse:
    return StudyPlanResponse(
        target_role=plan["target_role"],
        settings=plan["settings"],
        tasks=plan["tasks"],
        total_required_hours=plan["total_required_hours"],
        scheduled_hours=plan["scheduled_hours"],
        fits_in_timeframe=plan["fits_in_timeframe"],
        progress=calculate_progress(plan["tasks"]),
    )


@router.get("/me", response_model=StudyPlanResponse)
async def get_my_plan(user_id: str = Depends(get_current_user)):
    plan = await db.study_plans.find_one({"user_id": user_id})
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No study plan yet.")
    return plan_to_response(plan)


@router.post("/me", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_my_plan(payload: StudyPlanCreate, user_id: str = Depends(get_current_user)):
    invalid_days = [d for d in payload.study_days if d not in DAY_ORDER]
    if invalid_days:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid study days: {', '.join(invalid_days)}.",
        )

    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

    career_goal = profile.get("career_goal") or {}
    target_role_name = career_goal.get("target_role")
    if not target_role_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Set a target role in your career goal before creating a study plan.",
        )

    role = await db.career_roles.find_one({"role_name": target_role_name}, {"_id": 0})
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"'{target_role_name}' isn't in our career roles database yet.",
        )

    gap_result = calculate_skill_gap(profile.get("skills", []), role)
    all_resources = await db.learning_resources.find({}, {"_id": 0}).to_list(length=500)
    recommendations = build_recommendations(
        gap_result["missing_high_priority"],
        gap_result["missing_medium_priority"],
        all_resources,
    )

    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nothing to plan: you have no skill gaps with available courses.",
        )

    generated = generate_study_plan(
        recommendations,
        payload.hours_per_day,
        payload.study_days,
        payload.weeks,
    )

    plan_doc = {
        "user_id": user_id,
        "target_role": target_role_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "settings": {
            "hours_per_day": payload.hours_per_day,
            "study_days": [d for d in DAY_ORDER if d in payload.study_days],
            "weeks": payload.weeks,
        },
        **generated,
    }

    # One plan per student: creating a new plan replaces the old one.
    await db.study_plans.replace_one({"user_id": user_id}, plan_doc, upsert=True)
    return plan_to_response(plan_doc)


@router.patch("/me/tasks/{task_id}", response_model=StudyPlanResponse)
async def update_task_status(
    task_id: str,
    payload: TaskStatusUpdate,
    user_id: str = Depends(get_current_user),
):
    result = await db.study_plans.update_one(
        {"user_id": user_id, "tasks.id": task_id},
        {"$set": {"tasks.$.status": payload.status}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    plan = await db.study_plans.find_one({"user_id": user_id})
    return plan_to_response(plan)


@router.delete("/me")
async def delete_my_plan(user_id: str = Depends(get_current_user)):
    await db.study_plans.delete_one({"user_id": user_id})
    return {"deleted": True}
