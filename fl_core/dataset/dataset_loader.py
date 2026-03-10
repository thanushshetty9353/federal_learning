import pandas as pd
import torch
from torch.utils.data import DataLoader, TensorDataset


def load_dataset(hospital):

    if hospital == "hospital_a":
        path = "fl_core/data/hospital_a_data.csv"

    elif hospital == "hospital_b":
        path = "fl_core/data/hospital_b_data.csv"

    else:
        raise ValueError("Unknown hospital")

    df = pd.read_csv(path)

    # Remove ID column
    df = df.drop(columns=["id"])

    # Features
    X = df.drop(columns=["label"]).values

    # Target
    y = df["label"].values

    # Convert to tensors
    X = torch.tensor(X).float()
    y = torch.tensor(y).long()

    dataset = TensorDataset(X, y)

    loader = DataLoader(dataset, batch_size=32, shuffle=True)

    return loader