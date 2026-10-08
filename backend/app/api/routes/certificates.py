from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.db.database import get_db
from app.models.models import Certificate, User
from app.schemas.schemas import CertificateOut, PaginatedResponse
from app.core.security import get_current_user

router = APIRouter()

@router.get("", response_model=PaginatedResponse)
def list_certs(
    page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None, domain_id: Optional[int] = None,
    expiring_soon: Optional[bool] = None,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = db.query(Certificate).options(joinedload(Certificate.domain))
    if status:
        query = query.filter(Certificate.status == status)
    if domain_id:
        query = query.filter(Certificate.domain_id == domain_id)
    if expiring_soon:
        query = query.filter(Certificate.days_remaining >= 0, Certificate.days_remaining <= 30)
    total = query.count()
    items = query.order_by(Certificate.days_remaining.asc().nullslast()).offset((page-1)*size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": [CertificateOut.model_validate(c) for c in items]}
