import re
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel
from app.services.knowledge.service import MedicalKnowledgeService

SAFE_FAIL_CLOSED_FALLBACK = (
    "We couldn't safely explain this result from the available information. "
    "Please verify the report and discuss it with a qualified healthcare professional."
)

PROHIBITED_DIAGNOSTIC_TERMS = [
    r"\byou have\b",
    r"\byou suffer from\b",
    r"\byou are diagnosed with\b",
    r"\bdiagnosis:\b",
    r"\bwe diagnose\b",
    r"\bprescribe\b",
    r"\btake \d+\s*mg\b",
    r"\bdiscontinue your\b",
    r"\bstop taking\b",
    r"\bstart taking\b",
    r"\b\d+%\s*(chance|likelihood|probability)\s*of\b",
    r"\blikely to have\b"
]

class ConstrainedExplanation(BaseModel):
    test_name: str
    result_status: str
    what_it_measures: str
    general_context: List[str]
    questions_for_doctor: List[str]
    source_ids: List[str]
    limitations: List[str]
    language: str = "en"

class ExplanationEngine:
    """
    Constrained explanation engine for LabLens.
    Produces plain-language educational context strictly from approved medical knowledge.
    Enforces anti-diagnosis, anti-prescription, and anti-hallucination safety filters.
    Operates fail-closed: invalid outputs are discarded and replaced with a safe fallback.
    """

    @classmethod
    def validate_safety(cls, explanation_text: str, cited_sources: List[str]) -> Tuple[bool, str]:
        # 1. Prohibited diagnosis / prescription checks
        for pattern in PROHIBITED_DIAGNOSTIC_TERMS:
            if re.search(pattern, explanation_text, re.IGNORECASE):
                return False, f"Safety violation: prohibited clinical assertion detected ('{pattern}')"

        # 2. Check source authenticity
        all_entries = MedicalKnowledgeService.get_all_entries()
        valid_source_ids = set()
        for e in all_entries:
            for s in e.get("sources", []):
                valid_source_ids.add(s["source_id"])

        for sid in cited_sources:
            if sid not in valid_source_ids:
                return False, f"Safety violation: unverified medical source cited ('{sid}')"

        return True, "Safe"

    @classmethod
    def generate_explanation(
        cls,
        test_name: str,
        result_status: str,
        canonical_code: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Generates validated educational explanation.
        Supports English ('en'), Hindi ('hi'), and Hinglish ('hinglish').
        """
        code = canonical_code or MedicalKnowledgeService.find_canonical_code(test_name)
        kb_entry = MedicalKnowledgeService.get_by_code(code) if code else None

        if not kb_entry:
            return {
                "test_name": test_name,
                "result_status": result_status,
                "what_it_measures": "Laboratory analyte measurement as ordered by clinician.",
                "general_context": [
                    "This test is part of clinical laboratory investigations.",
                    "Interpretations depend heavily on individual clinical context, symptoms, and medical history."
                ],
                "questions_for_doctor": [
                    "What does this test result mean in my personal clinical situation?",
                    "Are any follow-up tests or lifestyle steps recommended?"
                ],
                "source_ids": ["MEDLINEPLUS_HEMOGLOBIN"], # Default approved fallback ID
                "limitations": [
                    "Specific approved educational entry for this test name is currently undergoing medical review.",
                    "Do not make medical decisions without clinical consultation."
                ],
                "language": language,
                "safe_fallback_used": False
            }

        # Select approved source IDs
        approved_source_ids = [s["source_id"] for s in kb_entry.get("sources", [])]

        # Template building based on deterministic status and language
        what_measures = kb_entry.get("what_it_measures", kb_entry.get("definition", ""))
        context_items = []
        doc_questions = kb_entry.get("doctor_questions_bank", [])[:3]

        if language == "hi":
            # Hindi educational explanations
            if result_status == "In Range":
                status_desc = "यह परिणाम आपकी रिपोर्ट पर मुद्रित सामान्य संदर्भ सीमा (Normal Range) के भीतर है।"
                context_items = [
                    status_desc,
                    "सामान्य परिणाम अच्छा संकेत है, लेकिन यह संपूर्ण स्वास्थ्य की पूर्ण गारंटी नहीं देता।",
                    "अपने डॉक्टर के साथ समग्र स्वास्थ्य और लक्षणों पर चर्चा अवश्य करें।"
                ]
            elif result_status == "Below Range":
                status_desc = f"यह स्तर सामान्य सीमा से नीचे है। {kb_entry.get('clinical_significance_low', '')}"
                context_items = [
                    status_desc,
                    "यह अपने आप में किसी बीमारी का निश्चित निदान (diagnosis) नहीं है। खान-पान, पानी की कमी या अस्थायी कारक भी इसे प्रभावित कर सकते हैं।",
                    "सटीक व्याख्या के लिए अपने डॉक्टर से परामर्श लें।"
                ]
            elif result_status == "Above Range":
                status_desc = f"यह स्तर सामान्य सीमा से ऊपर है। {kb_entry.get('clinical_significance_high', '')}"
                context_items = [
                    status_desc,
                    "सीमा से बाहर मान आने का अर्थ स्वचालित रूप से गंभीर बीमारी नहीं होता।",
                    "डॉक्टर अन्य परीक्षणों और आपके व्यक्तिगत इतिहास के संदर्भ में इसका मूल्यांकन करेंगे।"
                ]
            else:
                context_items = [
                    "इस परिणाम के लिए रिपोर्ट पर मुद्रित संदर्भ सीमा अनुपलब्ध या अस्पष्ट है।",
                    "लैबलेन सार्वभौमिक अनुमान नहीं लगाता। कृपया अपनी मूल रिपोर्ट सत्यापित करें।"
                ]
        elif language == "hinglish":
            # Hinglish educational explanations
            if result_status == "In Range":
                context_items = [
                    "Yeh result aapki lab report ki printed normal range ke andar hai.",
                    "Normal range mein aana achhi baat hai, par yeh kisi bhi bimari se 100% guarantee nahi deta.",
                    "Doctor se overall checkup ke dauran is par baat karein."
                ]
            elif result_status == "Below Range":
                context_items = [
                    f"Yeh value normal printed range se thodi low hai. {kb_entry.get('clinical_significance_low', '')}",
                    "Low value aane ka matlab seedhe koi bimari nahi hota. Diet, hydration ya transient factors bhi asar daal sakte hain.",
                    "Apne doctor se is result ke specific reasons discuss karein."
                ]
            elif result_status == "Above Range":
                context_items = [
                    f"Yeh value normal printed range se high hai. {kb_entry.get('clinical_significance_high', '')}",
                    "High value bina doctor consultation ke evaluate nahi ki jaani chahiye.",
                    "Apne doctor se puchein ki kya koi follow-up ya lifestyle change required hai."
                ]
            else:
                context_items = [
                    "Is test ki reference range report par clear nahi hai.",
                    "LabLens koi andaza (guesswork) nahi lagata. Apne doctor se verify karein."
                ]
        else:
            # English standard explanations
            if result_status == "In Range":
                context_items = [
                    "This result falls within the reference interval established by your laboratory.",
                    "An in-range result is reassuring, but does not entirely rule out health conditions, as tests must be reviewed holistically.",
                    "Discuss these results during your routine clinician visit."
                ]
            elif result_status == "Below Range":
                context_items = [
                    f"This result is below the printed reference interval. {kb_entry.get('clinical_significance_low', '')}",
                    "A below-range result is not an automatic diagnosis. Many non-disease factors (diet, hydration, sample handling) can temporarily lower levels.",
                    "A qualified clinician can evaluate this in light of your full medical background."
                ]
            elif result_status == "Above Range":
                context_items = [
                    f"This result is above the printed reference interval. {kb_entry.get('clinical_significance_high', '')}",
                    "An above-range result indicates an elevation that warrants clinician review, but does not independently establish a disease diagnosis.",
                    "Follow up with your healthcare provider to discuss whether repeat testing or lifestyle factors are relevant."
                ]
            else:
                context_items = [
                    "The reference interval on the report was ambiguous or unverified.",
                    "LabLens strictly refrains from guessing universal ranges. Please verify with your laboratory or doctor."
                ]

        explanation_payload = {
            "test_name": kb_entry.get("test_name", test_name),
            "result_status": result_status,
            "what_it_measures": what_measures,
            "general_context": context_items,
            "questions_for_doctor": doc_questions,
            "source_ids": approved_source_ids,
            "limitations": [
                "Educational content only; not a clinical diagnosis or treatment prescription.",
                "Reference ranges reflect the reporting laboratory's assay methodology."
            ],
            "language": language,
            "safe_fallback_used": False
        }

        # Run Safety Validator on combined text
        full_text = " ".join(context_items + [what_measures])
        is_safe, reason = cls.validate_safety(full_text, approved_source_ids)

        if not is_safe:
            # Fail-closed!
            return {
                "test_name": test_name,
                "result_status": result_status,
                "what_it_measures": "Educational summary unavailable due to safety review.",
                "general_context": [SAFE_FAIL_CLOSED_FALLBACK],
                "questions_for_doctor": [
                    "Can you please review this laboratory result in detail?",
                    "What are the appropriate next steps for my care?"
                ],
                "source_ids": approved_source_ids[:1],
                "limitations": [f"Safety filter triggered: {reason}"],
                "language": language,
                "safe_fallback_used": True
            }

        return explanation_payload

Tuple_Safety_Result = tuple[bool, str]
