from typing import Literal

from pydantic import BaseModel, Field


class StudyPlanCreate(BaseModel):
    hours_per_day: float = Field(..., gt=0, le=12)
    study_days: list[str] = Field(..., min_length=1)
    weeks: int = Field(..., ge=1, le=52)


class StudyTask(BaseModel):
    id: str
    week: int
    day: str
    skill: str
    priority: str
    title: str
    hours: float
    status: str


class StudyPlanSettings(BaseModel):
    hours_per_day: float
    study_days: list[str]
    weeks: int


class StudyPlanProgress(BaseModel):
    completed: int
    total: int
    percent: float


class StudyPlanResponse(BaseModel):
    target_role: str
    settings: StudyPlanSettings
    tasks: list[StudyTask]
    total_required_hours: float
    scheduled_hours: float
    fits_in_timeframe: bool
    progress: StudyPlanProgress


class TaskStatusUpdate(BaseModel):
    status: Literal["pending", "in_progress", "completed", "skipped"]
