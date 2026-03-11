from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class DatasetCreate(BaseModel):
    org_id: int = Field(..., example=1)
    dataset_name: str = Field(..., example="cancer_dataset")
    schema: str = Field(..., example="patient_features")


class DatasetResponse(BaseModel):
    dataset_id: int
    org_id: int
    dataset_name: str
    schema: str
    file_path: str
    uploaded_at: datetime


class DatasetUploadResponse(BaseModel):
    message: str
    dataset: DatasetResponse