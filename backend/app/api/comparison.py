from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Report, ReportParameter
from app.schemas.schemas import ComparabilityCheckRequest, ComparabilityResult
from app.services.auth.service import get_current_user
from app.services.comparison.service import CrossLabComparabilityGate

router = APIRouter(prefix="/comparison", tags=["Cross-Lab Comparability"])

@router.post("/evaluate", response_model=ComparabilityResult)
def evaluate_comparability(req: ComparabilityCheckRequest):
    """
    Evaluates whether two lab parameters from different dates or labs can be validly compared.
    """
    res = CrossLabComparabilityGate.evaluate(
        test_code_a=req.test_code_a,
        unit_a=req.unit_a,
        range_low_a=req.range_low_a,
        range_high_a=req.range_high_a,
        lab_name_a=req.lab_name_a,
        test_code_b=req.test_code_b,
        unit_b=req.unit_b,
        range_low_b=req.range_low_b,
        range_high_b=req.range_high_b,
        lab_name_b=req.lab_name_b
    )
    return res

@router.get("/historical-trends")
def get_historical_trends(
    canonical_code: str = Query(..., description="Canonical test code e.g. CBC_HEMOGLOBIN"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns historical data points for a user's reports for a specific analyte.
    """
    reports = db.query(Report).filter(Report.owner_id == current_user.id).order_by(Report.report_date.asc()).all()

    points = []
    for r in reports:
        param = db.query(ReportParameter).filter(
            ReportParameter.report_id == r.id,
            ReportParameter.canonical_code == canonical_code
        ).first()

        if param and param.numeric_value is not None:
            points.append({
                "report_id": r.id,
                "report_date": r.report_date or r.created_at.strftime("%Y-%m-%d"),
                "lab_name": r.lab_name,
                "value": float(param.numeric_value),
                "unit": param.unit,
                "range_low": float(param.range_low) if param.range_low is not None else None,
                "range_high": float(param.range_high) if param.range_high is not None else None,
                "status": param.classification_status
            })

    return {
        "canonical_code": canonical_code,
        "data_points": points,
        "count": len(points)
    }
