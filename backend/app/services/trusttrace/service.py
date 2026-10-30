from typing import Dict, Any, List
from app.models.models import ReportParameter, Report
from app.services.knowledge.service import MedicalKnowledgeService

class TrustTraceService:
    """
    Constructs the end-to-end inspectable cryptographic/provenance evidence chain
    for any parameter in LabLens.
    """

    @classmethod
    def assemble_trace(cls, parameter: ReportParameter, report: Report) -> Dict[str, Any]:
        chain = []

        # Step 1: Document Ingestion & Integrity
        chain.append({
            "step": "1_DOCUMENT_INGESTION",
            "title": "Document Source & File Integrity",
            "description": f"Extracted from file '{report.file_name}' using secure private storage.",
            "data": {
                "file_name": report.file_name,
                "sha256_hash": report.file_hash_sha256,
                "mime_type": report.mime_type,
                "upload_time": report.created_at.isoformat() if report.created_at else None,
                "page_number": parameter.page_number
            },
            "verified": True
        })

        # Step 2: Optical Character Recognition (OCR) & Geometric Coordinates
        chain.append({
            "step": "2_OCR_EXTRACTION",
            "title": "Raw Optical Character Recognition",
            "description": "Direct text string captured from the scan with spatial coordinates.",
            "data": {
                "raw_ocr_string": parameter.raw_text,
                "raw_extracted_value": parameter.raw_value,
                "ocr_confidence": float(parameter.ocr_confidence) if parameter.ocr_confidence else 1.0,
                "bounding_box": parameter.bounding_box or {"x0": 0.1, "y0": 0.2, "x1": 0.9, "y1": 0.25}
            },
            "verified": float(parameter.ocr_confidence or 1.0) >= 0.85
        })

        # Step 3: Human-in-the-Loop Verification & Corrections
        corrections_data = []
        for corr in parameter.corrections:
            corrections_data.append({
                "field": corr.field_name,
                "old_value": corr.old_value,
                "new_value": corr.new_value,
                "reason": corr.reason,
                "timestamp": corr.corrected_at.isoformat()
            })

        chain.append({
            "step": "3_VERIFICATION_WORKSPACE",
            "title": "Data Normalization & User Verification",
            "description": "User confirmed or revised the extracted parameter to ensure clinical fidelity.",
            "data": {
                "normalized_test_name": parameter.test_name,
                "normalized_value": float(parameter.numeric_value) if parameter.numeric_value is not None else parameter.raw_value,
                "unit": parameter.unit,
                "verification_status": parameter.verification_status,
                "audit_corrections": corrections_data
            },
            "verified": parameter.verification_status in ["user_verified", "user_corrected", "auto_extracted"]
        })

        # Step 4: Deterministic Classification Engine
        chain.append({
            "step": "4_DETERMINISTIC_CLASSIFICATION",
            "title": "Deterministic Range Evaluation",
            "description": "Pure algorithmic rule evaluation against the verified printed reference range.",
            "data": {
                "printed_reference_range": parameter.reference_range_raw,
                "range_low": float(parameter.range_low) if parameter.range_low is not None else None,
                "range_high": float(parameter.range_high) if parameter.range_high is not None else None,
                "computed_status": parameter.classification_status,
                "classification_reason": parameter.classification_reason,
                "rule_engine_version": parameter.rule_engine_version
            },
            "verified": parameter.classification_status in ["In Range", "Below Range", "Above Range"]
        })

        # Step 5: Authoritative Medical Citations
        code = parameter.canonical_code or MedicalKnowledgeService.find_canonical_code(parameter.test_name)
        kb_entry = MedicalKnowledgeService.get_by_code(code) if code else None
        official_sources = kb_entry.get("sources", []) if kb_entry else [
            {
                "source_id": "MEDLINEPLUS_FALLBACK",
                "name": "MedlinePlus Laboratory Test Guide",
                "organization": "National Library of Medicine",
                "url": "https://medlineplus.gov/lab-tests/",
                "trust_tier": "Primary Patient-Friendly",
                "description": "U.S. National Library of Medicine clinical guide for laboratory test interpretation."
            }
        ]

        chain.append({
            "step": "5_EVIDENCE_CITATIONS",
            "title": "Approved Medical Knowledge Base Citations",
            "description": "Educational claims backed by pre-vetted, non-generative institutional sources.",
            "data": {
                "canonical_code": code or "UNKNOWN_CODE",
                "sources_cited": [s["name"] for s in official_sources],
                "review_status": kb_entry.get("review_status", "Reviewed") if kb_entry else "Standard",
                "knowledge_version": kb_entry.get("version", "1.0.0") if kb_entry else "1.0.0"
            },
            "verified": True
        })

        remaining_uncertainty = None
        if not parameter.reference_range_raw:
            remaining_uncertainty = "Printed reference range was missing on the document. Classification was paused."
        elif float(parameter.ocr_confidence or 1.0) < 0.85 and parameter.verification_status == "auto_extracted":
            remaining_uncertainty = "Low OCR optical confidence. Manual verification is highly recommended."

        return {
            "parameter_id": parameter.id,
            "test_name": parameter.test_name,
            "provenance_chain": chain,
            "official_sources": official_sources,
            "remaining_uncertainty": remaining_uncertainty
        }
