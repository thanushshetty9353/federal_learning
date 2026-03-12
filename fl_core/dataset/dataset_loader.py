import os
import pandas as pd
import torch
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler


def load_dataset(hospital, job_id):

    hospital = hospital.replace(" ", "_")

    file_path = f"datasets/temp/{hospital}_{job_id}.csv"

    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"Dataset not found for {hospital} job {job_id}. "
            f"Expected file: {file_path}"
        )

    df = pd.read_csv(file_path)

    X = df.drop("label", axis=1).values
    y = df["label"].values

    scaler = StandardScaler()
    X = scaler.fit_transform(X)

    feature_size = X.shape[1]

    X = torch.tensor(X, dtype=torch.float32)
    y = torch.tensor(y, dtype=torch.long)

    dataset = TensorDataset(X, y)

    loader = DataLoader(dataset, batch_size=32, shuffle=True)

    return loader, feature_size