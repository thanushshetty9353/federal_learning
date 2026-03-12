from fastapi import APIRouter
from backend.node_management.node_service import register_node, get_nodes

router = APIRouter(prefix="/nodes")

@router.post("/register")
def register(node_id: str, organization: str):

    register_node(node_id, organization)

    return {"message": "Node registered"}


@router.get("/")
def nodes():

    return get_nodes()