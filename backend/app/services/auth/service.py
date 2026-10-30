from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.models import User, UserRole, Report, ReportShare

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def require_role(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role '{current_user.role}'."
            )
        return current_user
    return role_checker

def verify_report_access(report_id: str, current_user: User, db: Session, require_write: bool = False) -> Report:
    """
    Enforces strict BOLA/IDOR protection and explicit sharing authorization.
    - Patient owner: Read and Write access.
    - Doctor: Read-only access IF explicitly shared and is_active is True.
    - Admin: Denied content access by default.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    # 1. Owner check
    if report.owner_id == current_user.id:
        return report

    # If write access is required (e.g. edit fields, verify, delete, share), only owner can proceed
    if require_write:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the patient report owner can perform this modification."
        )

    # 2. Doctor explicit active share check
    if current_user.role == UserRole.DOCTOR:
        share = db.query(ReportShare).filter(
            ReportShare.report_id == report_id,
            ReportShare.doctor_id == current_user.id,
            ReportShare.is_active == True
        ).first()

        if share:
            return report

    # 3. Deny by default (including Admin)
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied. You do not have permission to view or manage this laboratory report."
    )
