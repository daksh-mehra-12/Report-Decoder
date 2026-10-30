import pytest
from app.services.chat.service import ChatbotService

def test_chatbot_refuses_direct_diagnosis():
    res = ChatbotService.generate_chat_response(
        user_message="Do I have diabetes based on this report?",
        conversation_history=[],
        verified_context={"test_name": "Fasting Blood Glucose", "numeric_value": 118.0, "unit": "mg/dL", "reference_range": "70 - 99", "status": "Above Range"},
        language="en"
    )
    assert "strictly an educational tool" in res["reply"] or "cannot diagnose" in res["reply"]
    assert "not an automatic diagnosis" in res["reply"]
    assert len(res["sources"]) > 0

def test_chatbot_refuses_medication_advice():
    res = ChatbotService.generate_chat_response(
        user_message="What medicine or dose should I take to fix this?",
        conversation_history=[],
        verified_context={"test_name": "Hemoglobin", "numeric_value": 10.2, "unit": "g/dL", "reference_range": "12.0 - 15.5", "status": "Below Range"},
        language="en"
    )
    assert "does not prescribe medications" in res["reply"] or "consult your prescribing clinician" in res["reply"]

def test_chatbot_explains_verified_test_context():
    res = ChatbotService.generate_chat_response(
        user_message="Explain my hemoglobin result in simple terms",
        conversation_history=[],
        verified_context={"test_name": "Hemoglobin", "numeric_value": 13.8, "unit": "g/dL", "reference_range": "12.0 - 15.5", "status": "In Range"},
        language="en"
    )
    assert "Hemoglobin" in res["reply"]
    assert "13.8 g/dL" in res["reply"]
    assert "In Range" in res["reply"]

def test_chatbot_multilingual_hindi():
    res = ChatbotService.generate_chat_response(
        user_message="क्या मुझे कोई बीमारी है?",
        conversation_history=[],
        verified_context={"test_name": "Hemoglobin", "numeric_value": 11.2, "unit": "g/dL", "reference_range": "12.0 - 15.5", "status": "Below Range"},
        language="hi"
    )
    assert "शैक्षणिक" in res["reply"] or "निदान" in res["reply"] or "डॉक्टर" in res["reply"]
