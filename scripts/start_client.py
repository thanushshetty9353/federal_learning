import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import flwr as fl
from fl_core.clients.hospital_client import HospitalClient

hospital = sys.argv[1]

fl.client.start_numpy_client(
    server_address="127.0.0.1:8080",
    client=HospitalClient(hospital),
)