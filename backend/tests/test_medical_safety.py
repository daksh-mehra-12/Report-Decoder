import pytest
from app.services.explanations.service import ExplanationEngine, SAFE_FAIL_CLOSED_FALLBACK

def test_safety_validator_blocks_direct_diagnosis():
    text_with_diag = "Based on this result, you have anemia and stage 2 renal failure."
    is_safe, reason = ExplanationEngine.validate_safety(text_with_diag, ["MEDLINEPLUS_HEMOGLOBIN"])
    assert is_safe is False
    assert "prohibited clinical assertion" in reason

def test_safety_validator_blocks_prescription_advice():
    text_with_rx = "You should start taking 500mg iron supplements daily."
    is_safe, reason = ExplanationEngine.validate_safety(text_with_rx, ["MEDLINEPLUS_HEMOGLOBIN"])
    assert is_safe is False
    assert "prohibited clinical assertion" in reason

def test_safety_validator_blocks_disease_probabilities():
    text_with_prob = "There is an 80% chance of diabetes based on this glucose reading."
    is_safe, reason = ExplanationEngine.validate_safety(text_with_prob, ["MEDLINEPLUS_GLUCOSE"])
    assert is_safe is False
    assert "prohibited clinical assertion" in reason

def test_safety_validator_rejects_unapproved_source_ids():
    safe_text = "Hemoglobin carries oxygen in red blood cells."
    fake_source_ids = ["RANDOM_BLOG_SOURCE_123"]
    is_safe, reason = ExplanationEngine.validate_safety(safe_text, fake_source_ids)
    assert is_safe is False
    assert "unverified medical source" in reason

def test_explanation_engine_fail_closed_mechanism():
    # If a safety check fails, it must fall back to SAFE_FAIL_CLOSED_FALLBACK
    res = ExplanationEngine.generate_explanation(
        test_name="Hemoglobin",
        result_status="Below Range",
        canonical_code="CBC_HEMOGLOBIN",
        language="en"
    )
    # Standard explanation should succeed with MedlinePlus source
    assert res["safe_fallback_used"] is False
    assert "MEDLINEPLUS_HEMOGLOBIN" in res["source_ids"]
    assert "anemia" not in res["general_context"][0] or "not an automatic diagnosis" in res["general_context"][1]

def test_multilingual_explanation_generation():
    # Test Hindi
    res_hi = ExplanationEngine.generate_explanation(
        test_name="Hemoglobin",
        result_status="In Range",
        canonical_code="CBC_HEMOGLOBIN",
        language="hi"
    )
    assert res_hi["language"] == "hi"
    assert "सामान्य संदर्भ सीमा" in res_hi["general_context"][0]

    # Test Hinglish
    res_hinglish = ExplanationEngine.generate_explanation(
        test_name="Hemoglobin",
        result_status="In Range",
        canonical_code="CBC_HEMOGLOBIN",
        language="hinglish"
    )
    assert res_hinglish["language"] == "hinglish"
    assert "normal range" in res_hinglish["general_context"][0]
