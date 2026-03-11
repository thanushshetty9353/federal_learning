from fastapi import HTTPException

def require_role(role):

    def wrapper(user):

        if user.role != role:
            raise HTTPException(status_code=403, detail="Access denied")

    return wrapper