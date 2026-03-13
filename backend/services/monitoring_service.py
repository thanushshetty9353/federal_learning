training_metrics = []


def log_round(round_num, accuracy, loss):

    training_metrics.append({
        "round": round_num,
        "accuracy": accuracy,
        "loss": loss
    })


def get_metrics():

    if not training_metrics:
        return None

    latest = training_metrics[-1]

    return {
        "rounds_data": training_metrics,
        "current_round": latest["round"],
        "accuracy": latest["accuracy"],
        "loss": latest["loss"],
        "participating_nodes": 1  # Default for now, can be improved later
    }