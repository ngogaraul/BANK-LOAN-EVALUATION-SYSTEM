import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from passlib.exc import UnknownHashError

from app.config import JWT_SECRET, JWT_ALG, JWT_EXPIRE_MIN

# Stable hashing (no bcrypt issues)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(pw: str) -> str:
    if pw is None or str(pw).strip() == "":
        raise ValueError("password is required")
    return pwd_context.hash(pw)


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(pw, hashed)
    except UnknownHashError:
        return False
    except Exception:
        return False


def create_token(user_id: int, role: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MIN)
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": exp
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])