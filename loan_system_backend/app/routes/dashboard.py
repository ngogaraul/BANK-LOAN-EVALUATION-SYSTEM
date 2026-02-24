from sanic import Blueprint
from sanic.response import json
from sqlalchemy import select, func, desc

from app.db import SessionLocal
from app.auth_guard import require_auth
from app.models import LoanApplication, CreditScore

bp = Blueprint("dashboard", url_prefix="/dashboard")


@bp.get("/")
@require_auth(roles=["ADMIN", "ANALYST"])
async def dashboard(request):
    async with SessionLocal() as session:
        # Counts by status
        status_rows = (await session.execute(
            select(LoanApplication.status, func.count(LoanApplication.id))
            .group_by(LoanApplication.status)
        )).all()

        status_counts = {s: int(c) for s, c in status_rows}

        # Recent applications
        recent = (await session.execute(
            select(LoanApplication)
            .order_by(desc(LoanApplication.id))
            .limit(10)
        )).scalars().all()

        recent_list = [{
            "id": a.id,
            "client_id": a.client_id,
            "amount_requested": a.amount_requested,
            "purpose": a.purpose,
            "term_requested": a.term_requested,
            "status": a.status,
            "submitted_at": str(a.submitted_at)
        } for a in recent]

        # Risk band distribution (latest scores only is ideal, but for now simple counts)
        band_rows = (await session.execute(
            select(CreditScore.risk_band, func.count(CreditScore.id))
            .group_by(CreditScore.risk_band)
        )).all()

        risk_band_counts = {b: int(c) for b, c in band_rows if b is not None}

        return json({
            "status_counts": status_counts,
            "risk_band_counts": risk_band_counts,
            "recent_applications": recent_list
        })