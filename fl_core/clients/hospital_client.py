import flwr as fl
import torch
import numpy as np
import requests
import os

from fl_core.model.model import Net
from fl_core.dataset.dataset_loader import load_dataset
from fl_core.training.trainer import train, evaluate

from backend.privacy.differential_privacy import apply_differential_privacy
from backend.privacy.secure_aggregation import mask_weights
from backend.services.monitoring_service import log_round

from utils.logger import logger


class HospitalClient(fl.client.NumPyClient):

    def __init__(self, hospital, job_id):

        self.hospital = hospital
        self.job_id = job_id

        self.model = Net()

        # Load dataset dynamically
        self.trainloader = load_dataset(hospital, job_id)

        logger.info(
            f"{hospital} joined training for job {job_id}"
        )

        # Register hospital node
        try:
            requests.post(
                "http://localhost:8000/nodes/register",
                params={
                    "node_id": hospital,
                    "hospital": hospital
                }
            )
        except Exception:
            logger.warning("Could not register node with backend")

    # -------------------------------------------------
    # Send parameters to server
    # -------------------------------------------------
    def get_parameters(self, config):

        weights = [
            val.cpu().numpy()
            for _, val in self.model.state_dict().items()
        ]

        masked_weights, self.mask = mask_weights(weights)

        return masked_weights

    # -------------------------------------------------
    # Receive parameters
    # -------------------------------------------------
    def set_parameters(self, parameters):

        params_dict = zip(
            self.model.state_dict().keys(),
            parameters
        )

        state_dict = {
            k: torch.tensor(v)
            for k, v in params_dict
        }

        self.model.load_state_dict(state_dict, strict=True)

    # -------------------------------------------------
    # Local Training
    # -------------------------------------------------
    def fit(self, parameters, config):

        self.set_parameters(parameters)

        optimizer = torch.optim.Adam(
            self.model.parameters(),
            lr=0.001
        )

        self.model, optimizer, self.trainloader = apply_differential_privacy(
            self.model,
            optimizer,
            self.trainloader
        )

        self.model = train(self.model, self.trainloader)

        logger.info(
            f"{self.hospital} finished local training"
        )

        # delete dataset after training
        dataset_path = f"datasets/temp/{self.hospital}_{self.job_id}.csv"

        try:
            if os.path.exists(dataset_path):
                os.remove(dataset_path)

                logger.info(
                    f"{self.hospital} dataset deleted"
                )
        except Exception as e:
            logger.warning(f"Dataset deletion error: {e}")

        return (
            self.get_parameters({}),
            len(self.trainloader.dataset),
            {}
        )

    # -------------------------------------------------
    # Evaluation
    # -------------------------------------------------
    def evaluate(self, parameters, config):

        self.set_parameters(parameters)

        loss, accuracy = evaluate(
            self.model,
            self.trainloader
        )

        logger.info(
            f"{self.hospital} evaluation accuracy: {accuracy}"
        )

        round_num = config.get("server_round", 0)

        log_round(round_num, accuracy, loss)

        return (
            float(loss),
            len(self.trainloader.dataset),
            {"accuracy": accuracy}
        )