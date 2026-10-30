from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, ReportParameter
from app.services.auth.service import get_current_user, verify_report_access
from app.services.exports.service import PdfExportService

router = APIRouter(prefix="/reports/{report_id}/export-pdf", tags=["PDF Export"])

@router.get("")
def export_report_pdf(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Downloads doctor-ready appointment summary PDF.
    Enforces authorization check identically to source report.
    """
    report = verify_report_access(report_id, current_user, db, require_write=False)
    parameters = db.query(ReportParameter).filter(ReportParameter.report_id == report.id).all()

    pdf_bytes = PdfExportService.generate_doctor_summary_pdf(report, parameters)

    filename = f"LabLens_Summary_{report.id[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
