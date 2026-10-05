from pydantic import BaseModel


class LearningResource(BaseModel):
    skill: str
    title: str
    provider: str
    difficulty: str
    duration_hours: int
    url: str


class SkillRecommendations(BaseModel):
    skill: str
    priority: str
    resources: list[LearningResource]


class RecommendationsResponse(BaseModel):
    target_role: str
    recommendations: list[SkillRecommendations]
