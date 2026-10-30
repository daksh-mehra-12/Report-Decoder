# LabLens — Deployment & Operations Guide

**Product:** LabLens | **Hackathon:** AAYU 2026 (T02) | **Team:** TriLogix (AAYU-MW2X)

---

## 🐳 Containerized Deployment (Docker Compose)

LabLens is designed to run seamlessly via Docker Compose in both development and production environments.

### Services Topology
1. **`lablens-backend`**: FastAPI application running on Uvicorn.
2. **`lablens-frontend`**: Vite React application served via high-performance Nginx.
3. **`lablens-db`**: PostgreSQL 16 with secure volume mounts and health checks.
4. **`lablens-storage`**: Isolated internal volume for encrypted report storage.

---

## ⚙️ Environment Configuration

Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Key configuration variables:
```ini
# Environment & Server
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=generate_a_cryptographically_secure_random_key_here
API_V1_STR=/api/v1

# Database Configuration
DATABASE_URL=postgresql://lablens_user:secure_password@lablens-db:5432/lablens_db
# Local SQLite fallback for instant zero-dependency execution:
# DATABASE_URL=sqlite:///./lablens.db

# Storage
STORAGE_DIR=/var/lablens/uploads
MAX_UPLOAD_SIZE_BYTES=15728640

# LLM / AI Configuration (Optional, fallback templates used if empty)
OPENAI_API_KEY=
LLM_MODEL=gpt-4o-mini
```

---

## 🏃 Local Execution Without Docker

### Backend:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`.
