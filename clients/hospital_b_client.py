import flwr as fl
import torch
import torch.nn as nn
import torch.optim as optim

from model.model import BreastCancerModel
from utils.data_loader import load_data

X_train, X_test, y_train, y_test = load_data("data/hospital_b_data.csv")

model = BreastCancerModel(X_train.shape[1])


def train(model, X, y, epochs=2):

    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)

    for _ in range(epochs):

        optimizer.zero_grad()
        outputs = model(X)
        loss = criterion(outputs, y)

        loss.backward()
        optimizer.step()


def test(model, X, y):

    with torch.no_grad():

        outputs = model(X)
        predicted = (outputs > 0.5).float()

        accuracy = (predicted == y).float().mean()

    return accuracy.item()


class FlowerClient(fl.client.NumPyClient):

    def get_parameters(self, config):
        return [val.cpu().numpy() for val in model.state_dict().values()]

    def set_parameters(self, parameters):
        params_dict = zip(model.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        model.load_state_dict(state_dict)

    def fit(self, parameters, config):

        self.set_parameters(parameters)

        train(model, X_train, y_train)

        return self.get_parameters(config), len(X_train), {}

    def evaluate(self, parameters, config):

        self.set_parameters(parameters)

        accuracy = test(model, X_test, y_test)

        return float(1 - accuracy), len(X_test), {"accuracy": accuracy}


fl.client.start_numpy_client(
    server_address="localhost:8080",
    client=FlowerClient(),
)