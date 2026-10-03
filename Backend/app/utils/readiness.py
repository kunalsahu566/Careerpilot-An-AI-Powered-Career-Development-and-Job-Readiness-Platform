"""
Career Readiness Score: a weighted composite of signals we currently have
about the student. As later phases add assessments, interviews, and
certifications tracking, this function will gain more inputs - but the
weights are deliberately documented here so it's never a mystery number.

Current weights (sum to 100):
  - Skills Match (from skill-gap engine)      40%
  - Profile Completeness                      20%
  - Projects                                  25%
  - Certifications                            15%
"""

SKILLS_WEIGHT = 40
PROFILE_WEIGHT = 20
PROJECTS_WEIGHT = 25
CERTIFICATIONS_WEIGHT = 15

PROJECTS_CAP = 3
CERTIFICATIONS_CAP = 3


def calculate_profile_completeness(profile: dict) -> float:
    checks = []

    checks.append(bool(profile.get("location")))

    education = profile.get("education") or {}
    checks.append(bool(education.get("degree")) and bool(education.get("branch")))

    career_goal = profile.get("career_goal") or {}
    checks.append(bool(career_goal.get("target_role")))

    checks.append(len(profile.get("skills", [])) > 0)

    completed = sum(1 for c in checks if c)
    return round((completed / len(checks)) * 100, 1)


def calculate_readiness_score(
    skill_match_percent: float,
    profile: dict,
    certifications_count: int = 0,
) -> dict:
    projects_count = len(profile.get("projects", []))

    profile_completeness = calculate_profile_completeness(profile)
    projects_score = round(min(projects_count / PROJECTS_CAP, 1.0) * 100, 1)
    certifications_score = round(min(certifications_count / CERTIFICATIONS_CAP, 1.0) * 100, 1)

    overall = (
        skill_match_percent * (SKILLS_WEIGHT / 100)
        + profile_completeness * (PROFILE_WEIGHT / 100)
        + projects_score * (PROJECTS_WEIGHT / 100)
        + certifications_score * (CERTIFICATIONS_WEIGHT / 100)
    )

    return {
        "overall_score": round(overall, 1),
        "breakdown": {
            "skills": round(skill_match_percent, 1),
            "profile_completeness": profile_completeness,
            "projects": projects_score,
            "certifications": certifications_score,
        },
        "weights": {
            "skills": SKILLS_WEIGHT,
            "profile_completeness": PROFILE_WEIGHT,
            "projects": PROJECTS_WEIGHT,
            "certifications": CERTIFICATIONS_WEIGHT,
        },
    }
