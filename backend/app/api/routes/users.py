from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.db.database import get_db
from app.models.models import User, UserRole
from app.schemas.schemas import UserOut, UserCreate, UserUpdate, PaginatedResponse
from app.core.security import get_current_user, require_admin, get_password_hash
from app.services.audit import log_action

router = APIRouter()

@router.get("", response_model=PaginatedResponse)
def list_users(
    page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db), current_user: User = Depends(require_admin)
):
    total = db.query(User).count()
    items = db.query(User).order_by(User.created_at.desc()).offset((page-1)*size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": [UserOut.model_validate(u) for u in items]}

@router.post("", response_model=UserOut, status_code=201)
def create_user(data: UserCreate, request: Request, db: Session = Depends(get_db),
                current_user: User = Depends(require_admin)):
    if db.query(User).filter((User.username == data.username) | (User.email == data.email)).first():
        raise HTTPException(409, "Username or email already exists")
    u = User(
        username=data.username, email=data.email, full_name=data.full_name,
        hashed_password=get_password_hash(data.password), role=data.role, is_active=data.is_active
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    log_action(db, current_user.id, "create", "user", u.id, {"username": u.username, "role": u.role.value}, request)
    return UserOut.model_validate(u)

@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: int, data: UserUpdate, request: Request,
                db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(404, "User not found")
    for k, v in data.model_dump(exclude_none=True).items():
        if k == "password":
            u.hashed_password = get_password_hash(v)
        else:
            setattr(u, k, v)
    db.commit()
    db.refresh(u)
    log_action(db, current_user.id, "update", "user", user_id, {"fields": list(data.model_dump(exclude_none=True).keys())}, request)
    return UserOut.model_validate(u)

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, request: Request, db: Session = Depends(get_db),
                current_user: User = Depends(require_admin)):
    if user_id == current_user.id:
        raise HTTPException(400, "Cannot delete yourself")
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(404, "User not found")
    log_action(db, current_user.id, "delete", "user", user_id, {"username": u.username}, request)
    db.delete(u)
    db.commit()
