from utils.logger import logger

datasets = []


def register_dataset(dataset_name, organization):

    dataset = {
        "name": dataset_name,
        "organization": organization,
        "location": "hospital_node"
    }

    datasets.append(dataset)

    logger.info(f"Dataset registered: {dataset_name} from {organization}")

    return dataset


def list_datasets():

    return datasets