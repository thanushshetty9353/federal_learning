import sys
import os

# Allow imports from project root
sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

import flwr as fl
from fl_core.clients.hospital_client import HospitalClient


# ---------------------------------------
# Arguments passed from API
# ---------------------------------------
hospital = sys.argv[1]
job_id = int(sys.argv[2])


# ---------------------------------------
# Start client training
# ---------------------------------------
client = HospitalClient(hospital, job_id)

fl.client.start_client(
    server_address="127.0.0.1:8080",
    client=client.to_client()
)


# ---------------------------------------
# Training finished
# Delete dataset for privacy
# ---------------------------------------
hospital_clean = hospital.replace(" ", "_")

dataset_path = os.path.join(
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..")),
    "datasets",
    "temp",
    f"{hospital_clean}_{job_id}.csv"
)

if os.path.exists(dataset_path):
    try:
        os.remove(dataset_path)
        print(f"[CLEANUP] Dataset deleted: {dataset_path}")
    except Exception as e:
        print(f"[CLEANUP ERROR] Could not delete dataset: {e}")
else:
    print(f"[CLEANUP] Dataset already removed or not found: {dataset_path}")


print(f"[CLIENT] Training completed for {hospital_clean}")