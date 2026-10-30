from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, ReportParameter
from app.schemas.schemas import QualityRadarResponse
from app.services.auth.service import get_current_user, verify_report_access
from app.services.quality_radar.service import ReportQualityRadarService

router = APIRouter(prefix="/reports/{report_id}/quality-radar", tags=["Report Quality Radar"])

@router.get("", response_model=QualityRadarResponse)
def get_quality_radar(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates document legibility, contrast, and extraction completeness.
    """
    report = verify_report_access(report_id, current_user, db, require_write=False)
    params = db.query(ReportParameter).filter(ReportParameter.report_id == report.id).all()

    radar_eval = ReportQualityRadarService.evaluate(report, params)
    return radar_eval
