from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ----------------- User & Auth -----------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    role: str = "patient" # 'patient', 'doctor', 'admin'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: Optional[str] = None
    new_password: str = Field(min_length=6)

# ----------------- Parameter Corrections & Verification -----------------
class ParameterCorrectionCreate(BaseModel):
    field_name: str # 'test_name', 'numeric_value', 'unit', 'range_low', 'range_high'
    new_value: str
    reason: Optional[str] = "User manual correction"

class ParameterCorrectionOut(BaseModel):
    id: str
    field_name: str
    old_value: Optional[str]
    new_value: Optional[str]
    reason: Optional[str]
    corrected_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ParameterUpdate(BaseModel):
    test_name: Optional[str] = None
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    range_low: Optional[float] = None
    range_high: Optional[float] = None
    reference_range_raw: Optional[str] = None
    reason: Optional[str] = "User manual edit"

class ParameterVerifyRequest(BaseModel):
    verified: bool = True

class ParameterOut(BaseModel):
    id: str
    report_id: str
    test_name: str
    canonical_code: Optional[str]
    raw_text: str
    raw_value: Optional[str]
    numeric_value: Optional[float]
    unit: Optional[str]
    reference_range_raw: Optional[str]
    range_low: Optional[float]
    range_high: Optional[float]
    ocr_confidence: float
    page_number: int
    bounding_box: Optional[Dict[str, Any]]
    verification_status: str
    classification_status: str
    classification_reason: Optional[str]
    rule_engine_version: str
    corrections: List[ParameterCorrectionOut] = []

    model_config = ConfigDict(from_attributes=True)

# ----------------- Classification Engine -----------------
class ClassificationRequest(BaseModel):
    test_name: str
    numeric_value: Optional[float] = None
    raw_value: Optional[str] = None
    unit: Optional[str] = None
    range_low: Optional[float] = None
    range_high: Optional[float] = None
    reference_range_raw: Optional[str] = None

class ClassificationResult(BaseModel):
    status: str # 'In Range', 'Below Range', 'Above Range', 'Needs Verification', 'Unable to Classify'
    reason: str
    rule_version: str = "1.0.0"
    is_boundary_exact: bool = False
    details: Dict[str, Any] = {}

# ----------------- Report Quality Radar -----------------
class RadarCheckFinding(BaseModel):
    check: str
    severity: str # 'info', 'warning', 'critical'
    message: str
    remediation: str

class QualityRadarResponse(BaseModel):
    report_id: str
    status: str # 'Readable', 'Needs Review', 'Incomplete', 'Unsupported'
    readability_score: float
    findings: List[RadarCheckFinding]
    summary_message: Optional[str] = "Readability evaluation completed."

    model_config = ConfigDict(from_attributes=True)

# ----------------- TrustTrace -----------------
class TrustTraceNode(BaseModel):
    step: str
    title: str
    description: str
    data: Dict[str, Any]
    verified: bool

class TrustTraceResponse(BaseModel):
    parameter_id: str
    test_name: str
    provenance_chain: List[TrustTraceNode]
    official_sources: List[Dict[str, Any]]
    remaining_uncertainty: Optional[str] = None

# ----------------- VisitReady -----------------
class VisitReadyQuestion(BaseModel):
    category: str
    question_text: str
    rationale: str
    context_trigger: str

class VisitReadyResponse(BaseModel):
    report_id: str
    language: str # 'en', 'hi', 'hinglish'
    patient_context_summary: Optional[str]
    key_discussion_points: List[str]
    suggested_questions: List[VisitReadyQuestion]
    clinical_disclaimer: str

# ----------------- Reports -----------------
class ReportCreate(BaseModel):
    privacy_mode: str = "private_history"
    lab_name: Optional[str] = None

class ReportOut(BaseModel):
    id: str
    owner_id: str
    file_name: str
    file_size_bytes: int
    mime_type: str
    privacy_mode: str
    status: str
    report_date: Optional[str]
    lab_name: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ReportDetailOut(ReportOut):
    parameters: List[ParameterOut] = []
    radar: Optional[QualityRadarResponse] = None

# ----------------- Cross-Lab Comparability Gate -----------------
class ComparabilityCheckRequest(BaseModel):
    test_code_a: str
    unit_a: str
    range_low_a: Optional[float] = None
    range_high_a: Optional[float] = None
    lab_name_a: Optional[str] = None
    
    test_code_b: str
    unit_b: str
    range_low_b: Optional[float] = None
    range_high_b: Optional[float] = None
    lab_name_b: Optional[str] = None

class ComparabilityResult(BaseModel):
    is_comparable: bool
    status: str # 'Comparable', 'Comparable with Caveats', 'Incomparable'
    reasons: List[str]
    allow_trend_chart: bool

# ----------------- Report Sharing -----------------
class ShareRequest(BaseModel):
    doctor_email: EmailStr

class ShareOut(BaseModel):
    id: str
    report_id: str
    doctor_id: str
    doctor_email: str
    doctor_name: str
    shared_by_user_id: str
    is_active: bool
    created_at: datetime
    revoked_at: Optional[datetime]

# ----------------- Knowledge Base -----------------
class MedicalSourceOut(BaseModel):
    source_id: str
    name: str
    organization: str
    url: str
    trust_tier: str
    description: str

class KnowledgeEntryOut(BaseModel):
    canonical_code: str
    test_name: str
    definition: str
    test_purpose: str
    what_it_measures: str
    clinical_significance_high: str
    clinical_significance_low: str
    dietary_lifestyle_factors: str
    doctor_questions_bank: List[str]
    sources: List[MedicalSourceOut]
    review_status: str
    last_reviewed: str

# ----------------- Gemini-Powered Chatbot -----------------
class ChatMessage(BaseModel):
    role: str # 'user', 'assistant', 'system'
    content: str

class ChatContext(BaseModel):
    report_id: Optional[str] = None
    parameter_id: Optional[str] = None
    test_name: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []
    context: Optional[ChatContext] = None
    language: str = "en" # 'en', 'hi', 'hinglish'

class ChatResponse(BaseModel):
    reply: str
    suggested_followups: List[str] = []
    sources: List[MedicalSourceOut] = []
    disclaimer: str = "LabLens Assistant provides educational report understanding. AI explains, deterministic rules classify, doctors diagnose. It does not provide medical diagnoses or treatment plans."

