from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.db import SessionLocal
from backend.database.models import Organization, TrainingJob, ModelRegistry, User

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
# Pending Organizations
# -----------------------------
@router.get("/organizations/pending")
def pending_organizations(
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN"))
):

    orgs = db.query(Organization).filter(
        Organization.status == "PENDING"
    ).all()

    return {"pending_organizations": orgs}


# -----------------------------
# Approve Organization
# -----------------------------
@router.post("/organizations/{org_id}/approve")
def approve_organization(
    org_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN"))
):

    org = db.query(Organization).filter(
        Organization.id == org_id
    ).first()

    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.status = "APPROVED"

    db.commit()

    return {"message": "Organization approved", "organization_id": org_id}


# -----------------------------
# Reject Organization
# -----------------------------
@router.post("/organizations/{org_id}/reject")
def reject_organization(
    org_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN"))
):

    org = db.query(Organization).filter(
        Organization.id == org_id
    ).first()

    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.status = "REJECTED"

    db.commit()

    return {"message": "Organization rejected", "organization_id": org_id}


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