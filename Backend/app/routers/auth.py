from fastapi import APIRouter, HTTPException, status
from bson import ObjectId

from app.database import db
from app.models.auth import UserRegister, UserLogin, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


def user_to_public_dict(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    await db.student_profiles.insert_one({
        "user_id": user_id,
        "location": None,
        "education": None,
        "skills": [],
        "projects": [],
        "career_goal": None,
    })

    token = create_access_token(user_id)
    user_doc["_id"] = result.inserted_id
    return TokenResponse(access_token=token, user=user_to_public_dict(user_doc))


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    token = create_access_token(str(user["_id"]))
    return TokenResponse(access_token=token, user=user_to_public_dict(user))