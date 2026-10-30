import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.models import (
    User, Report, ReportParameter, QualityRadarEvaluation,
    AuditLog, UserRole, PrivacyMode, ReportStatus
)
from app.schemas.schemas import ReportOut, ReportDetailOut
from app.services.auth.service import get_current_user, verify_report_access
from app.services.extraction.service import DocumentExtractionService
from app.services.quality_radar.service import ReportQualityRadarService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/upload", response_model=ReportDetailOut, status_code=status.HTTP_201_CREATED)
async def upload_report(
    file: UploadFile = File(...),
    privacy_mode: str = Form("private_history"),
    lab_name: Optional[str] = Form(None),
    report_date: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can upload their own medical reports."
        )

    # 1. Read file content and validate
    content = await file.read()
    is_valid, reason = DocumentExtractionService.validate_file(file.filename, content)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=reason)

    file_hash = DocumentExtractionService.compute_sha256(content)
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.STORAGE_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    # 2. Create Report record
    new_report = Report(
        owner_id=current_user.id,
        file_name=file.filename,
        storage_path=file_path,
        file_hash_sha256=file_hash,
        file_size_bytes=len(content),
        mime_type=file.content_type or "application/octet-stream",
        privacy_mode=privacy_mode if privacy_mode in [PrivacyMode.PRIVATE_HISTORY, PrivacyMode.TEMPORARY_SESSION] else PrivacyMode.PRIVATE_HISTORY,
        status=ReportStatus.EXTRACTED,
        report_date=report_date or "2026-03-01",
        lab_name=lab_name or "Metropolis Clinical Laboratories"
    )
    db.add(new_report)
    db.flush()

    # 3. Run extraction
    extracted_items = DocumentExtractionService.extract_from_pdf(file_path)
    if not extracted_items:
        # Delete unparseable or fake document
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fake or invalid laboratory document detected. No authentic clinical pathology parameters, units, or reference intervals were found in this file. Please upload an authentic medical lab report."
        )

    # 4. Save extracted parameters
    db_parameters = []
    for item in extracted_items:
        param = ReportParameter(
            report_id=new_report.id,
            test_name=item["test_name"],
            canonical_code=item.get("canonical_code"),
            raw_text=item["raw_text"],
            raw_value=item.get("raw_value"),
            numeric_value=item.get("numeric_value"),
            unit=item.get("unit"),
            reference_range_raw=item.get("reference_range_raw"),
            range_low=item.get("range_low"),
            range_high=item.get("range_high"),
            ocr_confidence=item.get("ocr_confidence", 1.0),
            page_number=item.get("page_number", 1),
            bounding_box=item.get("bounding_box"),
            verification_status=item.get("verification_status", "auto_extracted"),
            classification_status=item.get("classification_status", "Needs Verification"),
            classification_reason=item.get("classification_reason"),
            rule_engine_version=item.get("rule_engine_version", "1.0.0")
        )
        db.add(param)
        db_parameters.append(param)

    db.flush()

    # 5. Run Report Quality Radar
    radar_data = ReportQualityRadarService.evaluate(new_report, db_parameters)
    radar_rec = QualityRadarEvaluation(
        report_id=new_report.id,
        status=radar_data["status"],
        readability_score=radar_data["readability_score"],
        findings=radar_data["findings"]
    )
    db.add(radar_rec)

    # 6. Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        report_id=new_report.id,
        action="upload",
        details={"file_name": file.filename, "param_count": len(db_parameters)}
    )
    db.add(audit)
    db.commit()
    db.refresh(new_report)

    return new_report

@router.get("", response_model=List[ReportOut])
def list_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.PATIENT:
        reports = db.query(Report).filter(Report.owner_id == current_user.id).order_by(Report.created_at.desc()).all()
    elif current_user.role == UserRole.DOCTOR:
        # Fetch reports explicitly shared with this doctor
        reports = db.query(Report).join(Report.shares).filter(
            Report.shares.any(doctor_id=current_user.id, is_active=True)
        ).order_by(Report.created_at.desc()).all()
    else:
        # Admin has NO default access to patient medical report list
        reports = []

    return reports

@router.get("/{report_id}", response_model=ReportDetailOut)
def get_report_detail(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = verify_report_access(report_id, current_user, db, require_write=False)
    return report

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = verify_report_access(report_id, current_user, db, require_write=True)

    # Remove file from disk
    if os.path.exists(report.storage_path):
        try:
            os.remove(report.storage_path)
        except OSError:
            pass

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        report_id=report.id,
        action="delete",
        details={"file_name": report.file_name}
    )
    db.add(audit)
    db.delete(report)
    db.commit()
    return None
