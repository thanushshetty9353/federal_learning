training_metrics = []


def log_round(round_num, accuracy, loss):

    training_metrics.append({
        "round": round_num,
        "accuracy": accuracy,
        "loss": loss
    })


def get_metrics():

    return training_metrics