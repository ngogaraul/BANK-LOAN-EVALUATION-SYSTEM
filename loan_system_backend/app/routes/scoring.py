from sanic import Blueprint
from sanic.response import json
from sqlalchemy import select, desc

from app.db import SessionLocal
from app.models import LoanApplication, ClientFinancial, CreditScore
from app.http_client import call_scoring_api
from app.auth_guard import require_auth
from app.utils import payload_signature

bp = Blueprint("scoring", url_prefix="/applications")


@bp.post("/<app_id:int>/score")
@require_auth(roles=["ADMIN", "ANALYST"])
async def score_application(request, app_id: int):
    async with SessionLocal() as session:
        app_ = await session.get(LoanApplication, app_id)
        if not app_:
            return json({"error": "application not found"}, status=404)

        # Optional: block scoring finalized apps
        if app_.status in {"APPROVED", "REJECTED"}:
            return json({
                "error": "already_finalized",
                "message": f"Application is already {app_.status}. Admin override required to re-score."
            }, status=409)

        fin = await session.scalar(
            select(ClientFinancial).where(ClientFinancial.client_id == app_.client_id)
        )
        if not fin:
            return json({"error": "client financials not found"}, status=404)

        payload = {
            "Outstanding": fin.outstanding,
            "Payment plan": fin.payment_plan,
            "Remaining Period": fin.remaining_period,
            "Periodicity": fin.periodicity,
            "Class": fin.class_value,
            "Compulsory saving": fin.compulsory_saving,
            "Voluntary saving": fin.voluntary_saving,
            "Salary": fin.salary,
            " Duration": fin.duration,
            "Start date": fin.start_date or ""
        }

        sig = payload_signature(payload)

        # ✅ Check latest existing score for this application
        latest_score = await session.scalar(
            select(CreditScore)
            .where(CreditScore.application_id == app_id)
            .order_by(desc(CreditScore.scored_at))
            .limit(1)
        )

        if latest_score:
            meta = {}
            if isinstance(latest_score.top_factors, dict):
                meta = (latest_score.top_factors or {}).get("_meta", {}) or {}

            if meta.get("payload_sig") == sig:
                # No changes -> return cached
                return json({
                    "application_id": app_.id,
                    "status": app_.status,
                    "cached": True,
                    "score": {
                        "probability_default": latest_score.probability_default,
                        "credit_score": latest_score.credit_score,
                        "risk_band": latest_score.risk_band,
                        "decision": latest_score.decision_suggestion,
                        "top_factors": (latest_score.top_factors or {}).get("factors", latest_score.top_factors)
                    }
                })

        # Otherwise call ML API
        try:
            result = await call_scoring_api(payload)
        except Exception as e:
            return json({"error": "scoring service failed", "message": str(e)}, status=502)

        # Store factors in a structured dict so we can attach meta
        stored_top_factors = {
            "factors": result.get("top_factors", []),
            "_meta": {
                "payload_sig": sig
            }
        }

        cs = CreditScore(
            application_id=app_.id,
            probability_default=float(result["probability_default"]),
            credit_score=int(result["credit_score"]),
            risk_band=str(result["risk_band"]),
            decision_suggestion=str(result["decision"]),
            top_factors=stored_top_factors,
            model_version="v1"
        )
        session.add(cs)

        app_.status = "SCORED"
        await session.commit()

        return json({
            "application_id": app_.id,
            "status": app_.status,
            "cached": False,
            "score": result
        })