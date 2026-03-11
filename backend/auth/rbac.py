from fastapi import HTTPException, Depends

from backend.auth.jwt_auth import get_current_user


# -----------------------------
# Role Based Access Control
# -----------------------------
def require_role(role: str):

    def role_checker(user: dict = Depends(get_current_user)):

        user_role = user.get("role")

        if user_role != role:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role: {role}"
            )

        return user

    return role_checker