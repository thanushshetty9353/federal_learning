import flwr as fl
import torch
import numpy as np

from fl_core.model.model import Net
from fl_core.dataset.dataset_loader import load_dataset
from fl_core.training.trainer import train, evaluate
from backend.privacy.differential_privacy import apply_differential_privacy
from backend.privacy.secure_aggregation import mask_weights
from utils.logger import logger


class HospitalClient(fl.client.NumPyClient):

    def __init__(self, hospital):

        self.hospital = hospital
        self.model = Net()

        self.trainloader = load_dataset(hospital)

        logger.info(f"{hospital} joined training")

    def get_parameters(self, config):

        weights = [val.cpu().numpy() for _, val in self.model.state_dict().items()]

        # Secure aggregation masking
        masked_weights, self.mask = mask_weights(weights)

        return masked_weights

    def set_parameters(self, parameters):

        params_dict = zip(self.model.state_dict().keys(), parameters)

        state_dict = {k: torch.tensor(v) for k, v in params_dict}

        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):

        self.set_parameters(parameters)

        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)

        # Differential Privacy applied
        self.model, optimizer, self.trainloader = apply_differential_privacy(
            self.model,
            optimizer,
            self.trainloader
        )

        self.model = train(self.model, self.trainloader)

        logger.info(f"{self.hospital} finished local training")

        return self.get_parameters({}), len(self.trainloader.dataset), {}

    def evaluate(self, parameters, config):

        self.set_parameters(parameters)

        loss, accuracy = evaluate(self.model, self.trainloader)

        logger.info(f"{self.hospital} evaluation accuracy: {accuracy}")

        return float(loss), len(self.trainloader.dataset), {"accuracy": accuracy}