import httpx
from app.config import SCORING_API_BASE

async def call_scoring_api(payload: dict) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(f"{SCORING_API_BASE}/score", json=payload)
        r.raise_for_status()
        return r.json()
