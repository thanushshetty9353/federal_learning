from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.db import SessionLocal
from backend.database.models import TrainingJob, ModelRegistry, User

from backend.auth.rbac import require_role


router = APIRouter(prefix="/admin", tags=["Admin"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
# Pending Users
# -----------------------------
@router.get("/users/pending")
def pending_users(
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN"))
):

    users = db.query(User).filter(User.status == "PENDING").all()

    return {"pending_users": users}


# -----------------------------
# Approve User
# -----------------------------
@router.post("/users/{user_id}/approve")
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN"))
):

    target_user = db.query(User).filter(User.id == user_id).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_user.role = target_user.requested_role
    target_user.status = "APPROVED"

    db.commit()

    return {"message": "User approved", "role": target_user.role}


# -----------------------------
# Reject User
# -----------------------------
@router.post("/users/{user_id}/reject")
def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN"))
):

    target_user = db.query(User).filter(User.id == user_id).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(target_user)
    db.commit()

    return {"message": "User rejected"}


# -----------------------------
# Training Status
# -----------------------------
@router.get("/training-jobs/status")
def training_status(
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN"))
):

    jobs = db.query(TrainingJob).all()

    return {"training_jobs": jobs}


# -----------------------------
# Latest Model
# -----------------------------
@router.get("/models/latest")
def latest_model(
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN"))
):

    model = db.query(ModelRegistry).order_by(
        ModelRegistry.id.desc()
    ).first()

    if not model:
        return {"message": "No trained model available"}

    return {
        "model_name": model.model_name,
        "accuracy": model.accuracy,
        "file_path": model.file_path
    }