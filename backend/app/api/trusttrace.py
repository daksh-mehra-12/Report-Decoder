from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, ReportParameter
from app.schemas.schemas import TrustTraceResponse
from app.services.auth.service import get_current_user, verify_report_access
from app.services.trusttrace.service import TrustTraceService

router = APIRouter(prefix="/reports/{report_id}/parameters/{parameter_id}/trust-trace", tags=["TrustTrace"])

@router.get("", response_model=TrustTraceResponse)
def get_parameter_trust_trace(
    report_id: str,
    parameter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns full inspectable cryptographic and clinical provenance chain.
    """
    report = verify_report_access(report_id, current_user, db, require_write=False)
    param = db.query(ReportParameter).filter(
        ReportParameter.id == parameter_id,
        ReportParameter.report_id == report.id
    ).first()

    if not param:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parameter not found.")

    trace = TrustTraceService.assemble_trace(param, report)
    return trace
