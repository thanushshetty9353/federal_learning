from jose import jwt, JWTError
from datetime import datetime, timedelta

from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)


# -----------------------------
# Create JWT Token
# -----------------------------
def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(hours=2)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# -----------------------------
# Verify JWT Token
# -----------------------------
def verify_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = None
    if credentials:
        token = credentials.credentials
    else:
        # Check query parameter for token
        token = request.query_params.get("token")

    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing"
        )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")
        role = payload.get("role")

        if user_id is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        return {
            "user_id": user_id,
            "role": role
        }

    except JWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


# -----------------------------
# Get Current User
# -----------------------------
def get_current_user(
    user: dict = Depends(verify_token)
):

    return user