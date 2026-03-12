from pydantic import BaseModel, Field


class TrainingJobCreate(BaseModel):
    model: str = Field(..., example="cancer_detection_model")
    rounds: int = Field(..., example=5)
    privacy_budget: str = Field(..., example="1.0")


class TrainingJobResponse(BaseModel):
    message: str
    job_id: int