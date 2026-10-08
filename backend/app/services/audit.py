from sqlalchemy.orm import Session
from fastapi import Request
from app.models.models import AuditLog

def log_action(db: Session, user_id: int, action: str, resource: str = None,
               resource_id: int = None, details: dict = None, request: Request = None):
    ip = None
    ua = None
    if request:
        ip = request.client.host if request.client else None
        ua = request.headers.get("user-agent")
    entry = AuditLog(
        user_id=user_id, action=action, resource=resource,
        resource_id=resource_id, details=details or {},
        ip_address=ip, user_agent=ua
    )
    db.add(entry)
    db.commit()
