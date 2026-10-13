from typing import Literal, Optional

from pydantic import BaseModel, Field

StatusType = Literal[
    "saved", "applied", "assessment", "interview", "shortlisted", "offer", "rejected"
]


class ApplicationCreate(BaseModel):
    job_id: str = Field(..., min_length=1)


class ApplicationUpdate(BaseModel):
    status: Optional[StatusType] = None
    notes: Optional[str] = Field(None, max_length=2000)


class HistoryEntry(BaseModel):
    status: str
    at: str


class ApplicationOut(BaseModel):
    application_id: str
    job_id: str
    title: str
    company: str
    location: str
    role: str
    status: str
    notes: str
    history: list[HistoryEntry]
    created_at: str
    updated_at: str


class ApplicationStats(BaseModel):
    total: int
    by_status: dict[str, int]
    funnel: dict[str, int]


class ApplicationsResponse(BaseModel):
    applications: list[ApplicationOut]
    stats: ApplicationStats
