from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from backend.database.db import SessionLocal
from backend.database.models import User

from backend.auth.password_utils import hash_password, verify_password
from backend.auth.jwt_auth import create_access_token


router = APIRouter(prefix="/auth", tags=["Authentication"])


# -------------------------
# Database Session
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# Register User
# -------------------------
@router.post("/register")
def register_user(
    email: str,
    password: str,
    requested_role: str,
    organization_name: Optional[str] = None,
    db: Session = Depends(get_db)
):

    # ADMIN role cannot be requested
    if requested_role == "ADMIN":
        raise HTTPException(status_code=403, detail="Cannot request ADMIN role")

    # ORG_NODE must provide organization name
    if requested_role == "ORG_NODE" and not organization_name:
        raise HTTPException(
            status_code=400,
            detail="organization_name is required for ORG_NODE"
        )

    # Check if user exists
    existing = db.query(User).filter(User.email == email).first()

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(password)

    user = User(
        email=email,
        password=hashed,
        requested_role=requested_role,
        organization_name=organization_name,
        role=None,
        status="PENDING"
    )

    db.add(user)
    db.commit()

    return {
        "message": "Registration submitted for admin approval",
        "requested_role": requested_role,
        "organization": organization_name
    }


# -------------------------
# Login User
# -------------------------
@router.post("/login")
def login_user(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.status != "APPROVED":
        raise HTTPException(
            status_code=403,
            detail="Account not approved by admin"
        )

    if not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "user_id": user.id,
        "role": user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "organization": user.organization_name
    }