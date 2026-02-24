from functools import wraps
from sanic.response import json
from app.security import decode_token


def require_auth(roles=None):
    roles = roles or []

    def decorator(handler):
        @wraps(handler)
        async def wrapper(request, *args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return json({"error": "unauthorized"}, status=401)

            token = auth_header.split(" ")[1]

            try:
                payload = decode_token(token)
            except Exception:
                return json({"error": "invalid_token"}, status=401)

            user_id = payload.get("sub")
            role = str(payload.get("role", "")).strip().upper()

            request.ctx.user = {
                "id": int(user_id),
                "role": role
            }

            if roles and role not in roles:
                return json({"error": "forbidden"}, status=403)

            return await handler(request, *args, **kwargs)

        return wrapper

    return decorator