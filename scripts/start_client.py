import sys
import os

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

import flwr as fl
from fl_core.clients.hospital_client import HospitalClient


# arguments from API
hospital = sys.argv[1]
job_id = int(sys.argv[2])


client = HospitalClient(hospital, job_id)

fl.client.start_client(
    server_address="127.0.0.1:8080",
    client=client.to_client()
)