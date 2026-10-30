import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.models import User, UserRole
from app.api import (
    auth, reports, parameters, classification,
    trusttrace, quality_radar, visitready,
    comparison, shares, exports, knowledge, admin, chat
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    Base.metadata.create_all(bind=engine)

    # Seed default accounts if empty
    db = SessionLocal()
    try:
        # Patient demo account
        demo_patient = db.query(User).filter(User.email == "patient@lablens.com").first()
        if not demo_patient:
            demo_patient = User(
                email="patient@lablens.com",
                hashed_password=get_password_hash("patient123"),
                full_name="Aarav Sharma",
                role=UserRole.PATIENT
            )
            db.add(demo_patient)

        # Doctor demo account
        demo_doctor = db.query(User).filter(User.email == "doctor@lablens.com").first()
        if not demo_doctor:
            demo_doctor = User(
                email="doctor@lablens.com",
                hashed_password=get_password_hash("doctor123"),
                full_name="Dr. Priya Sen, MD",
                role=UserRole.DOCTOR
            )
            db.add(demo_doctor)

        # Admin demo account
        demo_admin = db.query(User).filter(User.email == "admin@lablens.com").first()
        if not demo_admin:
            demo_admin = User(
                email="admin@lablens.com",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                role=UserRole.ADMIN
            )
            db.add(demo_admin)

        db.commit()
    finally:
        db.close()

    yield

app = FastAPI(
    title="LabLens API",
    description="Evidence-Based Laboratory Report Understanding Platform | Hackathon: AAYU 2026",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permissive for local dev & demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(reports.router, prefix=api_v1)
app.include_router(parameters.router, prefix=api_v1)
app.include_router(classification.router, prefix=api_v1)
app.include_router(trusttrace.router, prefix=api_v1)
app.include_router(quality_radar.router, prefix=api_v1)
app.include_router(visitready.router, prefix=api_v1)
app.include_router(comparison.router, prefix=api_v1)
app.include_router(shares.router, prefix=api_v1)
app.include_router(exports.router, prefix=api_v1)
app.include_router(knowledge.router, prefix=api_v1)
app.include_router(admin.router, prefix=api_v1)
app.include_router(chat.router, prefix=api_v1)

@app.get("/health", tags=["Health"])
@app.get(f"{api_v1}/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "LabLens Backend",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "principles": "AI explains. Deterministic rules classify. Doctors diagnose."
    }
