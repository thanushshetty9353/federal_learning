from backend.database.db import SessionLocal
from backend.database.models import Dataset
from utils.logger import logger


def register_dataset(user_id, metadata, sensitivity):

    db = SessionLocal()

    dataset = Dataset(
        user_id=user_id,
        schema_metadata=metadata,
        sensitivity_level=sensitivity
    )

    db.add(dataset)
    db.commit()

    logger.info(f"Dataset registered for user {user_id}")

    return dataset


def list_datasets():

    db = SessionLocal()

    datasets = db.query(Dataset).all()

    return datasets