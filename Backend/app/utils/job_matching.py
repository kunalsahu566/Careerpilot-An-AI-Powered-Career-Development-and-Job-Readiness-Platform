"""
Job matching. Pure functions (no database, no HTTP) so the scoring can be
tested on its own.

Match score = weighted blend of three signals we actually have data for:
  - Skills     70%  (required skills count fully, preferred skills count half)
  - Education  15%  (does the student's degree match what the job accepts?)
  - Location   15%  (remote jobs, or the student's location / preferred location)

Experience is not scored yet because the profile doesn't track work
experience. Add it as a fourth signal when that field exists.
"""

SKILLS_WEIGHT = 70
EDUCATION_WEIGHT = 15
LOCATION_WEIGHT = 15

# Alternative spellings of the same degree, after punctuation/spaces are removed.
DEGREE_ALIASES = {
    "bacheloroftechnology": "btech",
    "bachelorsoftechnology": "btech",
    "bachelorofengineering": "be",
    "bachelorsofengineering": "be",
    "masteroftechnology": "mtech",
    "mastersoftechnology": "mtech",
    "bachelorofcomputerapplications": "bca",
    "masterofcomputerapplications": "mca",
}


def normalize_degree(value) -> str:
    """'B.Tech', 'b.tech' and 'B Tech' all become 'btech'."""
    if not value:
        return ""
    cleaned = "".join(ch for ch in str(value).lower() if ch.isalnum())
    return DEGREE_ALIASES.get(cleaned, cleaned)


def calculate_skill_match(student_skills: list, required: list, preferred: list) -> dict:
    student = {s.lower().strip() for s in student_skills}

    matched_required = [k for k in required if k.lower().strip() in student]
    missing_required = [k for k in required if k.lower().strip() not in student]
    matched_preferred = [k for k in preferred if k.lower().strip() in student]
    missing_preferred = [k for k in preferred if k.lower().strip() not in student]

    # Preferred skills count half as much as required ones.
    denominator = len(required) + 0.5 * len(preferred)
    if denominator == 0:
        score = 100.0
    else:
        score = (len(matched_required) + 0.5 * len(matched_preferred)) / denominator * 100

    return {
        "score": round(score, 1),
        "matched_skills": matched_required,
        "missing_skills": missing_required,
        "matched_preferred": matched_preferred,
        "missing_preferred": missing_preferred,
    }


def calculate_education_score(profile: dict, education_required: list) -> float:
    if not education_required:
        return 100.0  # job accepts anyone

    education = profile.get("education") or {}
    student_degree = normalize_degree(education.get("degree"))
    if not student_degree:
        return 0.0

    accepted = {normalize_degree(d) for d in education_required}
    return 100.0 if student_degree in accepted else 0.0


def calculate_location_score(job_location: str, profile: dict) -> float:
    job_loc = (job_location or "").lower().strip()
    if not job_loc or "remote" in job_loc:
        return 100.0

    career_goal = profile.get("career_goal") or {}
    candidates = [profile.get("location"), career_goal.get("preferred_location")]
    student_locs = [c.lower().strip() for c in candidates if c and c.strip()]

    if not student_locs:
        return 50.0  # no location info: neutral, not a penalty

    for loc in student_locs:
        if job_loc in loc or loc in job_loc:
            return 100.0
    return 0.0


def match_job(profile: dict, job: dict) -> dict:
    skills = calculate_skill_match(
        profile.get("skills", []),
        job.get("required_skills", []),
        job.get("preferred_skills", []),
    )
    education = calculate_education_score(profile, job.get("education_required", []))
    location = calculate_location_score(job.get("location", ""), profile)

    overall = (
        skills["score"] * (SKILLS_WEIGHT / 100)
        + education * (EDUCATION_WEIGHT / 100)
        + location * (LOCATION_WEIGHT / 100)
    )

    return {
        "job_id": job["job_id"],
        "title": job["title"],
        "company": job["company"],
        "role": job.get("role", ""),
        "location": job.get("location", ""),
        "job_type": job.get("job_type", "Full-time"),
        "experience": job.get("experience", ""),
        "match_percent": round(overall, 1),
        "breakdown": {
            "skills": skills["score"],
            "education": education,
            "location": location,
        },
        "matched_skills": skills["matched_skills"],
        "missing_skills": skills["missing_skills"],
        "matched_preferred": skills["matched_preferred"],
        "missing_preferred": skills["missing_preferred"],
    }


def rank_jobs(profile: dict, jobs: list) -> list:
    """Best match first; ties broken alphabetically by title for a stable order."""
    matches = [match_job(profile, job) for job in jobs]
    return sorted(matches, key=lambda m: (-m["match_percent"], m["title"]))
