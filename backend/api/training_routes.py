from fastapi import APIRouter, Depends
from backend.schemas.training_schema import TrainingJobCreate
from backend.auth.rbac import require_role
from backend.database.db import SessionLocal
from backend.database.models import TrainingJob, TrainingJobParticipant
from utils.logger import logger


router = APIRouter(
    prefix="/training-jobs",
    tags=["Training Jobs"]
)


# ------------------------------------------------
# Admin creates training job
# ------------------------------------------------
@router.post("/create")
def create_training(
    job: TrainingJobCreate,
    user=Depends(require_role("ADMIN"))
):

    db = SessionLocal()

    new_job = TrainingJob(
        model_type=job.model,
        rounds=job.rounds,
        privacy_budget=job.privacy_budget,
        status="CREATED"
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    logger.info(
        f"Admin {user.email} created training job "
        f"for model {job.model}"
    )

    return {
        "message": "Training job created",
        "job_id": new_job.id
    }


# ------------------------------------------------
# Organizations view available jobs
# ------------------------------------------------
@router.get("/list")
def list_training_jobs(
    user=Depends(require_role("ORG_NODE"))
):

    db = SessionLocal()

    jobs = db.query(TrainingJob).all()

    return jobs


# ------------------------------------------------
# Organization joins training job
# ------------------------------------------------
@router.post("/{job_id}/join")
def join_training_job(
    job_id: int,
    user=Depends(require_role("ORG_NODE"))
):

    db = SessionLocal()

    participant = TrainingJobParticipant(
        job_id=job_id,
        organization_id=user.id,
        status="JOINED"
    )

    db.add(participant)
    db.commit()

    logger.info(
        f"Organization {user.organization_name} joined training job {job_id}"
    )

    return {
        "message": "Joined training job successfully",
        "job_id": job_id
    }