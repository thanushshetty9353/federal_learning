training_metrics = []

def log_training_round(round_number, accuracy, loss):

    training_metrics.append({
        "round": round_number,
        "accuracy": accuracy,
        "loss": loss
    })


def get_training_metrics():

    return training_metrics