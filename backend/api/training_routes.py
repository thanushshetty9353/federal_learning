from fastapi import APIRouter, Depends

from backend.schemas.training_schema import TrainingJobCreate
from backend.services.training_service import start_training
from backend.auth.rbac import require_role


router = APIRouter(prefix="/training-jobs", tags=["Training Jobs"])


@router.post("/create")
def create_training(
    job: TrainingJobCreate,
    user=Depends(require_role("ADMIN"))
):

    return start_training(job)