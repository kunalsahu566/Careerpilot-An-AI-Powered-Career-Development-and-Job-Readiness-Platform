"""
Maps a skill-gap result's missing skills to learning resources.
"""


def build_recommendations(
    missing_high_priority: list,
    missing_medium_priority: list,
    all_resources: list,
) -> list:
    resources_by_skill = {}
    for resource in all_resources:
        key = resource["skill"].lower().strip()
        resources_by_skill.setdefault(key, []).append(resource)

    recommendations = []

    for skill in missing_high_priority:
        key = skill.lower().strip()
        matches = resources_by_skill.get(key, [])
        if matches:
            recommendations.append({
                "skill": skill,
                "priority": "high",
                "resources": matches,
            })

    for skill in missing_medium_priority:
        key = skill.lower().strip()
        matches = resources_by_skill.get(key, [])
        if matches:
            recommendations.append({
                "skill": skill,
                "priority": "medium",
                "resources": matches,
            })

    return recommendations
