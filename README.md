# LabLens

> **Tagline:** Understand your report. Prepare for a better conversation.  
> **Hackathon:** AAYU 2026 | **Problem Statement:** T02 — Report, Decoded  
> **Team:** TriLogix | **Team ID:** AAYU-MW2X

---

## 🔬 What is LabLens?

**LabLens** is an evidence-based, privacy-first healthcare laboratory report understanding platform. It is designed to bridge the comprehension gap between complex medical lab results and patients, empowering them with verified educational explanations and actionable questions for their healthcare providers.

### ⚖️ The Three Non-Negotiable Principles

1. **AI explains. Deterministic rules classify. Doctors diagnose.**
   - AI generates plain-language educational context based exclusively on approved medical knowledge bases.
   - All classifications (*In Range*, *Below Range*, *Above Range*) are computed strictly by deterministic rule algorithms against verified printed reference ranges.
   - LabLens **never diagnoses**, predicts disease probabilities, or recommends medication changes.
2. **Original laboratory data is sacred.**
   - Raw extracted text, coordinates, confidence scores, and user corrections are preserved in immutable audit logs.
   - Uncertain or missing units/ranges are never guessed.
3. **Traceable provenance and bounded uncertainty.**
   - Every single claim is backed by the **TrustTrace** evidence chain, linking to authoritative sources (MedlinePlus, ICMR, WHO, ARUP, Merck Manual).
   - Document readiness and extraction confidence are evaluated objectively by the **Report Quality Radar**.

---

## 🌟 Key Features

- **Cinematic Animated Medical Login (Reference A)**: Full-screen entry experience with a 3D DNA double helix, floating microscopic particles, subtle cyan/teal illumination, accessible credential inputs, and instant demo role access.
- **Structured Healthcare Dashboard (Reference B)**: Fixed dark navy sidebar navigation with responsive mobile drawer, overview metric cards derived strictly from real data, pending review notifications, and clean zero-state guidance.
- **Side-by-Side OCR Verification Workspace**: Inspect the original document alongside extracted tests, values, units, and ranges with confidence scores and explicit correction history.
- **Deterministic Classification Engine**: Standalone, boundary-checked engine that strictly adheres to the report's printed reference intervals.
- **Gemini-Powered LabLens Assistant**: Persistent floating assistant and dedicated full-page conversation hub with anti-diagnosis safety guards, prompt suggestions, and verified MedlinePlus citations.
- **TrustTrace™ Evidence Engine**: Click any result or explanation to inspect the entire chain: Original snippet -> OCR extraction -> Normalized value -> Deterministic rule -> Approved citation link.
- **Report Quality Radar™**: Evaluates document legibility, contrast, missing parameters, duplicate tests, and extraction completeness (Not a clinical health score).
- **VisitReady™ Doctor Conversation Builder**: Generates tailored, clinician-approved discussion prompts and an appointment-ready 1-page summary in **English, Hindi, and Hinglish**.
- **Cross-Lab Comparability Gate**: Rigorous eligibility check preventing misleading trends across different labs, units, or assay methods.
- **Three-Role Access Control & Recovery**: Granular, deny-by-default role isolation for **Patients**, **Doctors** (explicit share & revoke), and **Admins** (system ops only, zero access to report contents), complete with working password recovery.
- **Privacy & Sovereignty Center**: Dual-mode support for **Temporary Sessions** (zero persistence) and **Private History** with audit logging and full right-to-erasure deletion control.
- **Medical Resources Hub**: Direct links to primary authoritative sources (MedlinePlus, ICMR, WHO India, MOHFW).
- **Interactive 3D Experience**: Premium visual hero inspired by molecular and lab data structures using React Three Fiber.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm 9+
- Docker & Docker Compose (optional for containerized deployment)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m pytest tests/ -v
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be accessible at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run test
npm run dev
```
Web application will be accessible at: `http://localhost:5173`

---

## 📂 Repository Structure

```
lablens/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (auth, reports, ocr, classify, etc.)
│   │   ├── core/            # Config, security, database session
│   │   ├── models/          # SQLAlchemy relational models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # Deterministic classification, OCR, TrustTrace, etc.
│   │   └── main.py          # FastAPI application entrypoint
│   ├── knowledge_base/      # Versioned, source-linked medical JSON knowledge base
│   └── tests/               # Unit, integration, security, and safety test suites
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (3D Canvas, Buttons, Modal, etc.)
│   │   ├── features/        # Feature screens (Dashboard, Upload, TrustTrace, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API clients and utilities
│   │   └── types/           # Strict TypeScript contracts
├── docs/                    # Complete system specifications & safety manuals
├── docker-compose.yml       # Production/local multi-container setup
├── .env.example             # Configuration templates
├── PROJECT_STATUS.md        # Honest status tracking
└── IMPLEMENTATION_PLAN.md   # Step-by-step technical roadmap
```

---

## 🛡️ Medical Safety & Responsible AI Notice

LabLens is an educational and communication-support tool. It is not an FDA/CDSCO-cleared medical diagnostic device. It does not provide medical diagnoses, treatment plans, or emergency triage. For any health concerns or abnormal findings, users must consult a qualified healthcare professional.
