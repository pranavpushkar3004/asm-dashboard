from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.db.database import get_db
from app.models.models import Vulnerability, RiskLevel, VulnStatus, User, Asset
from app.schemas.schemas import VulnerabilityOut, VulnerabilityCreate, VulnerabilityUpdate, PaginatedResponse
from app.core.security import get_current_user, require_analyst_or_above
from app.services.audit import log_action
from datetime import datetime

router = APIRouter()

@router.get("", response_model=PaginatedResponse)
def list_vulns(
    page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
    q: Optional[str] = None, severity: Optional[str] = None,
    status: Optional[str] = None, asset_id: Optional[int] = None,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = db.query(Vulnerability).options(joinedload(Vulnerability.asset))
    if q:
        from sqlalchemy import or_
        query = query.filter(or_(
            Vulnerability.title.ilike(f"%{q}%"),
            Vulnerability.cve_id.ilike(f"%{q}%"),
            Vulnerability.description.ilike(f"%{q}%"),
        ))
    if severity:
        query = query.filter(Vulnerability.severity == severity)
    if status:
        query = query.filter(Vulnerability.status == status)
    if asset_id:
        query = query.filter(Vulnerability.asset_id == asset_id)
    total = query.count()
    items = query.order_by(Vulnerability.cvss_score.desc().nullslast(), Vulnerability.detected_at.desc()).offset((page-1)*size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": [VulnerabilityOut.model_validate(v) for v in items]}

@router.get("/{vuln_id}", response_model=VulnerabilityOut)
def get_vuln(vuln_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    v = db.query(Vulnerability).options(joinedload(Vulnerability.asset)).filter(Vulnerability.id == vuln_id).first()
    if not v:
        raise HTTPException(404, "Vulnerability not found")
    return VulnerabilityOut.model_validate(v)

@router.post("", response_model=VulnerabilityOut, status_code=201)
def create_vuln(data: VulnerabilityCreate, request: Request, db: Session = Depends(get_db),
                current_user: User = Depends(require_analyst_or_above)):
    v = Vulnerability(**data.model_dump())
    db.add(v)
    db.commit()
    db.refresh(v)
    log_action(db, current_user.id, "create", "vulnerability", v.id, {"title": v.title, "severity": v.severity.value}, request)
    return VulnerabilityOut.model_validate(v)

@router.patch("/{vuln_id}", response_model=VulnerabilityOut)
def update_vuln(vuln_id: int, data: VulnerabilityUpdate, request: Request,
                db: Session = Depends(get_db), current_user: User = Depends(require_analyst_or_above)):
    v = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not v:
        raise HTTPException(404, "Vulnerability not found")
    for k, val in data.model_dump(exclude_none=True).items():
        setattr(v, k, val)
    if data.status and data.status == VulnStatus.resolved and not v.resolved_at:
        v.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(v)
    log_action(db, current_user.id, "update", "vulnerability", vuln_id, data.model_dump(exclude_none=True), request)
    return VulnerabilityOut.model_validate(v)
