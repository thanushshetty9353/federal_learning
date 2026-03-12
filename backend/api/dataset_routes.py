from fastapi import APIRouter, UploadFile, File, Form, Depends
import os
import shutil

from backend.services.dataset_service import register_dataset
from backend.auth.rbac import require_role
from backend.database.db import SessionLocal
from backend.database.models import User


router = APIRouter(prefix="/datasets", tags=["Datasets"])

UPLOAD_DIR = "datasets/temp"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
def upload_dataset(
    job_id: int = Form(...),
    dataset_name: str = Form(...),
    file: UploadFile = File(...),
    user=Depends(require_role("ORG_NODE"))
):

    db = SessionLocal()

    # get organization from logged-in user
    org = db.query(User).filter(
        User.id == user["user_id"]
    ).first()

    # normalize organization name
    organization = org.organization_name.replace(" ", "_")

    file_path = f"{UPLOAD_DIR}/{organization}_{job_id}.csv"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    dataset = register_dataset(dataset_name, organization)

    return {
        "message": "Dataset uploaded successfully",
        "dataset_id": dataset.id,
        "file_path": file_path
    }