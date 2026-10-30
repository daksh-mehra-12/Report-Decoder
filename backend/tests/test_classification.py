import pytest
from app.services.classification.engine import DeterministicClassificationEngine, ClassificationStatus

def test_boundary_exact_lower():
    res = DeterministicClassificationEngine.classify(
        test_name="Hemoglobin",
        numeric_value=12.0,
        range_low=12.0,
        range_high=15.5
    )
    assert res["status"] == ClassificationStatus.IN_RANGE
    assert res["is_boundary_exact"] is True

def test_boundary_exact_upper():
    res = DeterministicClassificationEngine.classify(
        test_name="Hemoglobin",
        numeric_value=15.5,
        range_low=12.0,
        range_high=15.5
    )
    assert res["status"] == ClassificationStatus.IN_RANGE
    assert res["is_boundary_exact"] is True

def test_below_range_just_under_boundary():
    res = DeterministicClassificationEngine.classify(
        test_name="Hemoglobin",
        numeric_value=11.9999,
        range_low=12.0,
        range_high=15.5
    )
    assert res["status"] == ClassificationStatus.BELOW_RANGE
    assert res["is_boundary_exact"] is False

def test_above_range_just_over_boundary():
    res = DeterministicClassificationEngine.classify(
        test_name="Hemoglobin",
        numeric_value=15.5001,
        range_low=12.0,
        range_high=15.5
    )
    assert res["status"] == ClassificationStatus.ABOVE_RANGE
    assert res["is_boundary_exact"] is False

def test_missing_reference_range_needs_verification():
    """System must NEVER substitute universal ranges when range is absent on report."""
    res = DeterministicClassificationEngine.classify(
        test_name="Hemoglobin",
        numeric_value=13.5,
        range_low=None,
        range_high=None,
        reference_range_raw=None
    )
    assert res["status"] == ClassificationStatus.NEEDS_VERIFICATION
    assert "No printed reference interval" in res["reason"]

def test_missing_value_unable_to_classify():
    res = DeterministicClassificationEngine.classify(
        test_name="Platelet Count",
        numeric_value=None,
        raw_value=None,
        range_low=150.0,
        range_high=450.0
    )
    assert res["status"] == ClassificationStatus.UNABLE_TO_CLASSIFY

def test_upper_bound_only_range():
    # e.g., < 100 mg/dL
    res_in = DeterministicClassificationEngine.classify(
        test_name="Fasting Glucose",
        numeric_value=95.0,
        reference_range_raw="< 100"
    )
    assert res_in["status"] == ClassificationStatus.IN_RANGE

    res_above = DeterministicClassificationEngine.classify(
        test_name="Fasting Glucose",
        numeric_value=115.0,
        reference_range_raw="< 100"
    )
    assert res_above["status"] == ClassificationStatus.ABOVE_RANGE

def test_qualitative_results():
    res_neg = DeterministicClassificationEngine.classify(
        test_name="HBsAg",
        raw_value="Negative"
    )
    assert res_neg["status"] == ClassificationStatus.IN_RANGE

    res_pos = DeterministicClassificationEngine.classify(
        test_name="Dengue NS1",
        raw_value="Positive"
    )
    assert res_pos["status"] == ClassificationStatus.ABOVE_RANGE
