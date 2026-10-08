from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.db.database import get_db
from app.models.models import ExposedService, RiskLevel, User
from app.schemas.schemas import ExposedServiceOut, PaginatedResponse
from app.core.security import get_current_user

router = APIRouter()

@router.get("", response_model=PaginatedResponse)
def list_services(
    page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
    q: Optional[str] = None, risk_level: Optional[str] = None,
    port: Optional[int] = None, domain_id: Optional[int] = None,
    is_new: Optional[bool] = None,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    from sqlalchemy import or_
    query = db.query(ExposedService).options(joinedload(ExposedService.domain))
    if q:
        query = query.filter(or_(
            ExposedService.service_name.ilike(f"%{q}%"),
            ExposedService.service_version.ilike(f"%{q}%"),
        ))
    if risk_level:
        query = query.filter(ExposedService.risk_level == risk_level)
    if port:
        query = query.filter(ExposedService.port == port)
    if domain_id:
        query = query.filter(ExposedService.domain_id == domain_id)
    if is_new is not None:
        query = query.filter(ExposedService.is_new == is_new)
    total = query.count()
    items = query.order_by(ExposedService.risk_level.desc(), ExposedService.first_seen.desc()).offset((page-1)*size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": [ExposedServiceOut.model_validate(s) for s in items]}
