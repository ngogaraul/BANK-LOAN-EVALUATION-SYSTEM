from sanic import Blueprint
from sanic.response import json
from sqlalchemy import select

from app.db import SessionLocal
from app.models import User
from app.security import hash_password, verify_password, create_token
from app.auth_guard import require_auth

bp = Blueprint("auth", url_prefix="/auth")


@bp.post("/register")
@require_auth(roles=["ADMIN"])
async def register(request):
    data = request.json or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = (data.get("role") or "ANALYST").strip().upper()

    if not name or not email or not password:
        return json({"error": "name, email, password required"}, status=400)

    async with SessionLocal() as session:
        existing = await session.scalar(select(User).where(User.email == email))
        if existing:
            return json({"error": "user_exists"}, status=409)

        user = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role=role
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        return json({
            "message": "user_created",
            "user_id": user.id
        })


@bp.post("/login")
async def login(request):
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    async with SessionLocal() as session:
        user = await session.scalar(select(User).where(User.email == email))
        if not user:
            return json({"error": "invalid_credentials"}, status=401)

        if not verify_password(password, user.password_hash):
            return json({"error": "invalid_credentials"}, status=401)

        token = create_token(user.id, user.role)

        return json({
            "token": token,
            "role": user.role,
            "user_id": user.id
        })