from fastapi import APIRouter, Depends

from backend.auth.rbac import require_role


router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/logs")
def get_logs(user=Depends(require_role("AUDITOR"))):

    with open("logs/training.log") as f:
        logs = f.readlines()

    return {"logs": logs}