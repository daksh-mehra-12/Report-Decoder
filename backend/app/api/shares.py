from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Report, ReportShare, UserRole, AuditLog
from app.schemas.schemas import ShareRequest, ShareOut
from app.services.auth.service import get_current_user, verify_report_access

router = APIRouter(prefix="/reports/{report_id}/shares", tags=["Doctor Sharing & Consent"])

@router.post("", response_model=ShareOut, status_code=status.HTTP_201_CREATED)
def share_report_with_doctor(
    report_id: str,
    share_req: ShareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = verify_report_access(report_id, current_user, db, require_write=True)

    doctor = db.query(User).filter(
        User.email == share_req.doctor_email,
        User.role == UserRole.DOCTOR
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No registered doctor account found with email '{share_req.doctor_email}'."
        )

    # Check if existing active share exists
    existing = db.query(ReportShare).filter(
        ReportShare.report_id == report.id,
        ReportShare.doctor_id == doctor.id,
        ReportShare.is_active == True
    ).first()

    if existing:
        return ShareOut(
            id=existing.id,
            report_id=existing.report_id,
            doctor_id=existing.doctor_id,
            doctor_email=doctor.email,
            doctor_name=doctor.full_name,
            shared_by_user_id=existing.shared_by_user_id,
            is_active=existing.is_active,
            created_at=existing.created_at,
            revoked_at=existing.revoked_at
        )

    share = ReportShare(
        report_id=report.id,
        doctor_id=doctor.id,
        shared_by_user_id=current_user.id,
        is_active=True
    )
    db.add(share)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        report_id=report.id,
        action="share_granted",
        details={"doctor_email": doctor.email}
    )
    db.add(audit)
    db.commit()
    db.refresh(share)

    return ShareOut(
        id=share.id,
        report_id=share.report_id,
        doctor_id=share.doctor_id,
        doctor_email=doctor.email,
        doctor_name=doctor.full_name,
        shared_by_user_id=share.shared_by_user_id,
        is_active=share.is_active,
        created_at=share.created_at,
        revoked_at=share.revoked_at
    )

@router.post("/revoke/{share_id}", status_code=status.HTTP_200_OK)
def revoke_share(
    report_id: str,
    share_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = verify_report_access(report_id, current_user, db, require_write=True)

    share = db.query(ReportShare).filter(
        ReportShare.id == share_id,
        ReportShare.report_id == report.id
    ).first()

    if not share:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share record not found.")

    share.is_active = False
    share.revoked_at = datetime.now(timezone.utc)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        report_id=report.id,
        action="share_revoked",
        details={"doctor_id": share.doctor_id, "share_id": share.id}
    )
    db.add(audit)
    db.commit()

    return {"message": "Doctor access successfully revoked.", "revoked_at": share.revoked_at}

@router.get("", response_model=List[ShareOut])
def list_shares(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = verify_report_access(report_id, current_user, db, require_write=True)
    shares = db.query(ReportShare).filter(ReportShare.report_id == report.id).all()

    out = []
    for s in shares:
        doc = db.query(User).filter(User.id == s.doctor_id).first()
        out.append(ShareOut(
            id=s.id,
            report_id=s.report_id,
            doctor_id=s.doctor_id,
            doctor_email=doc.email if doc else "unknown",
            doctor_name=doc.full_name if doc else "Doctor",
            shared_by_user_id=s.shared_by_user_id,
            is_active=s.is_active,
            created_at=s.created_at,
            revoked_at=s.revoked_at
        ))
    return out
