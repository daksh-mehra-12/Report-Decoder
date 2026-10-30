from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Report, ReportParameter
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services.auth.service import get_current_user, verify_report_access
from app.services.chat.service import ChatbotService

router = APIRouter(prefix="/chat", tags=["LabLens Assistant Chatbot"])

@router.post("", response_model=ChatResponse)
def chat_with_assistant(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Context-aware educational chat endpoint powered by Gemini and verified medical knowledge.
    Enforces anti-diagnosis, anti-prescription, and report ownership safety checks.
    """
    verified_context = None

    if request.context and request.context.report_id:
        report = verify_report_access(request.context.report_id, current_user, db, require_write=False)
        
        # If parameter_id is provided, fetch specific verified parameter
        if request.context.parameter_id:
            param = db.query(ReportParameter).filter(
                ReportParameter.id == request.context.parameter_id,
                ReportParameter.report_id == report.id
            ).first()
            if param:
                verified_context = {
                    "test_name": param.test_name,
                    "numeric_value": float(param.numeric_value) if param.numeric_value is not None else param.raw_value,
                    "unit": param.unit,
                    "reference_range": param.reference_range_raw,
                    "status": param.classification_status,
                    "reason": param.classification_reason
                }
        elif request.context.test_name:
            param = db.query(ReportParameter).filter(
                ReportParameter.report_id == report.id,
                ReportParameter.test_name.ilike(f"%{request.context.test_name}%")
            ).first()
            if param:
                verified_context = {
                    "test_name": param.test_name,
                    "numeric_value": float(param.numeric_value) if param.numeric_value is not None else param.raw_value,
                    "unit": param.unit,
                    "reference_range": param.reference_range_raw,
                    "status": param.classification_status,
                    "reason": param.classification_reason
                }

    history_dicts = [{"role": m.role, "content": m.content} for m in request.conversation_history]

    response_data = ChatbotService.generate_chat_response(
        user_message=request.message,
        conversation_history=history_dicts,
        verified_context=verified_context,
        language=request.language
    )

    return response_data
