from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.db.database import get_db
from app.models.models import Alert, AlertStatus, RiskLevel, User
from app.schemas.schemas import AlertOut, AlertUpdate, PaginatedResponse
from app.core.security import get_current_user, require_analyst_or_above
from app.services.audit import log_action
from datetime import datetime

router = APIRouter()

@router.get("", response_model=PaginatedResponse)
def list_alerts(
    page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
    severity: Optional[str] = None, status: Optional[str] = None,
    alert_type: Optional[str] = None, domain_id: Optional[int] = None,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = db.query(Alert).options(joinedload(Alert.asset), joinedload(Alert.domain))
    if severity:
        query = query.filter(Alert.severity == severity)
    if status:
        query = query.filter(Alert.status == status)
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    if domain_id:
        query = query.filter(Alert.domain_id == domain_id)
    total = query.count()
    items = query.order_by(Alert.severity.desc(), Alert.created_at.desc()).offset((page-1)*size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": [AlertOut.model_validate(a) for a in items]}

@router.get("/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    a = db.query(Alert).options(joinedload(Alert.asset), joinedload(Alert.domain)).filter(Alert.id == alert_id).first()
    if not a:
        raise HTTPException(404, "Alert not found")
    return AlertOut.model_validate(a)

@router.patch("/{alert_id}", response_model=AlertOut)
def update_alert(alert_id: int, data: AlertUpdate, request: Request,
                 db: Session = Depends(get_db), current_user: User = Depends(require_analyst_or_above)):
    a = db.query(Alert).filter(Alert.id == alert_id).first()
    if not a:
        raise HTTPException(404, "Alert not found")
    if data.status:
        a.status = data.status
        if data.status == AlertStatus.acknowledged and not a.acknowledged_at:
            a.acknowledged_at = datetime.utcnow()
        elif data.status == AlertStatus.resolved and not a.resolved_at:
            a.resolved_at = datetime.utcnow()
    if data.assigned_to is not None:
        a.assigned_to = data.assigned_to
    db.commit()
    db.refresh(a)
    log_action(db, current_user.id, "update", "alert", alert_id, data.model_dump(exclude_none=True), request)
    return AlertOut.model_validate(a)
