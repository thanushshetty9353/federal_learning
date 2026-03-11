from pydantic import BaseModel, Field


class OrganizationCreate(BaseModel):
    name: str = Field(..., example="Hospital A")
    certificate: str = Field(..., example="cert123")


class OrganizationResponse(BaseModel):
    message: str
    organization: dict