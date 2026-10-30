# LabLens — Security Architecture & RBAC Specifications

**Product:** LabLens | **Hackathon:** AAYU 2026 (T02) | **Team:** TriLogix (AAYU-MW2X)

---

## 🔒 Security Principles

1. **Deny-by-Default Authorization**: Every endpoint requires explicit authentication and resource authorization checks unless explicitly decorated as public (e.g., login, health).
2. **Strict Three-Role Access Control**:
   - **Patient**: Sole owner of their private reports. Can view, verify, export, and grant temporary sharing to doctors. Can revoke sharing at any moment.
   - **Doctor**: Can only access reports explicitly shared with their authenticated identity by a patient. Once revoked by the patient, access is terminated immediately across all endpoints, downloads, and cached representations.
   - **Admin**: System operators. Admins have access to system health, aggregated metrics, audit logs, and knowledge base curation. **Admins have zero default access to view patient medical reports or OCR content.**
3. **Defense-in-Depth against BOLA / IDOR**:
   - No report, parameter, or export can be accessed purely by ID. Every query strictly filters:
     `SELECT * FROM reports WHERE id = :report_id AND (owner_id = :current_user_id OR id IN (SELECT report_id FROM report_shares WHERE doctor_id = :current_user_id AND is_active = TRUE))`
4. **Data Isolation & Sanitization**:
   - Uploaded files are renamed using secure UUIDs.
   - File storage is outside the public web root.
   - MIME checking uses magic byte sniffing, preventing file injection.
   - File paths are sanitized to prevent directory traversal (`../`).
5. **Audit Trail**:
   - Every read, update, share, revocation, and export event is logged with actor ID, timestamp, IP hash, and event type.
6. **Privacy Modes**:
   - **Temporary Session**: Files and database entries exist only in ephemeral storage and are securely erased upon session termination or after 1 hour.
   - **Private History**: Encrypted database records with user consent and self-service complete deletion.

---

## 🛡️ Role-Based Access Control Matrix

| Action / Resource | Patient (Owner) | Patient (Non-Owner) | Doctor (Shared) | Doctor (Unshared) | Admin |
|---|---|---|---|---|---|
| Upload Report | ✅ Allow | ✅ Allow (own) | ❌ Deny | ❌ Deny | ❌ Deny |
| View Report & OCR | ✅ Allow | ❌ Deny (404/403) | ✅ Allow | ❌ Deny (404/403) | ❌ Deny |
| Edit/Verify Fields | ✅ Allow | ❌ Deny | ❌ Deny (Read-only) | ❌ Deny | ❌ Deny |
| View TrustTrace Evidence | ✅ Allow | ❌ Deny | ✅ Allow | ❌ Deny | ❌ Deny |
| Generate VisitReady PDF | ✅ Allow | ❌ Deny | ✅ Allow | ❌ Deny | ❌ Deny |
| Share Report with Doctor | ✅ Allow | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny |
| Revoke Doctor Sharing | ✅ Allow | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny |
| Delete Report | ✅ Allow | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny |
| View System Health & Logs | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow |
| Curate Medical Knowledge Base | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow |

---

## 🔑 Authentication & Session Tokens

- LabLens uses JWT access tokens with HMAC-SHA256 signatures and tight expiration periods (15 minutes access, 7 days refresh).
- Passwords are salted and hashed with `bcrypt` (work factor 12).
- Security headers enforced on every response:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy: default-src 'self' ...`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
