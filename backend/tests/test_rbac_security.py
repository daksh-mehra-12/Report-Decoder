import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, Base, engine
from app.models.models import User, Report, ReportParameter, ReportShare, UserRole
from app.core.security import get_password_hash, create_access_token

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Clean up test users and reports
    db.query(ReportShare).delete()
    db.query(ReportParameter).delete()
    db.query(Report).delete()
    db.query(User).filter(User.email.like("test_%@example.com")).delete()
    db.commit()
    db.close()

def test_rbac_patient_isolation():
    db = SessionLocal()
    # Create Patient A and Patient B
    p_a = User(id="user-a", email="test_pa@example.com", hashed_password=get_password_hash("pass"), full_name="Patient A", role=UserRole.PATIENT)
    p_b = User(id="user-b", email="test_pb@example.com", hashed_password=get_password_hash("pass"), full_name="Patient B", role=UserRole.PATIENT)
    db.add_all([p_a, p_b])

    # Report owned by Patient A
    rep_a = Report(
        id="rep-a",
        owner_id=p_a.id,
        file_name="report_a.pdf",
        storage_path="/tmp/fake",
        file_hash_sha256="hash1",
        file_size_bytes=100,
        mime_type="application/pdf"
    )
    db.add(rep_a)
    db.commit()
    
    user_b_id = p_b.id
    rep_a_id = rep_a.id
    db.close()

    # Patient B tries to access Patient A's report
    token_b = create_access_token(subject=user_b_id)
    headers_b = {"Authorization": f"Bearer {token_b}"}

    res = client.get(f"/api/v1/reports/{rep_a_id}", headers=headers_b)
    # Must be 403 Forbidden!
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]

def test_rbac_doctor_sharing_and_revocation():
    db = SessionLocal()
    patient = User(id="user-p", email="test_patient@example.com", hashed_password=get_password_hash("pass"), full_name="Patient", role=UserRole.PATIENT)
    doctor = User(id="user-d", email="test_doctor@example.com", hashed_password=get_password_hash("pass"), full_name="Doctor", role=UserRole.DOCTOR)
    db.add_all([patient, doctor])

    report = Report(
        id="rep-shared",
        owner_id=patient.id,
        file_name="report_shared.pdf",
        storage_path="/tmp/fake",
        file_hash_sha256="hash2",
        file_size_bytes=200,
        mime_type="application/pdf"
    )
    db.add(report)

    # Share report with doctor
    share = ReportShare(
        id="share-1",
        report_id=report.id,
        doctor_id=doctor.id,
        shared_by_user_id=patient.id,
        is_active=True
    )
    db.add(share)
    db.commit()

    doc_id = doctor.id
    pat_id = patient.id
    rep_id = report.id
    sh_id = share.id
    db.close()

    token_doc = create_access_token(subject=doc_id)
    headers_doc = {"Authorization": f"Bearer {token_doc}"}

    # Doctor reads report -> Allowed
    res = client.get(f"/api/v1/reports/{rep_id}", headers=headers_doc)
    assert res.status_code == 200

    # Patient revokes sharing
    token_patient = create_access_token(subject=pat_id)
    headers_patient = {"Authorization": f"Bearer {token_patient}"}
    res_revoke = client.post(f"/api/v1/reports/{rep_id}/shares/revoke/{sh_id}", headers=headers_patient)
    assert res_revoke.status_code == 200

    # Doctor attempts to read report AFTER revocation -> Immediately Denied 403 Forbidden!
    res_after = client.get(f"/api/v1/reports/{rep_id}", headers=headers_doc)
    assert res_after.status_code == 403
    assert "Access denied" in res_after.json()["detail"]

def test_rbac_admin_restricted_from_patient_reports():
    db = SessionLocal()
    patient = User(id="user-pt", email="test_patient_admin@example.com", hashed_password=get_password_hash("pass"), full_name="Patient", role=UserRole.PATIENT)
    admin = User(id="user-adm", email="test_admin_user@example.com", hashed_password=get_password_hash("pass"), full_name="Admin", role=UserRole.ADMIN)
    db.add_all([patient, admin])

    report = Report(
        id="rep-secret",
        owner_id=patient.id,
        file_name="confidential.pdf",
        storage_path="/tmp/fake",
        file_hash_sha256="hash3",
        file_size_bytes=300,
        mime_type="application/pdf"
    )
    db.add(report)
    db.commit()

    adm_id = admin.id
    rep_id = report.id
    db.close()

    token_admin = create_access_token(subject=adm_id)
    headers_admin = {"Authorization": f"Bearer {token_admin}"}

    # Admin attempts to read patient report -> Denied!
    res = client.get(f"/api/v1/reports/{rep_id}", headers=headers_admin)
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]

def test_auth_password_recovery_flow():
    db = SessionLocal()
    user = User(
        id="user-recov",
        email="test_recovery@example.com",
        hashed_password=get_password_hash("original_pass"),
        full_name="Recovery User",
        role=UserRole.PATIENT
    )
    db.add(user)
    db.commit()
    db.close()

    # Step 1: Request forgot-password
    res = client.post("/api/v1/auth/forgot-password", json={"email": "test_recovery@example.com"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "recovery_token" in data
    token = data["recovery_token"]

    # Step 2: Reset password
    res_reset = client.post("/api/v1/auth/reset-password", json={
        "email": "test_recovery@example.com",
        "token": token,
        "new_password": "new_secure_password"
    })
    assert res_reset.status_code == 200
    assert res_reset.json()["success"] is True

    # Step 3: Login with new password
    res_login = client.post("/api/v1/auth/login-json", json={
        "email": "test_recovery@example.com",
        "password": "new_secure_password"
    })
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

