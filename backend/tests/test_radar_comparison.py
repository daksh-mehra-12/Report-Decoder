import pytest
from app.models.models import Report, ReportParameter
from app.services.quality_radar.service import ReportQualityRadarService, QualityRadarStatus
from app.services.comparison.service import CrossLabComparabilityGate

def test_radar_flags_missing_range_and_low_confidence():
    report = Report(id="rep-1", file_name="scan.pdf", report_date="2026-03-01", lab_name="Lab A")
    param1 = ReportParameter(
        id="p1",
        report_id="rep-1",
        test_name="Hemoglobin",
        numeric_value=13.4,
        unit="g/dL",
        reference_range_raw=None, # Missing range!
        ocr_confidence=0.70 # Low confidence!
    )
    radar_res = ReportQualityRadarService.evaluate(report, [param1])

    assert radar_res["status"] in [QualityRadarStatus.NEEDS_REVIEW, QualityRadarStatus.INCOMPLETE]
    checks = [f["check"] for f in radar_res["findings"]]
    assert "MISSING_PRINTED_RANGES" in checks
    assert "LOW_OPTICAL_CONFIDENCE" in checks

def test_radar_flags_ambiguous_decimal_point():
    report = Report(id="rep-2", file_name="scan.pdf", report_date="2026-03-01", lab_name="Lab A")
    param = ReportParameter(
        id="p2",
        report_id="rep-2",
        test_name="Hemoglobin",
        canonical_code="CBC_HEMOGLOBIN",
        raw_value="134",
        numeric_value=134.0, # Missed decimal!
        unit="g/dL",
        reference_range_raw="12.0 - 15.5"
    )
    radar_res = ReportQualityRadarService.evaluate(report, [param])
    checks = [f["check"] for f in radar_res["findings"]]
    assert "AMBIGUOUS_DECIMAL_POINT" in checks

def test_comparability_gate_accepts_identical_units_and_ranges():
    res = CrossLabComparabilityGate.evaluate(
        test_code_a="CBC_HEMOGLOBIN",
        unit_a="g/dL",
        range_low_a=12.0,
        range_high_a=15.5,
        lab_name_a="Lab Alpha",
        test_code_b="CBC_HEMOGLOBIN",
        unit_b="g/dL",
        range_low_b=12.0,
        range_high_b=15.5,
        lab_name_b="Lab Alpha"
    )
    assert res["is_comparable"] is True
    assert res["status"] == "Comparable"
    assert res["allow_trend_chart"] is True

def test_comparability_gate_rejects_incompatible_tests():
    res = CrossLabComparabilityGate.evaluate(
        test_code_a="CBC_HEMOGLOBIN",
        unit_a="g/dL",
        range_low_a=12.0,
        range_high_a=15.5,
        lab_name_a="Lab Alpha",
        test_code_b="LIPID_TOTAL_CHOLESTEROL",
        unit_b="mg/dL",
        range_low_b=100.0,
        range_high_b=200.0,
        lab_name_b="Lab Alpha"
    )
    assert res["is_comparable"] is False
    assert res["status"] == "Incomparable"
    assert res["allow_trend_chart"] is False
