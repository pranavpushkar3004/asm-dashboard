from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.db.database import get_db
from app.models.models import AuditLog, User
from app.schemas.schemas import AuditLogOut, PaginatedResponse
from app.core.security import get_current_user, require_analyst_or_above

router = APIRouter()

@router.get("", response_model=PaginatedResponse)
def list_audit_logs(
    page: int = Query(1, ge=1), size: int = Query(50, ge=1, le=200),
    user_id: Optional[int] = None, action: Optional[str] = None,
    resource: Optional[str] = None,
    db: Session = Depends(get_db), current_user: User = Depends(require_analyst_or_above)
):
    query = db.query(AuditLog).options(joinedload(AuditLog.user))
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if resource:
        query = query.filter(AuditLog.resource.ilike(f"%{resource}%"))
    total = query.count()
    items = query.order_by(AuditLog.created_at.desc()).offset((page-1)*size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": [AuditLogOut.model_validate(l) for l in items]}
