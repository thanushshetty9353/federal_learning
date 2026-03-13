from fastapi import HTTPException, Depends
from backend.auth.jwt_auth import get_current_user


# -----------------------------
# Role Based Access Control
# -----------------------------
def require_role(*roles: str):

    def role_checker(user: dict = Depends(get_current_user)):

        user_role = user.get("role")

        # Check if user's role is allowed
        if user_role not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role(s): {', '.join(roles)}"
            )

        return user

    return role_checker