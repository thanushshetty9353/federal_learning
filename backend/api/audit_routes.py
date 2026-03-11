from fastapi import APIRouter

router = APIRouter(prefix="/audit")

@router.get("/logs")
def get_logs():

    with open("logs/training.log") as f:
        logs = f.readlines()

    return {"logs": logs}