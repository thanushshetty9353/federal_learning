import flwr as fl

from flwr.common import parameters_to_ndarrays

from fl_core.strategy.fedavg_strategy import CustomFedAvg
from fl_core.server.model_manager import save_latest_model, save_round_model

from utils.logger import logger


class SaveModelStrategy(CustomFedAvg):

    def aggregate_fit(self, server_round, results, failures):

        aggregated_parameters, metrics = super().aggregate_fit(
            server_round,
            results,
            failures
        )

        if aggregated_parameters is not None:

            # Convert Flower parameters to numpy arrays
            weights = parameters_to_ndarrays(aggregated_parameters)

            # Save latest global model
            save_latest_model(weights)

            # Save round-wise model
            save_round_model(weights, server_round)

            logger.info(
                f"Global model updated after round {server_round}"
            )

        return aggregated_parameters, metrics


def start_server(host="0.0.0.0", port="8080"):

    logger.info("Starting Federated Server")

    strategy = SaveModelStrategy(
        fraction_fit=1.0,
        min_fit_clients=1,
        min_available_clients=1,
        min_evaluate_clients=1,
    )

    logger.info("Federated strategy initialized")

    fl.server.start_server(
        server_address=f"{host}:{port}",
        config=fl.server.ServerConfig(num_rounds=5),
        strategy=strategy,
    )