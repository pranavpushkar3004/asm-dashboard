from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import Optional, List
from app.db.database import get_db
from app.models.models import Asset, AssetType, RiskLevel, AssetStatus, User
from app.schemas.schemas import AssetOut, AssetCreate, AssetUpdate, PaginatedResponse
from app.core.security import get_current_user, require_analyst_or_above
from app.services.audit import log_action
from app.services.risk import compute_risk

router = APIRouter()

@router.get("", response_model=PaginatedResponse)
def list_assets(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    q: Optional[str] = None,
    asset_type: Optional[str] = None,
    domain_id: Optional[int] = None,
    risk_level: Optional[str] = None,
    environment: Optional[str] = None,
    status: Optional[str] = None,
    owner: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Asset).options(joinedload(Asset.domain))
    if q:
        query = query.filter(or_(
            Asset.name.ilike(f"%{q}%"),
            Asset.ip_address.cast(type_=None).ilike(f"%{q}%"),
            Asset.service.ilike(f"%{q}%"),
            Asset.technology.ilike(f"%{q}%"),
        ))
    if asset_type:
        query = query.filter(Asset.asset_type == asset_type)
    if domain_id:
        query = query.filter(Asset.domain_id == domain_id)
    if risk_level:
        query = query.filter(Asset.risk_level == risk_level)
    if environment:
        query = query.filter(Asset.environment == environment)
    if status:
        query = query.filter(Asset.status == status)
    if owner:
        query = query.filter(Asset.owner.ilike(f"%{owner}%"))
    total = query.count()
    items = query.order_by(Asset.risk_score.desc()).offset((page - 1) * size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": [AssetOut.model_validate(a) for a in items]}

@router.get("/{asset_id}", response_model=AssetOut)
def get_asset(asset_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    asset = db.query(Asset).options(joinedload(Asset.domain)).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "Asset not found")
    return AssetOut.model_validate(asset)

@router.post("", response_model=AssetOut, status_code=201)
def create_asset(data: AssetCreate, request: Request, db: Session = Depends(get_db),
                 current_user: User = Depends(require_analyst_or_above)):
    asset = Asset(**data.model_dump())
    compute_risk(asset)
    db.add(asset)
    db.commit()
    db.refresh(asset)
    log_action(db, current_user.id, "create", "asset", asset.id, {"name": asset.name}, request)
    return AssetOut.model_validate(asset)

@router.patch("/{asset_id}", response_model=AssetOut)
def update_asset(asset_id: int, data: AssetUpdate, request: Request,
                 db: Session = Depends(get_db), current_user: User = Depends(require_analyst_or_above)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "Asset not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(asset, k, v)
    compute_risk(asset)
    db.commit()
    db.refresh(asset)
    log_action(db, current_user.id, "update", "asset", asset.id, data.model_dump(exclude_none=True), request)
    return AssetOut.model_validate(asset)

@router.delete("/{asset_id}", status_code=204)
def delete_asset(asset_id: int, request: Request, db: Session = Depends(get_db),
                 current_user: User = Depends(require_analyst_or_above)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "Asset not found")
    log_action(db, current_user.id, "delete", "asset", asset_id, {"name": asset.name}, request)
    db.delete(asset)
    db.commit()
