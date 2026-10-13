"""
Application tracker logic. Pure functions (no database, no HTTP) so the
status history and funnel statistics can be tested on their own.

Pipeline:  saved -> applied -> assessment -> interview -> shortlisted -> offer
Plus a side status, "rejected", which can happen from any stage.

Every status change is appended to the application's history, so we always
know how far an application got, even if it ended in rejection.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

PIPELINE = ["saved", "applied", "assessment", "interview", "shortlisted", "offer"]
ALL_STATUSES = PIPELINE + ["rejected"]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_application(user_id: str, job: dict, now: Optional[str] = None) -> dict:
    """Create a tracker entry for a job. The job's key details are copied in,
    so the tracker still makes sense if the job listing changes or is removed."""
    now = now or _now()
    return {
        "application_id": uuid.uuid4().hex,
        "user_id": user_id,
        "job_id": job["job_id"],
        "title": job["title"],
        "company": job["company"],
        "location": job.get("location", ""),
        "role": job.get("role", ""),
        "status": "saved",
        "notes": "",
        "history": [{"status": "saved", "at": now}],
        "created_at": now,
        "updated_at": now,
    }


def apply_status_change(application: dict, new_status: str, now: Optional[str] = None) -> dict:
    """Return the application with its status updated and the change recorded.
    Setting the same status again is a no-op (no duplicate history entry)."""
    if new_status not in ALL_STATUSES:
        raise ValueError(f"Unknown status: {new_status}")
    if application["status"] == new_status:
        return application

    now = now or _now()
    updated = dict(application)
    updated["status"] = new_status
    updated["history"] = list(application["history"]) + [{"status": new_status, "at": now}]
    updated["updated_at"] = now
    return updated


def furthest_stage_index(application: dict) -> int:
    """How far along the pipeline this application ever got (0 = saved).
    'rejected' is ignored here on purpose: an application rejected after an
    interview still reached the interview stage."""
    reached = [PIPELINE.index(h["status"]) for h in application["history"] if h["status"] in PIPELINE]
    return max(reached) if reached else 0


def calculate_stats(applications: list) -> dict:
    """
    by_status: how many applications are in each status right now.
    funnel:    how many applications ever reached each stage (so the numbers
               only go down as you move along the pipeline).
    """
    by_status = {s: 0 for s in ALL_STATUSES}
    funnel = {s: 0 for s in PIPELINE}

    for app in applications:
        by_status[app["status"]] += 1
        furthest = furthest_stage_index(app)
        for i, stage in enumerate(PIPELINE):
            if furthest >= i:
                funnel[stage] += 1

    return {"total": len(applications), "by_status": by_status, "funnel": funnel}
