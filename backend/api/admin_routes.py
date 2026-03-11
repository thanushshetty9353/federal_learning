from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.db import SessionLocal
from backend.database.models import Organization, TrainingJob, ModelRegistry


router = APIRouter(prefix="/admin", tags=["Admin"])


# -----------------------------
# Database Dependency
# -----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
# 1️⃣ View Pending Organizations
# -----------------------------
@router.get("/organizations/pending")
def pending_organizations(db: Session = Depends(get_db)):

    orgs = db.query(Organization).filter(
        Organization.status == "PENDING"
    ).all()

    return {"pending_organizations": orgs}


# -----------------------------
# 2️⃣ Approve Organization
# -----------------------------
@router.post("/organizations/{org_id}/approve")
def approve_organization(org_id: int, db: Session = Depends(get_db)):

    org = db.query(Organization).filter(
        Organization.id == org_id
    ).first()

    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.status = "APPROVED"

    db.commit()

    return {"message": "Organization approved", "organization_id": org_id}


# -----------------------------
# 3️⃣ Reject Organization
# -----------------------------
@router.post("/organizations/{org_id}/reject")
def reject_organization(org_id: int, db: Session = Depends(get_db)):

    org = db.query(Organization).filter(
        Organization.id == org_id
    ).first()

    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.status = "REJECTED"

    db.commit()

    return {"message": "Organization rejected", "organization_id": org_id}


# -----------------------------
# 4️⃣ Training Status
# -----------------------------
@router.get("/training-jobs/status")
def training_status(db: Session = Depends(get_db)):

    jobs = db.query(TrainingJob).all()

    return {"training_jobs": jobs}


# -----------------------------
# 5️⃣ View Latest Model
# -----------------------------
@router.get("/models/latest")
def latest_model(db: Session = Depends(get_db)):

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