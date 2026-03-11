from pydantic import BaseModel, Field


class TrainingJobCreate(BaseModel):
    model: str = Field(..., example="cancer_detection_model")
    rounds: int = Field(..., example=5)


class TrainingJobResponse(BaseModel):
    message: str
    rounds: int