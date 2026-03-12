from utils.logger import logger

organizations = []


def register_organization(name):

    org = {
        "name": name,
        "status": "active"
    }

    organizations.append(org)

    logger.info(f"Organization registered: {name}")

    return org


def get_organizations():

    return organizations