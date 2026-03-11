from fastapi import APIRouter
from backend.schemas.org_schema import OrganizationCreate

router = APIRouter(prefix="/organizations")


@router.post("/register")
def register_org(data: OrganizationCreate):

    return {
        "message": "Organization registered",
        "organization": data
    }