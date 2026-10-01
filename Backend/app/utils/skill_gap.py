"""
The actual skill-gap comparison logic, kept as a pure function (no database,
no HTTP) so it's easy to test and reason about independently of FastAPI.
"""


def calculate_skill_gap(student_skills: list[str], role: dict) -> dict:
    """
    Compares the student's skills against a career role's required/preferred
    skills. Matching is case-insensitive (so "python" matches "Python").
    """
    student_skills_lower = {s.lower().strip() for s in student_skills}

    required = role.get("required_skills", [])
    preferred = role.get("preferred_skills", [])

    matched = []
    missing_high = []
    for skill in required:
        if skill.lower().strip() in student_skills_lower:
            matched.append(skill)
        else:
            missing_high.append(skill)

    missing_medium = []
    for skill in preferred:
        if skill.lower().strip() in student_skills_lower:
            matched.append(skill)
        else:
            missing_medium.append(skill)

    total_role_skills = len(required) + len(preferred)
    overall_match_percent = (
        round((len(matched) / total_role_skills) * 100, 1)
        if total_role_skills > 0
        else 0.0
    )

    return {
        "overall_match_percent": overall_match_percent,
        "matched_skills": matched,
        "missing_high_priority": missing_high,
        "missing_medium_priority": missing_medium,
        "total_required": len(required),
        "total_preferred": len(preferred),
    }