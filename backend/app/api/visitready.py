from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, ReportParameter
from app.schemas.schemas import VisitReadyResponse
from app.services.auth.service import get_current_user, verify_report_access
from app.services.visitready.service import VisitReadyService

router = APIRouter(prefix="/reports/{report_id}/visit-ready", tags=["VisitReady"])

@router.get("", response_model=VisitReadyResponse)
def get_visit_ready_summary(
    report_id: str,
    lang: str = Query("en", description="Language: 'en', 'hi', or 'hinglish'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = verify_report_access(report_id, current_user, db, require_write=False)
    params = db.query(ReportParameter).filter(ReportParameter.report_id == report.id).all()

    vr = VisitReadyService.generate(report, params, patient_context=None, language=lang)
    return vr

@router.post("/with-context", response_model=VisitReadyResponse)
def get_visit_ready_with_patient_context(
    report_id: str,
    lang: str = Query("en"),
    context: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = verify_report_access(report_id, current_user, db, require_write=False)
    params = db.query(ReportParameter).filter(ReportParameter.report_id == report.id).all()

    vr = VisitReadyService.generate(report, params, patient_context=context, language=lang)
    return vr
