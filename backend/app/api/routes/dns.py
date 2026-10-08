from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.db.database import get_db
from app.models.models import DNSRecord, User
from app.schemas.schemas import DNSRecordOut, PaginatedResponse
from app.core.security import get_current_user

router = APIRouter()

@router.get("", response_model=PaginatedResponse)
def list_dns(
    page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
    q: Optional[str] = None, record_type: Optional[str] = None,
    domain_id: Optional[int] = None, is_current: Optional[bool] = None,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    from sqlalchemy import or_
    query = db.query(DNSRecord)
    if q:
        query = query.filter(or_(DNSRecord.fqdn.ilike(f"%{q}%"), DNSRecord.value.ilike(f"%{q}%")))
    if record_type:
        query = query.filter(DNSRecord.record_type == record_type.upper())
    if domain_id:
        query = query.filter(DNSRecord.domain_id == domain_id)
    if is_current is not None:
        query = query.filter(DNSRecord.is_current == is_current)
    total = query.count()
    items = query.order_by(DNSRecord.fqdn, DNSRecord.record_type).offset((page-1)*size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": [DNSRecordOut.model_validate(r) for r in items]}
