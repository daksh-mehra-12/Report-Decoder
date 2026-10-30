# LabLens — Known Limitations & Boundaries

**Product:** LabLens | **Hackathon:** AAYU 2026 (T02) | **Team:** TriLogix (AAYU-MW2X)

---

## ⚠️ Known Technical & Clinical Limitations

### 1. Document Extraction & OCR Boundaries
- **Handwritten Reports:** LabLens focuses on printed digital laboratory reports. Cursive or handwritten clinical notes have high variance and are flagged as `Needs Verification` or `Unsupported`.
- **Degraded Physical Scans:** Heavy shadows, severe skew (>30°), low resolution (<150 DPI), or torn pages will trigger a low readability score in the **Report Quality Radar** and require extensive manual verification by the user.
- **Complex Non-Standard Formats:** Non-tabular or paragraph-based laboratory text may not automatically map coordinates. In such cases, bounding boxes are marked as approximate.

### 2. Clinical Scope & Context Limitations
- **Not a Diagnostic Tool:** LabLens does not diagnose diseases, predict disease likelihoods, or prescribe therapies.
- **Non-Universal Reference Intervals:** Reference ranges vary by testing instrumentation, reagent manufacturer, and laboratory demographics. The platform strictly enforces using the report's printed range, but cannot validate whether the laboratory itself calibrated its reference intervals correctly.
- **Isolated Parameter Interpretation:** Laboratory analytes rarely function in isolation. Comprehensive diagnosis requires a clinician evaluating full patient history, physical examination, and holistic clinical context.

### 3. Cross-Lab Comparability Constraints
- **Assay Methodology Disparities:** Different laboratories using different immunochemical or chromatographic methods may produce non-interchangeable numerical results even when reporting the same analyte name.
- If method metadata is missing, the **Cross-Lab Comparability Gate** flags the comparison with a prominent caveat and may restrict direct trend line plotting.

### 4. Language & AI Translation Nuances
- While English, Hindi, and Hinglish educational summaries are supported, terminology for complex biochemical pathways may use standard scientific English transliterations in Hindi/Hinglish to prevent dangerous misinterpretations.
