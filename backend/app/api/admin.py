from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import User, Report, AuditLog, UserRole
from app.services.auth.service import require_role
from app.services.classification.engine import RULE_ENGINE_VERSION
from app.services.knowledge.service import MedicalKnowledgeService

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/metrics")
def get_system_metrics(
    admin_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Returns high-level system operations health. Zero patient clinical content is exposed.
    """
    patient_count = db.query(func.count(User.id)).filter(User.role == UserRole.PATIENT).scalar()
    doctor_count = db.query(func.count(User.id)).filter(User.role == UserRole.DOCTOR).scalar()
    report_count = db.query(func.count(Report.id)).scalar()

    kb_entries = MedicalKnowledgeService.get_all_entries()

    recent_logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(20).all()

    logs_data = []
    for log in recent_logs:
        logs_data.append({
            "id": log.id,
            "action": log.action,
            "user_id": log.user_id,
            "timestamp": log.timestamp.isoformat()
        })

    return {
        "status": "Healthy",
        "rule_engine_version": RULE_ENGINE_VERSION,
        "knowledge_base_entries": len(kb_entries),
        "user_statistics": {
            "patients": patient_count,
            "doctors": doctor_count
        },
        "reports_processed_aggregate": report_count,
        "recent_audit_events": logs_data
    }
