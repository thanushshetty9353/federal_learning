from fastapi import APIRouter, Depends
import subprocess
from backend.auth.rbac import require_role

router = APIRouter(prefix="/client-training", tags=["Client Training"])


@router.post("/{job_id}/train")
def start_client_training(job_id: int, user=Depends(require_role("ORG_NODE"))):

    subprocess.Popen(
        ["python", "scripts/start_client.py", user.email]
    )

    return {"message": "Local training started"}