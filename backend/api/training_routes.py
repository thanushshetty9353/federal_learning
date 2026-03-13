from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse

from backend.schemas.training_schema import TrainingJobCreate
from backend.auth.rbac import require_role
from backend.database.db import SessionLocal
from backend.database.models import TrainingJob, TrainingJobParticipant, User

from utils.logger import logger

import subprocess
import sys
import os
import time


router = APIRouter(
    prefix="/training-jobs",
    tags=["Training Jobs"]
)


# Prevent starting multiple servers
flower_server_started = False

# Project backend directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

# Project root directory
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))

SERVER_SCRIPT = os.path.join(BASE_DIR, "scripts", "start_server.py")
CLIENT_SCRIPT = os.path.join(BASE_DIR, "scripts", "start_client.py")


# ------------------------------------------------
# Admin creates training job
# ------------------------------------------------
@router.post("/create")
def create_training(
    job: TrainingJobCreate,
    user=Depends(require_role("ADMIN"))
):

    global flower_server_started

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
        f"Admin {user['user_id']} created training job for model {job.model}"
    )

    # Start Flower server automatically (only once)
    if not flower_server_started:

        try:

            subprocess.Popen(
                [sys.executable, SERVER_SCRIPT, str(new_job.id)],
                cwd=BASE_DIR
            )

            flower_server_started = True

            logger.info("Federated server started automatically")

            time.sleep(3)

        except Exception as e:

            logger.error(f"Server start failed: {e}")

    return {
        "message": "Training job created",
        "job_id": new_job.id
    }


# ------------------------------------------------
# List jobs (Admin + Organization)
# ------------------------------------------------
@router.get("/list")
def list_training_jobs(
    user=Depends(require_role("ORG_NODE", "ADMIN"))
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

    organization = db.query(User).filter(
        User.id == user["user_id"]
    ).first()

    participant = TrainingJobParticipant(
        job_id=job_id,
        organization_id=user["user_id"],
        status="JOINED"
    )

    db.add(participant)
    db.commit()

    logger.info(
        f"Organization {organization.organization_name} joined training job {job_id}"
    )

    return {
        "message": "Joined training job successfully",
        "job_id": job_id
    }


# ------------------------------------------------
# Organization starts training
# ------------------------------------------------
@router.post("/{job_id}/train")
def start_training(
    job_id: int,
    user=Depends(require_role("ORG_NODE"))
):

    db = SessionLocal()

    organization = db.query(User).filter(
        User.id == user["user_id"]
    ).first()

    org_name = organization.organization_name.replace(" ", "_")

    try:

        subprocess.Popen(
            [
                sys.executable,
                CLIENT_SCRIPT,
                org_name,
                str(job_id)
            ],
            cwd=BASE_DIR
        )

        logger.info(
            f"{org_name} started training for job {job_id}"
        )

    except Exception as e:

        logger.error(f"Training start failed: {e}")

        return {
            "error": "Could not start training"
        }

    return {
        "message": "Training started",
        "organization": org_name,
        "job_id": job_id
    }


# ------------------------------------------------
# Admin: View job participation stats
# ------------------------------------------------
@router.get("/admin/job-stats")
def job_stats(
    user=Depends(require_role("ADMIN"))
):

    db = SessionLocal()

    jobs = db.query(TrainingJob).all()

    response = []

    for job in jobs:

        participants = db.query(
            TrainingJobParticipant
        ).filter(
            TrainingJobParticipant.job_id == job.id
        ).count()

        response.append({
            "job_id": job.id,
            "model": job.model_type,
            "rounds": job.rounds,
            "participants": participants,
            "status": job.status
        })

    return response


# ------------------------------------------------
# Admin: Download latest trained model
# ------------------------------------------------
@router.get("/admin/models/latest")
def download_latest_model(
    user=Depends(require_role("ADMIN"))
):

    project_root = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../..")
    )

    model_path = os.path.join(project_root, "models", "latest_model.pt")

    logger.info(f"Admin requested model download: {model_path}")

    if not os.path.exists(model_path):

        logger.warning(f"Model not found at {model_path}")

        return {
            "error": "No trained model available"
        }

    return FileResponse(
        path=model_path,
        filename="latest_global_model.pt",
        media_type="application/octet-stream"
    )