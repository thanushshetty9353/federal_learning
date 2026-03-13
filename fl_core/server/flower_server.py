import flwr as fl

from flwr.common import parameters_to_ndarrays

from fl_core.strategy.fedavg_strategy import CustomFedAvg
from fl_core.server.model_manager import save_latest_model, save_round_model
from backend.services.monitoring_service import log_round

from utils.logger import logger


class SaveModelStrategy(CustomFedAvg):

    def aggregate_fit(self, server_round, results, failures):

        aggregated_parameters, metrics = super().aggregate_fit(
            server_round,
            results,
            failures
        )

        # Extract accuracy and loss if available in metrics
        # Note: Flower metrics usually come from evaluate or can be customized in fit
        # For now, let's assume we have a way to get them or use placeholders
        accuracy = 0.0
        loss = 0.0
        
        # In a real scenario, you'd pull these from 'metrics' if your clients return them
        # or from a centralized evaluation.
        
        if aggregated_parameters is not None:
            # Convert Flower parameters to numpy arrays
            weights = parameters_to_ndarrays(aggregated_parameters)

            # Save latest global model (pass job_id and accuracy)
            save_latest_model(weights, job_id=self.job_id, accuracy=accuracy)

            # Save round-wise model
            save_round_model(weights, server_round)
            
            # Log to monitoring service
            log_round(server_round, accuracy, loss)

            logger.info(
                f"Global model updated after round {server_round}"
            )

        return aggregated_parameters, metrics

    def __init__(self, job_id=None, **kwargs):
        self.job_id = job_id
        super().__init__(**kwargs)


def start_server(host="0.0.0.0", port="8080", job_id=None):

    logger.info(f"Starting Federated Server for Job {job_id}")

    strategy = SaveModelStrategy(
        job_id=job_id,
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