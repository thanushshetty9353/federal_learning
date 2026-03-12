from fastapi import APIRouter, Depends

from backend.database.db import SessionLocal
from backend.database.models import TrainingJobParticipant
from backend.auth.rbac import require_role

from utils.logger import logger


router = APIRouter(
    prefix="/training-jobs",
    tags=["Training Participation"]
)


@router.post("/{job_id}/join")
def join_training(job_id: int, user=Depends(require_role("ORG_NODE"))):

    db = SessionLocal()

    # create participation record
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
        "message": "Successfully joined training job",
        "job_id": job_id
    }