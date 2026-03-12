from backend.database.db import SessionLocal
from backend.database.models import Dataset
from utils.logger import logger


def register_dataset(dataset_name, organization, sensitivity="HIGH"):

    db = SessionLocal()

    dataset = Dataset(
        dataset_name=dataset_name,
        organization=organization,
        sensitivity_level=sensitivity
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    logger.info(
        f"Dataset '{dataset_name}' registered for organization '{organization}'"
    )

    return dataset


def list_datasets():

    db = SessionLocal()

    datasets = db.query(Dataset).all()

    return datasets