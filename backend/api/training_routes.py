from fastapi import APIRouter
from backend.schemas.training_schema import TrainingJobCreate
from backend.services.training_service import start_training

router = APIRouter(prefix="/training-jobs")


@router.post("/create")
def create_training(job: TrainingJobCreate):

    return start_training(job)