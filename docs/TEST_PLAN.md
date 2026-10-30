# LabLens — Comprehensive Test Plan

**Product:** LabLens | **Hackathon:** AAYU 2026 (T02) | **Team:** TriLogix (AAYU-MW2X)

---

## 🧪 Testing Pyramid & Strategy

```
           / \
          / E2E\        -> User journeys, upload, verify, TrustTrace, export
         /------\
        / Integr \      -> API endpoints, RBAC, DB transactions, sharing revocation
       /----------\
      /    Unit    \    -> Deterministic classification, OCR parsing, Safety filters
     /--------------\
```

---

## 🎯 Test Categories & Target Invariants

### 1. Deterministic Classification Unit Tests
- **Boundary Semantics:**
  - $Value = Low$ -> `In Range`
  - $Value = High$ -> `In Range`
  - $Value = Low - 0.0001$ -> `Below Range`
  - $Value = High + 0.0001$ -> `Above Range`
- **Missing Ranges:** Must produce `Needs Verification`, never guess default ranges.
- **Incompatible Units:** Rejects comparisons between `mg/dL` and `mmol/L` without verified conversion; returns `Unable to Classify`.
- **Qualitative Tests:** "Negative" vs "Positive", "Non-Reactive" vs "Reactive".
- **Zero AI Dependency:** Engine must execute purely through arithmetic & regex rules with zero network/LLM dependencies.

### 2. Medical Safety & Constrained AI Tests
- **Direct Diagnosis Rejection:** Prompts demanding "What disease do I have?" must be refused.
- **Disease Probability Rejection:** Outputs attempting to estimate odds (e.g., "85% likelihood of diabetes") must be discarded.
- **Medication Advice Rejection:** Any text advising "Stop taking Metformin" must trigger fail-closed replacement.
- **Hallucinated Citations:** Output claiming sources outside approved knowledge base must be rejected.
- **Fail-Closed Fallback:** Guarantees that any validation failure returns safe disclaimer.

### 3. Security & Authorization (RBAC) Tests
- **Patient Isolation:** Patient A cannot read or modify Patient B's report (404/403).
- **Doctor Access Grants:** Doctor can view report only when `is_active=True` share exists.
- **Instant Revocation:** As soon as patient calls `POST /revoke`, doctor's subsequent access to GET, download, or TrustTrace immediately returns 403 Forbidden.
- **Admin Restrictions:** Admin cannot view report contents or patient names.
- **Malicious Uploads:** Executable files, oversized files (>15MB), or invalid MIME magics are rejected.

### 4. End-to-End Synthetic Verification
- Run complete test flow on clear synthetic CBC report.
- Run complete test flow on degraded synthetic scan (blur, missing decimal, missing range).
- Verify user corrections update parameter audit history.
- Verify VisitReady summaries in English, Hindi, and Hinglish.
