from typing import List, Dict, Any
from app.models.models import Report, ReportParameter

class QualityRadarStatus:
    READABLE = "Readable"
    NEEDS_REVIEW = "Needs Review"
    INCOMPLETE = "Incomplete"
    UNSUPPORTED = "Unsupported"

class ReportQualityRadarService:
    """
    Evaluates document readability, extraction completeness, and verification readiness.
    Explicitly DOES NOT score patient health or clinical risk.
    """

    @classmethod
    def evaluate(cls, report: Report, parameters: List[ReportParameter]) -> Dict[str, Any]:
        findings = []
        score = 1.0

        if not parameters:
            return {
                "report_id": report.id,
                "status": QualityRadarStatus.INCOMPLETE,
                "readability_score": 0.20,
                "findings": [{
                    "check": "EXTRACTION_EMPTY",
                    "severity": "critical",
                    "message": "No laboratory test parameters could be extracted from this document.",
                    "remediation": "Upload a clearer scan or high-resolution PDF with printed test tables."
                }],
                "summary_message": "Document is incomplete or unrecognized."
            }

        # 1. Missing Report Metadata (Date, Lab Name)
        if not report.report_date:
            score -= 0.10
            findings.append({
                "check": "METADATA_DATE_MISSING",
                "severity": "warning",
                "message": "Report collection or authorization date could not be automatically located.",
                "remediation": "Verify and enter the test collection date manually in report settings."
            })

        if not report.lab_name:
            score -= 0.05
            findings.append({
                "check": "METADATA_LAB_MISSING",
                "severity": "info",
                "message": "Testing facility or laboratory name was not distinctly recognized.",
                "remediation": "Optional: Note down the laboratory provider for cross-lab comparison."
            })

        # 2. Check for Missing Reference Ranges
        missing_range_count = sum(1 for p in parameters if not p.reference_range_raw)
        if missing_range_count > 0:
            score -= (missing_range_count * 0.10)
            findings.append({
                "check": "MISSING_PRINTED_RANGES",
                "severity": "warning",
                "message": f"{missing_range_count} test parameter(s) lack a printed reference range on the document.",
                "remediation": "LabLens strictly prevents guessing ranges. Inspect the original page in the verification workspace to add printed limits."
            })

        # 3. Check for Missing Units
        missing_unit_count = sum(1 for p in parameters if not p.unit)
        if missing_unit_count > 0:
            score -= (missing_unit_count * 0.05)
            findings.append({
                "check": "MISSING_MEASUREMENT_UNITS",
                "severity": "warning",
                "message": f"{missing_unit_count} parameter(s) lack explicit units of measurement.",
                "remediation": "Check the column headers on your lab sheet and confirm units before comparing."
            })

        # 4. Check for Low Confidence OCR
        low_confidence_count = sum(1 for p in parameters if float(p.ocr_confidence or 1.0) < 0.85)
        if low_confidence_count > 0:
            score -= (low_confidence_count * 0.12)
            findings.append({
                "check": "LOW_OPTICAL_CONFIDENCE",
                "severity": "critical" if low_confidence_count > 2 else "warning",
                "message": f"{low_confidence_count} field(s) have low optical recognition confidence (<85%).",
                "remediation": "Compare the highlighted snippet in the Verification Workspace against the actual paper."
            })

        # 5. Check for Duplicate Parameters
        names_seen = {}
        duplicates = []
        for p in parameters:
            name_clean = p.test_name.strip().lower()
            if name_clean in names_seen:
                duplicates.append(p.test_name)
            names_seen[name_clean] = True

        if duplicates:
            score -= 0.15
            findings.append({
                "check": "DUPLICATE_PARAMETERS_FOUND",
                "severity": "warning",
                "message": f"Multiple entries detected for parameter(s): {', '.join(set(duplicates))}.",
                "remediation": "Check if one is a repeated test or baseline vs reflex test, and delete redundant entries."
            })

        # 6. Ambiguous Decimal Point Check (e.g. integer value for typically decimal tests)
        decimal_suspicious = []
        for p in parameters:
            if p.canonical_code in ["CBC_HEMOGLOBIN", "KIDNEY_CREATININE", "THYROID_TSH"]:
                if p.numeric_value is not None and float(p.numeric_value) > 50 and "." not in str(p.raw_value or ""):
                    decimal_suspicious.append(p.test_name)

        if decimal_suspicious:
            score -= 0.20
            findings.append({
                "check": "AMBIGUOUS_DECIMAL_POINT",
                "severity": "critical",
                "message": f"Suspiciously high whole-number value detected for: {', '.join(decimal_suspicious)}. Possible missed decimal point.",
                "remediation": "Verify whether a decimal separator was skipped during scanning (e.g. 134 instead of 13.4)."
            })

        # Score clamping
        score = max(0.10, min(1.0, score))

        if score >= 0.85 and not any(f["severity"] == "critical" for f in findings):
            status = QualityRadarStatus.READABLE
            summary = "Document is clear, structured, and ready for verified classification."
        elif score >= 0.60:
            status = QualityRadarStatus.NEEDS_REVIEW
            summary = "Document is mostly legible, but specific fields require user verification before classification."
        elif score >= 0.40:
            status = QualityRadarStatus.INCOMPLETE
            summary = "Key parameters, ranges, or units are missing from the scan."
        else:
            status = QualityRadarStatus.UNSUPPORTED
            summary = "Document quality is severely degraded or format is unsupported."

        return {
            "report_id": report.id,
            "status": status,
            "readability_score": round(score, 2),
            "findings": findings,
            "summary_message": summary
        }
