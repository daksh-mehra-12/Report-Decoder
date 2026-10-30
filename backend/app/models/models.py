import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, Numeric, Text, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class UserRole(str):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"

class PrivacyMode(str):
    PRIVATE_HISTORY = "private_history"
    TEMPORARY_SESSION = "temporary_session"

class ReportStatus(str):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    EXTRACTED = "extracted"
    VERIFIED = "verified"
    ARCHIVED = "archived"

class VerificationStatus(str):
    AUTO_EXTRACTED = "auto_extracted"
    USER_VERIFIED = "user_verified"
    USER_CORRECTED = "user_corrected"
    NEEDS_REVIEW = "needs_review"

class ClassificationStatus(str):
    IN_RANGE = "In Range"
    BELOW_RANGE = "Below Range"
    ABOVE_RANGE = "Above Range"
    NEEDS_VERIFICATION = "Needs Verification"
    UNABLE_TO_CLASSIFY = "Unable to Classify"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(32), default=UserRole.PATIENT, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    reports = relationship("Report", back_populates="owner", cascade="all, delete-orphan")
    shares_given = relationship("ReportShare", foreign_keys="ReportShare.shared_by_user_id", back_populates="sharer")
    shares_received = relationship("ReportShare", foreign_keys="ReportShare.doctor_id", back_populates="doctor")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    storage_path = Column(String(512), nullable=False)
    file_hash_sha256 = Column(String(64), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(64), nullable=False)
    privacy_mode = Column(String(32), default=PrivacyMode.PRIVATE_HISTORY, nullable=False)
    status = Column(String(32), default=ReportStatus.UPLOADED, nullable=False)
    report_date = Column(String(32), nullable=True)
    lab_name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    owner = relationship("User", back_populates="reports")
    parameters = relationship("ReportParameter", back_populates="report", cascade="all, delete-orphan")
    shares = relationship("ReportShare", back_populates="report", cascade="all, delete-orphan")
    radar = relationship("QualityRadarEvaluation", back_populates="report", uselist=False, cascade="all, delete-orphan")

class ReportParameter(Base):
    __tablename__ = "report_parameters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    report_id = Column(String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    test_name = Column(String(255), nullable=False)
    canonical_code = Column(String(64), nullable=True, index=True)
    raw_text = Column(Text, nullable=False)
    raw_value = Column(String(64), nullable=True)
    numeric_value = Column(Numeric(10, 4), nullable=True)
    unit = Column(String(64), nullable=True)
    reference_range_raw = Column(String(128), nullable=True)
    range_low = Column(Numeric(10, 4), nullable=True)
    range_high = Column(Numeric(10, 4), nullable=True)
    ocr_confidence = Column(Numeric(4, 3), default=1.000, nullable=False)
    page_number = Column(Integer, default=1, nullable=False)
    bounding_box = Column(JSON, nullable=True) # { x0, y0, x1, y1 }
    verification_status = Column(String(32), default=VerificationStatus.AUTO_EXTRACTED, nullable=False)
    classification_status = Column(String(32), default=ClassificationStatus.NEEDS_VERIFICATION, nullable=False)
    classification_reason = Column(Text, nullable=True)
    rule_engine_version = Column(String(32), default="1.0.0", nullable=False)

    report = relationship("Report", back_populates="parameters")
    corrections = relationship("ParameterCorrection", back_populates="parameter", cascade="all, delete-orphan")

class ParameterCorrection(Base):
    __tablename__ = "parameter_corrections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    parameter_id = Column(String(36), ForeignKey("report_parameters.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    field_name = Column(String(64), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    corrected_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    parameter = relationship("ReportParameter", back_populates="corrections")

class ReportShare(Base):
    __tablename__ = "report_shares"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    report_id = Column(String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    shared_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    report = relationship("Report", back_populates="shares")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="shares_received")
    sharer = relationship("User", foreign_keys=[shared_by_user_id], back_populates="shares_given")

class QualityRadarEvaluation(Base):
    __tablename__ = "quality_radar_evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    report_id = Column(String(36), ForeignKey("reports.id", ondelete="CASCADE"), unique=True, nullable=False)
    status = Column(String(32), nullable=False) # Readable, Needs Review, Incomplete, Unsupported
    readability_score = Column(Numeric(3, 2), nullable=False) # 0.00 to 1.00
    findings = Column(JSON, nullable=False) # List of findings
    evaluated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    report = relationship("Report", back_populates="radar")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    report_id = Column(String(36), ForeignKey("reports.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(64), nullable=False)
    ip_address_hash = Column(String(64), nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utc_now, nullable=False)
