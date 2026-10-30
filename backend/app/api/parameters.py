from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, ReportParameter, ParameterCorrection, AuditLog
from app.schemas.schemas import ParameterOut, ParameterUpdate, ParameterVerifyRequest
from app.services.auth.service import get_current_user, verify_report_access
from app.services.classification.engine import DeterministicClassificationEngine
from app.services.quality_radar.service import ReportQualityRadarService

router = APIRouter(prefix="/reports/{report_id}/parameters", tags=["Verification Workspace"])

@router.patch("/{parameter_id}", response_model=ParameterOut)
def update_parameter(
    report_id: str,
    parameter_id: str,
    update_data: ParameterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = verify_report_access(report_id, current_user, db, require_write=True)
    param = db.query(ReportParameter).filter(
        ReportParameter.id == parameter_id,
        ReportParameter.report_id == report.id
    ).first()

    if not param:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parameter not found.")

    # Track correction history for each modified field
    if update_data.numeric_value is not None and update_data.numeric_value != float(param.numeric_value or 0):
        corr = ParameterCorrection(
            parameter_id=param.id,
            user_id=current_user.id,
            field_name="numeric_value",
            old_value=str(param.numeric_value),
            new_value=str(update_data.numeric_value),
            reason=update_data.reason
        )
        db.add(corr)
        param.numeric_value = update_data.numeric_value
        param.raw_value = str(update_data.numeric_value)

    if update_data.unit is not None and update_data.unit != param.unit:
        corr = ParameterCorrection(
            parameter_id=param.id,
            user_id=current_user.id,
            field_name="unit",
            old_value=param.unit,
            new_value=update_data.unit,
            reason=update_data.reason
        )
        db.add(corr)
        param.unit = update_data.unit

    if update_data.reference_range_raw is not None and update_data.reference_range_raw != param.reference_range_raw:
        corr = ParameterCorrection(
            parameter_id=param.id,
            user_id=current_user.id,
            field_name="reference_range_raw",
            old_value=param.reference_range_raw,
            new_value=update_data.reference_range_raw,
            reason=update_data.reason
        )
        db.add(corr)
        param.reference_range_raw = update_data.reference_range_raw
        low_d, high_d, _ = DeterministicClassificationEngine.parse_range_string(update_data.reference_range_raw)
        param.range_low = float(low_d) if low_d is not None else None
        param.range_high = float(high_d) if high_d is not None else None

    if update_data.range_low is not None:
        param.range_low = update_data.range_low
    if update_data.range_high is not None:
        param.range_high = update_data.range_high
    if update_data.test_name is not None:
        param.test_name = update_data.test_name

    param.verification_status = "user_corrected"

    # Re-run deterministic classification
    class_res = DeterministicClassificationEngine.classify(
        test_name=param.test_name,
        numeric_value=float(param.numeric_value) if param.numeric_value is not None else None,
        raw_value=param.raw_value,
        unit=param.unit,
        range_low=float(param.range_low) if param.range_low is not None else None,
        range_high=float(param.range_high) if param.range_high is not None else None,
        reference_range_raw=param.reference_range_raw
    )
    param.classification_status = class_res["status"]
    param.classification_reason = class_res["reason"]

    # Re-evaluate radar
    all_params = db.query(ReportParameter).filter(ReportParameter.report_id == report.id).all()
    radar_data = ReportQualityRadarService.evaluate(report, all_params)
    if report.radar:
        report.radar.status = radar_data["status"]
        report.radar.readability_score = radar_data["readability_score"]
        report.radar.findings = radar_data["findings"]

    db.commit()
    db.refresh(param)
    return param

@router.post("/{parameter_id}/verify", response_model=ParameterOut)
def verify_parameter(
    report_id: str,
    parameter_id: str,
    verify_req: ParameterVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = verify_report_access(report_id, current_user, db, require_write=True)
    param = db.query(ReportParameter).filter(
        ReportParameter.id == parameter_id,
        ReportParameter.report_id == report.id
    ).first()

    if not param:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parameter not found.")

    param.verification_status = "user_verified" if verify_req.verified else "needs_review"

    # Re-run deterministic classification
    class_res = DeterministicClassificationEngine.classify(
        test_name=param.test_name,
        numeric_value=float(param.numeric_value) if param.numeric_value is not None else None,
        raw_value=param.raw_value,
        unit=param.unit,
        range_low=float(param.range_low) if param.range_low is not None else None,
        range_high=float(param.range_high) if param.range_high is not None else None,
        reference_range_raw=param.reference_range_raw
    )
    param.classification_status = class_res["status"]
    param.classification_reason = class_res["reason"]

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        report_id=report.id,
        action="verify_parameter",
        details={"parameter_id": param.id, "test_name": param.test_name}
    )
    db.add(audit)
    db.commit()
    db.refresh(param)
    return param
