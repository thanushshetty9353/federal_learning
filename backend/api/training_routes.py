from fastapi import APIRouter, Depends
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

# Project root directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

# Paths to scripts
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
        f"Admin {user['user_id']} created training job "
        f"for model {job.model}"
    )

    # Start Flower server automatically (only once)
    if not flower_server_started:

        try:

            subprocess.Popen(
                [sys.executable, SERVER_SCRIPT],
                cwd=BASE_DIR
            )

            flower_server_started = True

            logger.info("Federated server started automatically")

            # Wait for server to initialize
            time.sleep(3)

        except Exception as e:

            logger.error(f"Server start failed: {e}")

    return {
        "message": "Training job created",
        "job_id": new_job.id
    }


# ------------------------------------
# Organizations view available jobs
# ------------------------------------
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
        f"Organization {organization.organization_name} "
        f"joined training job {job_id}"
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

    # Normalize organization name
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