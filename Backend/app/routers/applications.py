"""
Application tracker. Students save jobs, then move each application through
the hiring pipeline. Every route only ever touches the logged-in student's
own applications (user_id always comes from the verified token).
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db
from app.models.applications import (
    ApplicationCreate,
    ApplicationOut,
    ApplicationUpdate,
    ApplicationsResponse,
)
from app.utils.application_tracker import (
    apply_status_change,
    calculate_stats,
    new_application,
)
from app.utils.deps import get_current_user

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("/me", response_model=ApplicationsResponse)
async def list_my_applications(user_id: str = Depends(get_current_user)):
    applications = await db.applications.find({"user_id": user_id}, {"_id": 0}).to_list(length=500)
    applications.sort(key=lambda a: a["updated_at"], reverse=True)
    return ApplicationsResponse(
        applications=applications,
        stats=calculate_stats(applications),
    )


@router.post("/me", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
async def save_job(payload: ApplicationCreate, user_id: str = Depends(get_current_user)):
    job = await db.jobs.find_one({"job_id": payload.job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    existing = await db.applications.find_one({"user_id": user_id, "job_id": payload.job_id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This job is already in your tracker.",
        )

    application = new_application(user_id, job)
    await db.applications.insert_one(dict(application))
    return application


@router.patch("/me/{application_id}", response_model=ApplicationOut)
async def update_application(
    application_id: str,
    payload: ApplicationUpdate,
    user_id: str = Depends(get_current_user),
):
    if payload.status is None and payload.notes is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nothing to update: send a status, notes, or both.",
        )

    key = {"user_id": user_id, "application_id": application_id}
    application = await db.applications.find_one(key, {"_id": 0})
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if payload.status is not None:
        application = apply_status_change(application, payload.status)

    if payload.notes is not None:
        application = dict(application)
        application["notes"] = payload.notes
        application["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.applications.replace_one(key, application)
    return application


@router.delete("/me/{application_id}")
async def remove_application(application_id: str, user_id: str = Depends(get_current_user)):
    result = await db.applications.delete_one(
        {"user_id": user_id, "application_id": application_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")
    return {"deleted": True}
