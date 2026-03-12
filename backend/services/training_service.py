import subprocess
from utils.logger import logger


def start_training(job):

    rounds = job.rounds
    model = job.model

    logger.info(
        f"Starting federated training for model {model} "
        f"with {rounds} rounds"
    )

    # Start Flower server
    subprocess.Popen(
        ["python", "scripts/start_server.py"]
    )

    return {
        "message": "Federated training started",
        "model": model,
        "rounds": rounds
    }