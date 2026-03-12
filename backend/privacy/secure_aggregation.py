import numpy as np


def mask_weights(weights):

    masks = []
    masked_weights = []

    for w in weights:

        mask = np.random.normal(0, 0.01, w.shape)

        masked = w + mask

        masks.append(mask)

        masked_weights.append(masked)

    return masked_weights, masks