# LabLens — REST API Reference & Contracts

**Product:** LabLens | **Hackathon:** AAYU 2026 (T02) | **Team:** TriLogix (AAYU-MW2X)

---

## 🌐 Base URL & Conventions
- **Base URL:** `/api/v1`
- **Interactive Documentation:** `/docs` (Swagger UI), `/redoc`
- **Response Format:** All JSON payloads follow structured envelope standards.
- **Authentication:** `Authorization: Bearer <jwt_access_token>`

---

## 📡 Core Endpoints Summary

### 1. Authentication & Users
- `POST /api/v1/auth/register` — Create patient, doctor, or admin account.
- `POST /api/v1/auth/login` — Authenticate and receive JWT tokens.
- `GET /api/v1/auth/me` — Return current authenticated profile and roles.

### 2. Reports & Ingestion
- `POST /api/v1/reports/upload` — Multipart file upload (PDF/JPG/PNG). Returns initial extraction & quality radar.
- `GET /api/v1/reports` — List accessible reports (owned or explicitly shared).
- `GET /api/v1/reports/{report_id}` — Get report metadata, parameters, and verification status.
- `DELETE /api/v1/reports/{report_id}` — Delete report and all related parameters (Patient only).

### 3. Verification Workspace
- `POST /api/v1/reports/{report_id}/parameters/{parameter_id}/verify` — Mark parameter as verified.
- `PATCH /api/v1/reports/{report_id}/parameters/{parameter_id}` — Correct test name, numeric value, unit, or range. Logs audit history.
- `POST /api/v1/reports/{report_id}/finalize-verification` — Run deterministic classification over all verified parameters.

### 4. Deterministic Classification & Explanations
- `POST /api/v1/classification/classify-single` — Independent deterministic test classifier endpoint.
- `GET /api/v1/reports/{report_id}/explanations` — Retrieve constrained plain-language educational explanations with citations.

### 5. Signature Features: TrustTrace & Report Quality Radar
- `GET /api/v1/reports/{report_id}/parameters/{parameter_id}/trust-trace` — Fetch full inspectable provenance chain for a parameter.
- `GET /api/v1/reports/{report_id}/quality-radar` — Fetch document legibility, completeness, and readiness checks.

### 6. VisitReady™ Doctor Conversation Builder
- `GET /api/v1/reports/{report_id}/visit-ready?lang={en|hi|hinglish}` — Generate personalized doctor questions and appointment summary.
- `GET /api/v1/reports/{report_id}/export-pdf` — Download clean doctor-ready summary PDF.

### 7. Cross-Lab Comparability & Trends
- `POST /api/v1/comparison/evaluate` — Evaluates if two reports can be compared for a specific test.
- `GET /api/v1/trends?test_code={code}` — Retrieves historical data points if comparability gate passes.

### 8. Doctor Sharing & Access Revocation
- `POST /api/v1/reports/{report_id}/share` — Grant access to doctor by email.
- `POST /api/v1/reports/{report_id}/revoke/{share_id}` — Instantly revoke doctor's access.
- `GET /api/v1/reports/{report_id}/shares` — View active and historical sharing permissions.

### 9. Medical Knowledge Hub
- `GET /api/v1/knowledge/tests` — Search verified medical test directory with MedlinePlus links.
- `GET /api/v1/knowledge/sources` — List approved official medical sources (MedlinePlus, ICMR, WHO, ARUP, Merck).
