from flwr.server.strategy import FedAvg
from utils.logger import logger


class CustomFedAvg(FedAvg):

    def aggregate_fit(self, rnd, results, failures):

        logger.info(f"Round {rnd} aggregation started")

        print("Round:", rnd)
        print("Clients participated:", len(results))

        aggregated = super().aggregate_fit(rnd, results, failures)

        logger.info("Aggregation completed")

        if aggregated is not None:
            logger.info(f"Round {rnd} global model updated")

        return aggregated