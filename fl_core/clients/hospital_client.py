import flwr as fl
import torch
import numpy as np
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

        self.hospital = hospital.replace(" ", "_")
        self.job_id = job_id

        # Load dataset
        self.trainloader, feature_size = load_dataset(self.hospital, job_id)

        # Initialize model
        self.model = Net(feature_size)

        logger.info(
            f"{self.hospital} joined training for job {job_id}"
        )

    # -------------------------------------------------
    # Send parameters
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

        # Create optimizer
        optimizer = torch.optim.Adam(
            self.model.parameters(),
            lr=0.0003
        )

        # Model must be train mode before DP
        self.model.train()

        # Apply Differential Privacy
        self.model, optimizer, self.trainloader = apply_differential_privacy(
            self.model,
            optimizer,
            self.trainloader
        )

        # Train locally with SAME optimizer
        self.model = train(
            self.model,
            self.trainloader,
            optimizer
        )

        logger.info(
            f"{self.hospital} finished local training"
        )

        # Delete dataset after training
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

        self.model.eval()

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