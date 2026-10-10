"""
Study plan generation. Pure functions (no database, no HTTP) so the
scheduling logic can be tested on its own.

Input: the recommendations produced by build_recommendations()
       (one entry per missing skill, each with a list of courses).
Output: a week-by-week list of study tasks that fits the student's
        available hours per day and chosen study days.
"""

import uuid

DAY_ORDER = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday",
]

DIFFICULTY_RANK = {"Beginner": 0, "Intermediate": 1, "Advanced": 2}


def pick_resource(resources: list) -> dict:
    """Choose one course per skill: easiest difficulty first, then shortest."""
    return sorted(
        resources,
        key=lambda r: (DIFFICULTY_RANK.get(r.get("difficulty"), 1), r.get("duration_hours", 0)),
    )[0]


def build_queue(recommendations: list) -> list:
    """High-priority skills are scheduled before medium-priority ones."""
    high = [r for r in recommendations if r["priority"] == "high"]
    medium = [r for r in recommendations if r["priority"] != "high"]

    queue = []
    for rec in high + medium:
        if not rec["resources"]:
            continue
        resource = pick_resource(rec["resources"])
        queue.append({
            "skill": rec["skill"],
            "priority": rec["priority"],
            "title": resource["title"],
            "remaining": float(resource["duration_hours"]),
        })
    return queue


def generate_study_plan(
    recommendations: list,
    hours_per_day: float,
    study_days: list,
    weeks: int,
) -> dict:
    days = [d for d in DAY_ORDER if d in study_days]
    queue = build_queue(recommendations)
    total_required = sum(item["remaining"] for item in queue)

    tasks = []
    idx = 0

    for week in range(1, weeks + 1):
        for day in days:
            slot = float(hours_per_day)
            while slot > 0 and idx < len(queue):
                item = queue[idx]
                chunk = round(min(slot, item["remaining"]), 2)
                tasks.append({
                    "id": uuid.uuid4().hex,
                    "week": week,
                    "day": day,
                    "skill": item["skill"],
                    "priority": item["priority"],
                    "title": item["title"],
                    "hours": chunk,
                    "status": "pending",
                })
                item["remaining"] = round(item["remaining"] - chunk, 4)
                slot = round(slot - chunk, 4)
                if item["remaining"] <= 0:
                    idx += 1
            if idx >= len(queue):
                break
        if idx >= len(queue):
            break

    scheduled = sum(t["hours"] for t in tasks)

    return {
        "tasks": tasks,
        "total_required_hours": round(total_required, 1),
        "scheduled_hours": round(scheduled, 1),
        "fits_in_timeframe": idx >= len(queue),
    }


def calculate_progress(tasks: list) -> dict:
    total = len(tasks)
    completed = sum(1 for t in tasks if t.get("status") == "completed")
    percent = round((completed / total) * 100, 1) if total > 0 else 0.0
    return {"completed": completed, "total": total, "percent": percent}
