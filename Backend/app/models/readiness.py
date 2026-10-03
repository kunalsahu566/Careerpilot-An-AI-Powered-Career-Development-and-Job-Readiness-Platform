from pydantic import BaseModel


class ReadinessBreakdown(BaseModel):
    skills: float
    profile_completeness: float
    projects: float
    certifications: float


class ReadinessWeights(BaseModel):
    skills: int
    profile_completeness: int
    projects: int
    certifications: int


class ReadinessResponse(BaseModel):
    overall_score: float
    breakdown: ReadinessBreakdown
    weights: ReadinessWeights
