from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.db.database import get_db
from app.models.models import SurfaceChange, RiskLevel, ChangeType, User
from app.schemas.schemas import SurfaceChangeOut, PaginatedResponse
from app.core.security import get_current_user

router = APIRouter()

@router.get("", response_model=PaginatedResponse)
def list_changes(
    page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
    change_type: Optional[str] = None, priority: Optional[str] = None,
    domain_id: Optional[int] = None,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = db.query(SurfaceChange).options(
        joinedload(SurfaceChange.asset), joinedload(SurfaceChange.domain)
    )
    if change_type:
        query = query.filter(SurfaceChange.change_type == change_type)
    if priority:
        query = query.filter(SurfaceChange.priority == priority)
    if domain_id:
        query = query.filter(SurfaceChange.domain_id == domain_id)
    total = query.count()
    items = query.order_by(SurfaceChange.detected_at.desc()).offset((page-1)*size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": [SurfaceChangeOut.model_validate(c) for c in items]}
