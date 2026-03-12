import subprocess
from backend.database.db import SessionLocal
from backend.database.models import TrainingJob
from utils.logger import logger


def create_training_job(model, rounds):

    db = SessionLocal()

    job = TrainingJob(
        model_type=model,
        rounds=rounds,
        status="CREATED"
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    logger.info(f"Training job {job.id} created")

    # Start federated server automatically
    try:
        subprocess.Popen(
            ["python", "scripts/start_server.py"]
        )
        logger.info("Federated server started")
    except Exception as e:
        logger.error(f"Could not start server: {e}")

    return job