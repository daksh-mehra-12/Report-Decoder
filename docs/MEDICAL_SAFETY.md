# LabLens — Medical Safety & Responsible AI Architecture

**Product:** LabLens | **Hackathon:** AAYU 2026 (T02) | **Team:** TriLogix (AAYU-MW2X)

---

## ⚕️ Core Medical Safety Doctrine

### 1. The Triad Principle
> **"AI explains. Deterministic rules classify. Doctors diagnose."**

- **Explanation:** AI models or pre-vetted medical templates only clarify clinical definitions and test context in accessible language.
- **Classification:** Strictly algorithmic code evaluates numerical values against the report's printed reference range.
- **Diagnosis:** Exclusively the purview of licensed medical doctors in the context of physical exams, clinical history, and clinical judgment.

### 2. Clinical Truths Enforced by the System
1. **An out-of-range value is NOT a diagnosis.** Many benign or transient factors (dehydration, recent exercise, dietary changes, stress, medication side effects, assay variations) can cause out-of-range lab results.
2. **An in-range value does NOT guarantee health.** Serious illnesses can present with normal lab values, especially in early or compensated stages.
3. **Reference intervals are lab-specific.** A universal normal range does not exist for many blood analytes. LabLens mandates using the reference range printed on the patient's specific lab document.

---

## 🚫 Hard Constraints & Disallowed System Actions

| Disallowed Behavior | System Enforcement Mechanism |
|---|---|
| **Disease Diagnosis** | Rule engine and LLM prompts strictly ban generating diagnoses (e.g., "You have diabetes"). Automated safety filter blocks any diagnostic assertions. |
| **Disease Probability Scoring** | No percentages or likelihood scores (e.g., "75% chance of kidney disease") are ever displayed or computed. |
| **Medication Prescription & Alteration** | Strict prohibition on suggesting drug names, doses, or discontinuations. Any detected medication advice triggers immediate fail-closed fallback. |
| **Guessing Missing Values or Ranges** | If a reference range or unit is missing from the physical report, the system tags the parameter as `Unable to Classify` or `Needs Verification`. It never fills in assumed values. |
| **Hallucinated Medical Citations** | Every displayed reference must link to verified, pre-indexed sources (MedlinePlus, ICMR, WHO, ARUP, Merck Manual). Free-form invented URLs are blocked. |

---

## 🛡️ Fail-Closed Safety Protocol

If any anomaly occurs during explanation generation:
- LLM output contains prohibited diagnostic keywords
- LLM response contains a source ID not present in the vetted medical knowledge base
- LLM attempts to override the deterministic classification
- Parsing or network failure

The entire response is discarded and replaced with the verified **Safe Fallback**:
```json
{
  "status": "Safe Refusal",
  "explanation": "We couldn't safely explain this result from the available information. Please verify the report and discuss it with a qualified healthcare professional.",
  "action_required": "Consult your doctor"
}
```

---

## 🔬 Approved Primary Sources
1. **MedlinePlus** (U.S. National Library of Medicine) — Primary source for patient-friendly test definitions and purposes.
2. **ICMR** (Indian Council of Medical Research) — Contextual guidance relevant to Indian demographic baselines and laboratory standards.
3. **WHO** (World Health Organization) — Global public health benchmarks and AI ethics frameworks.
4. **ARUP Consult** & **Merck Manual Professional** — In-depth laboratory test methodologies and clinical nuances.
