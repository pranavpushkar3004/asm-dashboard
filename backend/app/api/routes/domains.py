from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.db.database import get_db
from app.models.models import ApprovedDomain, DomainStatus, User
from app.schemas.schemas import ApprovedDomainOut, ApprovedDomainCreate, ApprovedDomainUpdate, PaginatedResponse
from app.core.security import get_current_user, require_analyst_or_above
from app.services.audit import log_action

router = APIRouter()

@router.get("", response_model=PaginatedResponse)
def list_domains(
    page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
    q: Optional[str] = None, status: Optional[str] = None,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = db.query(ApprovedDomain)
    if q:
        query = query.filter(ApprovedDomain.domain.ilike(f"%{q}%"))
    if status:
        query = query.filter(ApprovedDomain.status == status)
    total = query.count()
    items = query.order_by(ApprovedDomain.created_at.desc()).offset((page-1)*size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": [ApprovedDomainOut.model_validate(d) for d in items]}

@router.get("/{domain_id}", response_model=ApprovedDomainOut)
def get_domain(domain_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    d = db.query(ApprovedDomain).filter(ApprovedDomain.id == domain_id).first()
    if not d:
        raise HTTPException(404, "Domain not found")
    return ApprovedDomainOut.model_validate(d)

@router.post("", response_model=ApprovedDomainOut, status_code=201)
def create_domain(data: ApprovedDomainCreate, request: Request, db: Session = Depends(get_db),
                  current_user: User = Depends(require_analyst_or_above)):
    if db.query(ApprovedDomain).filter(ApprovedDomain.domain == data.domain).first():
        raise HTTPException(409, "Domain already exists")
    d = ApprovedDomain(**data.model_dump(), approved_by_id=current_user.id)
    db.add(d)
    db.commit()
    db.refresh(d)
    log_action(db, current_user.id, "create", "approved_domain", d.id, {"domain": d.domain}, request)
    return ApprovedDomainOut.model_validate(d)

@router.patch("/{domain_id}", response_model=ApprovedDomainOut)
def update_domain(domain_id: int, data: ApprovedDomainUpdate, request: Request,
                  db: Session = Depends(get_db), current_user: User = Depends(require_analyst_or_above)):
    d = db.query(ApprovedDomain).filter(ApprovedDomain.id == domain_id).first()
    if not d:
        raise HTTPException(404, "Domain not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(d, k, v)
    db.commit()
    db.refresh(d)
    log_action(db, current_user.id, "update", "approved_domain", domain_id, data.model_dump(exclude_none=True), request)
    return ApprovedDomainOut.model_validate(d)

@router.delete("/{domain_id}", status_code=204)
def delete_domain(domain_id: int, request: Request, db: Session = Depends(get_db),
                  current_user: User = Depends(require_analyst_or_above)):
    d = db.query(ApprovedDomain).filter(ApprovedDomain.id == domain_id).first()
    if not d:
        raise HTTPException(404, "Domain not found")
    log_action(db, current_user.id, "delete", "approved_domain", domain_id, {"domain": d.domain}, request)
    db.delete(d)
    db.commit()
