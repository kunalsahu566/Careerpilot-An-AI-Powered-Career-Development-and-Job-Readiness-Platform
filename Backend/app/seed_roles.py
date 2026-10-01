"""
Run once to populate career_roles. Usage (from backend/, venv active):
    python3 -m app.seed_roles
Safe to re-run - upserts by role_name.
"""

import asyncio
from app.database import db

CAREER_ROLES = [
    {
        "role_name": "Data Scientist",
        "required_skills": ["Python", "SQL", "Statistics", "Machine Learning", "Pandas", "NumPy"],
        "preferred_skills": ["Power BI", "Deep Learning", "Cloud", "Docker"],
    },
    {
        "role_name": "Data Analyst",
        "required_skills": ["Python", "SQL", "Excel", "Power BI"],
        "preferred_skills": ["Tableau", "Statistics", "R"],
    },
    {
        "role_name": "Data Engineer",
        "required_skills": ["Python", "SQL", "Spark", "ETL", "AWS"],
        "preferred_skills": ["Docker", "Kafka", "Airflow"],
    },
    {
        "role_name": "Machine Learning Engineer",
        "required_skills": ["Python", "Machine Learning", "Scikit-learn", "Deep Learning"],
        "preferred_skills": ["Docker", "FastAPI", "Cloud", "MLOps"],
    },
    {
        "role_name": "Backend Developer",
        "required_skills": ["JavaScript", "Node.js", "Express", "MongoDB", "REST APIs"],
        "preferred_skills": ["Docker", "System Design", "DSA"],
    },
    {
        "role_name": "Frontend Developer",
        "required_skills": ["JavaScript", "React", "HTML", "CSS"],
        "preferred_skills": ["TypeScript", "Tailwind CSS", "Next.js"],
    },
    {
        "role_name": "Full Stack Developer",
        "required_skills": ["JavaScript", "React", "Node.js", "MongoDB", "REST APIs"],
        "preferred_skills": ["TypeScript", "Docker", "AWS"],
    },
]


async def seed():
    for role in CAREER_ROLES:
        await db.career_roles.update_one(
            {"role_name": role["role_name"]},
            {"$set": role},
            upsert=True,
        )
        print(f"Upserted: {role['role_name']}")
    print(f"\nDone. {len(CAREER_ROLES)} career roles seeded.")


if __name__ == "__main__":
    asyncio.run(seed())