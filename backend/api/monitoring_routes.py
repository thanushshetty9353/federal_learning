from fastapi import APIRouter
from backend.services.monitoring_service import get_metrics

router = APIRouter(
    prefix="/monitoring",
    tags=["Monitoring"]
)

@router.get("/training")
def training_metrics():
    return get_metrics()