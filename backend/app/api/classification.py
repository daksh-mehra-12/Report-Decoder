from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, ReportParameter
from app.schemas.schemas import ClassificationRequest, ClassificationResult
from app.services.classification.engine import DeterministicClassificationEngine
from app.services.explanations.service import ExplanationEngine
from app.services.auth.service import get_current_user, verify_report_access

router = APIRouter(prefix="/classification", tags=["Deterministic Classification"])

@router.post("/classify-single", response_model=ClassificationResult)
def classify_single_value(req: ClassificationRequest):
    """
    Pure standalone algorithmic classification endpoint.
    Zero LLM intervention. Strictly computes against supplied range.
    """
    res = DeterministicClassificationEngine.classify(
        test_name=req.test_name,
        numeric_value=req.numeric_value,
        raw_value=req.raw_value,
        unit=req.unit,
        range_low=req.range_low,
        range_high=req.range_high,
        reference_range_raw=req.reference_range_raw
    )
    return res

@router.get("/reports/{report_id}/parameters/{parameter_id}/explanation")
def get_parameter_explanation(
    report_id: str,
    parameter_id: str,
    lang: str = Query("en", description="Language: 'en', 'hi', or 'hinglish'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = verify_report_access(report_id, current_user, db, require_write=False)
    param = db.query(ReportParameter).filter(
        ReportParameter.id == parameter_id,
        ReportParameter.report_id == report.id
    ).first()

    if not param:
        return {"error": "Parameter not found"}

    explanation = ExplanationEngine.generate_explanation(
        test_name=param.test_name,
        result_status=param.classification_status,
        canonical_code=param.canonical_code,
        language=lang
    )
    return explanation
