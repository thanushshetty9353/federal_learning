import os
import torch
from backend.database.db import SessionLocal
from backend.database.models import ModelRegistry

from utils.logger import logger


# ------------------------------------------------
# Base directory of project
# ------------------------------------------------
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../")
)


# ------------------------------------------------
# Models directory
# ------------------------------------------------
MODEL_DIR = os.path.join(BASE_DIR, "models")

os.makedirs(MODEL_DIR, exist_ok=True)


# ------------------------------------------------
# Save latest global model
# ------------------------------------------------
def save_latest_model(weights, job_id=None, accuracy=0.0):

    model_path = os.path.join(
        MODEL_DIR,
        "latest_model.pt"
    )

    torch.save(weights, model_path)

    # Register in database
    db = SessionLocal()
    try:
        # Check if an entry for this job already exists
        model_entry = None
        if job_id:
            model_entry = db.query(ModelRegistry).filter(ModelRegistry.job_id == job_id).first()
        
        if not model_entry:
            model_entry = ModelRegistry(
                job_id=job_id,
                model_name=f"Model for Job #{job_id}" if job_id else "Latest Global Model",
                file_path=model_path,
                accuracy=str(accuracy)
            )
            db.add(model_entry)
        else:
            model_entry.accuracy = str(accuracy)
            model_entry.file_path = model_path
        
        db.commit()
    except Exception as e:
        logger.error(f"[MODEL MANAGER] Database update failed: {e}")
    finally:
        db.close()

    logger.info(
        f"[MODEL MANAGER] Latest model saved and registered -> {model_path}"
    )


# ------------------------------------------------
# Save model per round
# ------------------------------------------------
def save_round_model(weights, round_number):

    round_model_path = os.path.join(
        MODEL_DIR,
        f"round_{round_number}.pt"
    )

    torch.save(weights, round_model_path)

    logger.info(
        f"[MODEL MANAGER] Round {round_number} model saved"
    )


# ------------------------------------------------
# Load latest model
# ------------------------------------------------
def load_latest_model():

    model_path = os.path.join(
        MODEL_DIR,
        "latest_model.pt"
    )

    if not os.path.exists(model_path):

        logger.warning(
            "Latest model requested but not found"
        )

        return None

    logger.info(
        f"Loading latest model -> {model_path}"
    )

    return torch.load(model_path)


# ------------------------------------------------
# List available models
# ------------------------------------------------
def list_models():

    if not os.path.exists(MODEL_DIR):

        return []

    files = os.listdir(MODEL_DIR)

    return files