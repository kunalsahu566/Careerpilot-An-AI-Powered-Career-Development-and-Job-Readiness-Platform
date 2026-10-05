"""
Run once to populate the learning_resources collection.
Usage (from backend/, venv active):
    python3 -m app.seed_learning_resources
Safe to re-run - upserts by (skill, title).
"""

import asyncio
from app.database import db

LEARNING_RESOURCES = [
    {"skill": "SQL", "title": "SQL Fundamentals", "provider": "Coursera", "difficulty": "Beginner", "duration_hours": 12, "url": "https://coursera.org"},
    {"skill": "SQL", "title": "Advanced SQL for Data Analysis", "provider": "Udemy", "difficulty": "Intermediate", "duration_hours": 18, "url": "https://udemy.com"},
    {"skill": "Statistics", "title": "Statistics for Data Science", "provider": "Coursera", "difficulty": "Beginner", "duration_hours": 20, "url": "https://coursera.org"},
    {"skill": "Statistics", "title": "Applied Statistics with Python", "provider": "edX", "difficulty": "Intermediate", "duration_hours": 25, "url": "https://edx.org"},
    {"skill": "Python", "title": "Python for Everybody", "provider": "Coursera", "difficulty": "Beginner", "duration_hours": 30, "url": "https://coursera.org"},
    {"skill": "Pandas", "title": "Data Analysis with Pandas", "provider": "DataCamp", "difficulty": "Beginner", "duration_hours": 10, "url": "https://datacamp.com"},
    {"skill": "NumPy", "title": "NumPy Crash Course", "provider": "DataCamp", "difficulty": "Beginner", "duration_hours": 6, "url": "https://datacamp.com"},
    {"skill": "Machine Learning", "title": "Machine Learning Specialization", "provider": "Coursera", "difficulty": "Intermediate", "duration_hours": 40, "url": "https://coursera.org"},
    {"skill": "Deep Learning", "title": "Deep Learning Specialization", "provider": "Coursera", "difficulty": "Advanced", "duration_hours": 50, "url": "https://coursera.org"},
    {"skill": "Scikit-learn", "title": "Hands-On Machine Learning with Scikit-learn", "provider": "O'Reilly", "difficulty": "Intermediate", "duration_hours": 20, "url": "https://oreilly.com"},
    {"skill": "Power BI", "title": "Power BI for Beginners", "provider": "Udemy", "difficulty": "Beginner", "duration_hours": 8, "url": "https://udemy.com"},
    {"skill": "Tableau", "title": "Tableau 2024 A-Z", "provider": "Udemy", "difficulty": "Beginner", "duration_hours": 15, "url": "https://udemy.com"},
    {"skill": "Cloud", "title": "AWS Cloud Practitioner Essentials", "provider": "AWS Training", "difficulty": "Beginner", "duration_hours": 10, "url": "https://aws.training"},
    {"skill": "Docker", "title": "Docker for Beginners", "provider": "Udemy", "difficulty": "Beginner", "duration_hours": 8, "url": "https://udemy.com"},
    {"skill": "AWS", "title": "AWS Solutions Architect Associate", "provider": "A Cloud Guru", "difficulty": "Intermediate", "duration_hours": 35, "url": "https://acloudguru.com"},
    {"skill": "Spark", "title": "Apache Spark with Python", "provider": "Udemy", "difficulty": "Intermediate", "duration_hours": 22, "url": "https://udemy.com"},
    {"skill": "ETL", "title": "ETL Pipelines with Python", "provider": "DataCamp", "difficulty": "Intermediate", "duration_hours": 14, "url": "https://datacamp.com"},
    {"skill": "Kafka", "title": "Apache Kafka for Beginners", "provider": "Udemy", "difficulty": "Beginner", "duration_hours": 10, "url": "https://udemy.com"},
    {"skill": "Airflow", "title": "Apache Airflow: The Hands-On Guide", "provider": "Udemy", "difficulty": "Intermediate", "duration_hours": 12, "url": "https://udemy.com"},
    {"skill": "JavaScript", "title": "The Complete JavaScript Course", "provider": "Udemy", "difficulty": "Beginner", "duration_hours": 40, "url": "https://udemy.com"},
    {"skill": "React", "title": "React - The Complete Guide", "provider": "Udemy", "difficulty": "Intermediate", "duration_hours": 35, "url": "https://udemy.com"},
    {"skill": "Node.js", "title": "Node.js, Express, MongoDB Bootcamp", "provider": "Udemy", "difficulty": "Intermediate", "duration_hours": 30, "url": "https://udemy.com"},
    {"skill": "TypeScript", "title": "TypeScript for JavaScript Developers", "provider": "Udemy", "difficulty": "Intermediate", "duration_hours": 15, "url": "https://udemy.com"},
    {"skill": "HTML", "title": "HTML & CSS Crash Course", "provider": "freeCodeCamp", "difficulty": "Beginner", "duration_hours": 8, "url": "https://freecodecamp.org"},
    {"skill": "CSS", "title": "CSS Grid & Flexbox Mastery", "provider": "freeCodeCamp", "difficulty": "Beginner", "duration_hours": 6, "url": "https://freecodecamp.org"},
    {"skill": "Express", "title": "Express.js Crash Course", "provider": "freeCodeCamp", "difficulty": "Beginner", "duration_hours": 5, "url": "https://freecodecamp.org"},
    {"skill": "MongoDB", "title": "MongoDB - The Complete Developer's Guide", "provider": "Udemy", "difficulty": "Intermediate", "duration_hours": 18, "url": "https://udemy.com"},
    {"skill": "REST APIs", "title": "REST API Design, Dev & Management", "provider": "Udemy", "difficulty": "Intermediate", "duration_hours": 12, "url": "https://udemy.com"},
    {"skill": "Excel", "title": "Excel for Data Analysis", "provider": "Coursera", "difficulty": "Beginner", "duration_hours": 10, "url": "https://coursera.org"},
    {"skill": "R", "title": "R Programming A-Z", "provider": "Udemy", "difficulty": "Beginner", "duration_hours": 15, "url": "https://udemy.com"},
    {"skill": "FastAPI", "title": "FastAPI - The Complete Course", "provider": "Udemy", "difficulty": "Intermediate", "duration_hours": 16, "url": "https://udemy.com"},
    {"skill": "MLOps", "title": "MLOps Fundamentals", "provider": "Coursera", "difficulty": "Advanced", "duration_hours": 20, "url": "https://coursera.org"},
    {"skill": "System Design", "title": "Grokking the System Design Interview", "provider": "Educative", "difficulty": "Intermediate", "duration_hours": 20, "url": "https://educative.io"},
    {"skill": "DSA", "title": "Data Structures and Algorithms Masterclass", "provider": "Udemy", "difficulty": "Intermediate", "duration_hours": 45, "url": "https://udemy.com"},
    {"skill": "Next.js", "title": "Next.js & React - The Complete Guide", "provider": "Udemy", "difficulty": "Intermediate", "duration_hours": 25, "url": "https://udemy.com"},
    {"skill": "Tailwind CSS", "title": "Tailwind CSS From Scratch", "provider": "Udemy", "difficulty": "Beginner", "duration_hours": 6, "url": "https://udemy.com"},
]


async def seed():
    for resource in LEARNING_RESOURCES:
        await db.learning_resources.update_one(
            {"skill": resource["skill"], "title": resource["title"]},
            {"$set": resource},
            upsert=True,
        )
    print(f"Done. {len(LEARNING_RESOURCES)} learning resources seeded.")


if __name__ == "__main__":
    asyncio.run(seed())
