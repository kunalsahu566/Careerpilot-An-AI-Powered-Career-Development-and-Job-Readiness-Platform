from pydantic import BaseModel
from typing import Optional

class CareerRole(BaseModel):
    role_name: str
    required_skills: list[str] = []
    preferred_skills: list[str] = []


class SkillMatch(BaseModel):
    skill: str
    priority: str  # "high" | "medium" (used only for missing skills)


class SkillGapResponse(BaseModel):
    target_role: Optional[str]
    overall_match_percent: float
    matched_skills: list[str]
    missing_high_priority: list[str]   # missing required skills
    missing_medium_priority: list[str] # missing preferred skills
    total_required: int
    total_preferred: int