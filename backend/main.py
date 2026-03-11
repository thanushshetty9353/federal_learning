from fastapi import FastAPI

from backend.api import org_routes
from backend.api import dataset_routes
from backend.api import training_routes
from backend.api import audit_routes

app = FastAPI(title="Privacy Federated Learning Platform")

app.include_router(org_routes.router)
app.include_router(dataset_routes.router)
app.include_router(training_routes.router)
app.include_router(audit_routes.router)