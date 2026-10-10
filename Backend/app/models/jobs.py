from typing import Optional

from pydantic import BaseModel


class JobBreakdown(BaseModel):
    skills: float
    education: float
    location: float


class JobMatch(BaseModel):
    job_id: str
    title: str
    company: str
    role: str
    location: str
    job_type: str
    experience: str
    match_percent: float
    breakdown: JobBreakdown
    matched_skills: list[str]
    missing_skills: list[str]
    matched_preferred: list[str]
    missing_preferred: list[str]


class JobMatchesResponse(BaseModel):
    target_role: Optional[str]
    total: int
    jobs: list[JobMatch]
