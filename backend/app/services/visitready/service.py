from typing import List, Dict, Any, Optional
from app.models.models import Report, ReportParameter
from app.services.knowledge.service import MedicalKnowledgeService

DISCLAIMER = (
    "VisitReady provides educational discussion prompts to prepare for an informed conversation with your doctor. "
    "It is NOT a diagnosis, medical advice, or recommendation for any medical procedure."
)

class VisitReadyService:
    """
    Builds structured, doctor-ready appointment discussion points
    in English, Hindi, and Hinglish.
    """

    @classmethod
    def generate(
        cls,
        report: Report,
        parameters: List[ReportParameter],
        patient_context: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        key_points = []
        questions = []

        # Find out-of-range or unverified parameters
        flagged_params = [p for p in parameters if p.classification_status in ["Below Range", "Above Range"]]
        unverified_params = [p for p in parameters if p.verification_status == "needs_review" or p.classification_status == "Needs Verification"]

        # Context notes
        ctx_summary = ""
        if patient_context:
            parts = []
            if patient_context.get("age_group"):
                parts.append(f"Age group: {patient_context['age_group']}")
            if patient_context.get("fasting_status"):
                parts.append(f"Fasting: {patient_context['fasting_status']}")
            if patient_context.get("symptoms"):
                parts.append(f"Patient-reported symptoms: {', '.join(patient_context['symptoms'])}")
            if patient_context.get("medications"):
                parts.append(f"Current medications/supplements: {', '.join(patient_context['medications'])}")
            ctx_summary = " | ".join(parts)

        # 1. Flagged Parameters Questions
        for p in flagged_params:
            code = p.canonical_code or MedicalKnowledgeService.find_canonical_code(p.test_name)
            kb = MedicalKnowledgeService.get_by_code(code) if code else None

            val_str = f"{p.numeric_value} {p.unit or ''}"
            range_str = p.reference_range_raw or "Printed range"

            if language == "hi":
                point = f"{p.test_name}: {val_str} ({p.classification_status}, संदर्भ सीमा: {range_str})"
                q_text = f"डॉक्टर साहब, मेरा {p.test_name} स्तर ({val_str}) सामान्य सीमा से अलग है। क्या मेरे हालिया आहार, पानी की मात्रा या जीवनशैली का इस पर कोई असर हो सकता है?"
                rationale = f"यह सवाल {p.test_name} के मान और व्यक्तिगत संदर्भ को समझने में मदद करेगा।"
            elif language == "hinglish":
                point = f"{p.test_name}: {val_str} ({p.classification_status}, Ref Range: {range_str})"
                q_text = f"Doctor, mera {p.test_name} ({val_str}) normal range se thoda different hai. Kya meri recent routine ya diet ka is par koi impact ho sakta hai?"
                rationale = f"{p.test_name} ke variations aur next steps par clarity lene ke liye."
            else:
                point = f"{p.test_name}: {val_str} ({p.classification_status}, Reference: {range_str})"
                q_text = f"My {p.test_name} is {val_str}, which is categorized as {p.classification_status}. Could recent lifestyle, hydration, or stress have influenced this result?"
                rationale = f"Clarifies physiological context behind the {p.test_name} reading without self-diagnosing."

            key_points.append(point)
            questions.append({
                "category": "Parameter Review",
                "question_text": q_text,
                "rationale": rationale,
                "context_trigger": f"{p.test_name} ({p.classification_status})"
            })

            # Add one knowledge-bank question if available
            if kb and kb.get("doctor_questions_bank"):
                questions.append({
                    "category": "Follow-Up & Clinical Evaluation",
                    "question_text": kb["doctor_questions_bank"][0],
                    "rationale": f"Approved clinical question from {kb.get('sources', [{}])[0].get('name', 'MedlinePlus')}.",
                    "context_trigger": p.test_name
                })

        # 2. General Follow-Up Questions
        if not flagged_params:
            if language == "hi":
                key_points.append("इस रिपोर्ट के सभी जाँचे गए पैरामीटर मुद्रित संदर्भ सीमा के भीतर पाए गए।")
                questions.append({
                    "category": "General Health",
                    "question_text": "मेरी रिपोर्ट सामान्य सीमा में दिख रही है, लेकिन मेरे समग्र लक्षणों के अनुसार क्या कोई अन्य जाँच या जीवनशैली सुझाव है?",
                    "rationale": "सामान्य सीमा भी संपूर्ण स्वास्थ्य की गारंटी नहीं देती, इसलिए डॉक्टर से पुष्टि आवश्यक है।",
                    "context_trigger": "All Parameters In Range"
                })
            elif language == "hinglish":
                key_points.append("Report ke sabhi verified parameters normal range mein hain.")
                questions.append({
                    "category": "General Health",
                    "question_text": "Results normal range mein hain, par meri current physical health aur symptoms ke according kya koi precaution leni chahiye?",
                    "rationale": "Holistic checkup confirmation.",
                    "context_trigger": "All Parameters In Range"
                })
            else:
                key_points.append("All verified laboratory parameters fall within their printed reference intervals.")
                questions.append({
                    "category": "Holistic Review",
                    "question_text": "While my results are in-range, do they align with my reported energy levels, lifestyle, and preventive goals?",
                    "rationale": "Ensures laboratory data is interpreted within the patient's lived experience.",
                    "context_trigger": "All Parameters In Range"
                })

        # 3. Unverified Questions if any
        if unverified_params:
            warn = f"{len(unverified_params)} parameter(s) had unverified or missing reference intervals."
            key_points.append(warn)

        return {
            "report_id": report.id,
            "language": language,
            "patient_context_summary": ctx_summary or "No patient-reported context specified.",
            "key_discussion_points": key_points,
            "suggested_questions": questions[:6], # Keep concise for 1-page appointment
            "clinical_disclaimer": DISCLAIMER
        }
