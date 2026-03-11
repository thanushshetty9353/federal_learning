from fastapi import APIRouter, UploadFile, File, Depends
import os
import shutil

from backend.auth.rbac import require_role


router = APIRouter(tags=["Datasets"])

UPLOAD_FOLDER = "datasets"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    user=Depends(require_role("ORG_NODE"))
):

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "Dataset uploaded successfully",
        "filename": file.filename
    }