import os
import torch

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
def save_latest_model(weights):

    model_path = os.path.join(
        MODEL_DIR,
        "latest_model.pt"
    )

    torch.save(weights, model_path)

    logger.info(
        f"[MODEL MANAGER] Latest model saved -> {model_path}"
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