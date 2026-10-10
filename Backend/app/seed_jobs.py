"""
Run once to populate the jobs collection with SAMPLE listings.
These companies and listings are fictional and for demonstration only.

Usage (from Backend/, venv active):
    python3 -m app.seed_jobs

Safe to re-run - upserts by job_id.
"""

import asyncio
from app.database import db

TECH_DEGREES = ["B.Tech", "B.E.", "BCA", "MCA", "M.Tech", "B.Sc", "M.Sc"]

JOBS = [
    # ---- Data Analyst ----
    {"job_id": "j001", "title": "Data Analyst", "company": "Northwind Analytics", "role": "Data Analyst",
     "location": "Bangalore", "job_type": "Full-time", "experience": "0-2 years",
     "required_skills": ["Python", "SQL", "Excel", "Power BI"], "preferred_skills": ["Tableau", "Statistics"],
     "education_required": TECH_DEGREES},
    {"job_id": "j002", "title": "Junior Data Analyst", "company": "BrightPath Insights", "role": "Data Analyst",
     "location": "Remote", "job_type": "Full-time", "experience": "Fresher",
     "required_skills": ["SQL", "Excel", "Power BI"], "preferred_skills": ["Python", "R"],
     "education_required": []},
    {"job_id": "j003", "title": "Data Analyst Intern", "company": "Quanta Retail", "role": "Data Analyst",
     "location": "Mohali, Punjab", "job_type": "Internship", "experience": "Fresher",
     "required_skills": ["Excel", "SQL"], "preferred_skills": ["Power BI", "Python"],
     "education_required": []},
    {"job_id": "j020", "title": "Business Analyst - Data", "company": "Summit Consulting", "role": "Data Analyst",
     "location": "Mumbai", "job_type": "Full-time", "experience": "0-2 years",
     "required_skills": ["SQL", "Excel", "Power BI"], "preferred_skills": ["Tableau", "Statistics"],
     "education_required": []},
    {"job_id": "j021", "title": "BI Developer", "company": "Atlas Metrics", "role": "Data Analyst",
     "location": "Hyderabad", "job_type": "Full-time", "experience": "0-2 years",
     "required_skills": ["SQL", "Power BI", "Excel", "Python"], "preferred_skills": ["Tableau"],
     "education_required": TECH_DEGREES},

    # ---- Data Scientist ----
    {"job_id": "j004", "title": "Data Scientist", "company": "Helix AI Labs", "role": "Data Scientist",
     "location": "Bangalore", "job_type": "Full-time", "experience": "0-2 years",
     "required_skills": ["Python", "SQL", "Statistics", "Machine Learning", "Pandas", "NumPy"],
     "preferred_skills": ["Deep Learning", "Cloud"], "education_required": TECH_DEGREES},
    {"job_id": "j005", "title": "Associate Data Scientist", "company": "Meridian Health Tech", "role": "Data Scientist",
     "location": "Pune", "job_type": "Full-time", "experience": "0-2 years",
     "required_skills": ["Python", "Statistics", "Machine Learning", "Pandas"],
     "preferred_skills": ["SQL", "Power BI", "Docker"], "education_required": TECH_DEGREES},
    {"job_id": "j006", "title": "Data Science Intern", "company": "Orbit Fintech", "role": "Data Scientist",
     "location": "Remote", "job_type": "Internship", "experience": "Fresher",
     "required_skills": ["Python", "Pandas", "NumPy"], "preferred_skills": ["Machine Learning", "SQL"],
     "education_required": []},

    # ---- Machine Learning Engineer ----
    {"job_id": "j007", "title": "Machine Learning Engineer", "company": "Vertex Robotics",
     "role": "Machine Learning Engineer", "location": "Hyderabad", "job_type": "Full-time",
     "experience": "0-2 years",
     "required_skills": ["Python", "Machine Learning", "Scikit-learn", "Deep Learning"],
     "preferred_skills": ["Docker", "FastAPI", "Cloud"], "education_required": TECH_DEGREES},
    {"job_id": "j008", "title": "ML Engineer Trainee", "company": "Nimbus Cloudworks",
     "role": "Machine Learning Engineer", "location": "Chennai", "job_type": "Full-time",
     "experience": "Fresher",
     "required_skills": ["Python", "Machine Learning", "Scikit-learn"],
     "preferred_skills": ["Deep Learning", "MLOps"], "education_required": TECH_DEGREES},

    # ---- Data Engineer ----
    {"job_id": "j009", "title": "Data Engineer", "company": "Stackline Systems", "role": "Data Engineer",
     "location": "Bangalore", "job_type": "Full-time", "experience": "0-2 years",
     "required_skills": ["Python", "SQL", "Spark", "ETL", "AWS"],
     "preferred_skills": ["Docker", "Airflow", "Kafka"], "education_required": TECH_DEGREES},
    {"job_id": "j010", "title": "Junior Data Engineer", "company": "Lumen Data Platforms", "role": "Data Engineer",
     "location": "Delhi NCR", "job_type": "Full-time", "experience": "Fresher",
     "required_skills": ["Python", "SQL", "ETL"], "preferred_skills": ["Spark", "AWS", "Airflow"],
     "education_required": TECH_DEGREES},

    # ---- Backend Developer ----
    {"job_id": "j011", "title": "Backend Developer", "company": "Cobalt Commerce", "role": "Backend Developer",
     "location": "Pune", "job_type": "Full-time", "experience": "0-2 years",
     "required_skills": ["JavaScript", "Node.js", "Express", "MongoDB", "REST APIs"],
     "preferred_skills": ["Docker", "System Design"], "education_required": TECH_DEGREES},
    {"job_id": "j012", "title": "Backend Developer Intern", "company": "Pixelforge Studio",
     "role": "Backend Developer", "location": "Chandigarh", "job_type": "Internship", "experience": "Fresher",
     "required_skills": ["JavaScript", "Node.js", "MongoDB"], "preferred_skills": ["Express", "REST APIs"],
     "education_required": []},
    {"job_id": "j013", "title": "Node.js Developer", "company": "Zenith Logistics", "role": "Backend Developer",
     "location": "Remote", "job_type": "Full-time", "experience": "0-2 years",
     "required_skills": ["JavaScript", "Node.js", "Express", "REST APIs"],
     "preferred_skills": ["MongoDB", "DSA"], "education_required": TECH_DEGREES},

    # ---- Frontend Developer ----
    {"job_id": "j014", "title": "Frontend Developer", "company": "Aurora Web Co.", "role": "Frontend Developer",
     "location": "Mumbai", "job_type": "Full-time", "experience": "0-2 years",
     "required_skills": ["JavaScript", "React", "HTML", "CSS"],
     "preferred_skills": ["TypeScript", "Tailwind CSS"], "education_required": TECH_DEGREES},
    {"job_id": "j015", "title": "React Developer", "company": "Slate Software", "role": "Frontend Developer",
     "location": "Mohali, Punjab", "job_type": "Full-time", "experience": "0-2 years",
     "required_skills": ["JavaScript", "React", "HTML", "CSS"],
     "preferred_skills": ["Next.js", "TypeScript"], "education_required": TECH_DEGREES},
    {"job_id": "j016", "title": "Frontend Intern", "company": "Mosaic Media", "role": "Frontend Developer",
     "location": "Remote", "job_type": "Internship", "experience": "Fresher",
     "required_skills": ["HTML", "CSS", "JavaScript"], "preferred_skills": ["React", "Tailwind CSS"],
     "education_required": []},

    # ---- Full Stack Developer ----
    {"job_id": "j017", "title": "Full Stack Developer", "company": "Crescent Apps", "role": "Full Stack Developer",
     "location": "Hyderabad", "job_type": "Full-time", "experience": "0-2 years",
     "required_skills": ["JavaScript", "React", "Node.js", "MongoDB", "REST APIs"],
     "preferred_skills": ["TypeScript", "Docker", "AWS"], "education_required": TECH_DEGREES},
    {"job_id": "j018", "title": "Full Stack Developer (MERN)", "company": "Nova Labs",
     "role": "Full Stack Developer", "location": "Remote", "job_type": "Full-time", "experience": "0-2 years",
     "required_skills": ["JavaScript", "React", "Node.js", "MongoDB"],
     "preferred_skills": ["TypeScript", "AWS"], "education_required": TECH_DEGREES},
    {"job_id": "j019", "title": "Associate Full Stack Engineer", "company": "Kite Technologies",
     "role": "Full Stack Developer", "location": "Mohali, Punjab", "job_type": "Full-time",
     "experience": "Fresher",
     "required_skills": ["JavaScript", "React", "Node.js"], "preferred_skills": ["MongoDB", "Docker"],
     "education_required": TECH_DEGREES},
]


async def seed():
    for job in JOBS:
        await db.jobs.update_one({"job_id": job["job_id"]}, {"$set": job}, upsert=True)
    print(f"Done. {len(JOBS)} sample jobs seeded.")


if __name__ == "__main__":
    asyncio.run(seed())
