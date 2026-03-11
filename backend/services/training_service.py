import subprocess

def start_training(job):

    rounds = job.rounds
    model = job.model

    subprocess.Popen(
        ["python", "scripts/start_server.py"]
    )

    return {
        "message": "Federated training started",
        "rounds": rounds
    }