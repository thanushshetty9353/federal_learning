from fastapi import FastAPI

# Existing APIs
from backend.api import org_routes
from backend.api import dataset_routes
from backend.api import training_routes
from backend.api import audit_routes

# New Admin APIs
from backend.api import admin_routes

# Database initialization
from backend.database.db import engine
from backend.database.models import Base

# --------------------------------------------------
# Create database tables automatically
# --------------------------------------------------
Base.metadata.create_all(bind=engine)

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------
app = FastAPI(
    title="Privacy Preserving Federated Learning Platform",
    description="Platform for privacy-preserving collaborative AI training using Federated Learning",
    version="1.0"
)

# --------------------------------------------------
# Register API Routes
# --------------------------------------------------
app.include_router(org_routes.router)
app.include_router(dataset_routes.router)
app.include_router(training_routes.router)
app.include_router(audit_routes.router)

# Admin APIs
app.include_router(admin_routes.router)

# --------------------------------------------------
# Root endpoint
# --------------------------------------------------
@app.get("/")
def root():
    return {
        "message": "Privacy Federated Learning Platform API running",
        "docs": "/docs"
    }