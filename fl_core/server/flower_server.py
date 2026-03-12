import flwr as fl

from fl_core.strategy.fedavg_strategy import CustomFedAvg

from utils.logger import logger


def start_server(host="0.0.0.0", port="8080"):

    logger.info("Starting Federated Server")

    strategy = CustomFedAvg(
        fraction_fit=1.0,
        min_fit_clients=2,
        min_available_clients=2,
    )

    logger.info("Federated strategy initialized")

    fl.server.start_server(
        server_address=f"{host}:{port}",
        config=fl.server.ServerConfig(num_rounds=5),
        strategy=strategy,
    )