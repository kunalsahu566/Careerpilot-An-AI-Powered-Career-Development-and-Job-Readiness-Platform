from typing import Optional

from pydantic import BaseModel, Field


class Education(BaseModel):
    degree: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[str] = None
    cgpa: Optional[float] = None
    graduation_year: Optional[int] = None
    college: Optional[str] = None


class Project(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: list[str] = Field(default_factory=list)
    github_url: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None


class CareerGoal(BaseModel):
    target_role: Optional[str] = None
    preferred_industry: Optional[str] = None
    preferred_location: Optional[str] = None
    target_companies: list[str] = Field(default_factory=list)
    expected_salary: Optional[str] = None


class ProfileUpdate(BaseModel):
    location: Optional[str] = None
    education: Optional[Education] = None
    skills: Optional[list[str]] = None
    projects: Optional[list[Project]] = None
    career_goal: Optional[CareerGoal] = None


class ProfileResponse(BaseModel):
    user_id: str
    name: str
    email: str
    location: Optional[str] = None
    education: Optional[Education] = None
    skills: list[str] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    career_goal: Optional[CareerGoal] = None
