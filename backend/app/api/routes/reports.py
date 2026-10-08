from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import (
    Asset, Vulnerability, Certificate, Alert, ExposedService,
    SurfaceChange, ApprovedDomain, User, RiskLevel, VulnStatus, AlertStatus
)
from app.core.security import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/executive-summary")
def executive_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_assets = db.query(Asset).count()
    open_vulns = db.query(Vulnerability).filter(Vulnerability.status != VulnStatus.resolved).count()
    critical_vulns = db.query(Vulnerability).filter(
        Vulnerability.severity == RiskLevel.critical, Vulnerability.status != VulnStatus.resolved
    ).count()
    open_alerts = db.query(Alert).filter(Alert.status == AlertStatus.open).count()
    expiring_certs = db.query(Certificate).filter(
        Certificate.days_remaining >= 0, Certificate.days_remaining <= 30
    ).count()
    new_services = db.query(ExposedService).filter(ExposedService.is_new == True).count()
    domains = db.query(ApprovedDomain).all()
    recent_changes = db.query(SurfaceChange).order_by(SurfaceChange.detected_at.desc()).limit(10).all()
    top_vulns = db.query(Vulnerability).filter(
        Vulnerability.status != VulnStatus.resolved
    ).order_by(Vulnerability.cvss_score.desc().nullslast()).limit(10).all()
    top_alerts = db.query(Alert).filter(
        Alert.status == AlertStatus.open
    ).order_by(Alert.severity.desc(), Alert.created_at.desc()).limit(10).all()

    return {
        "generated_at": datetime.utcnow().isoformat(),
        "generated_by": current_user.username,
        "summary": {
            "total_assets": total_assets,
            "open_vulnerabilities": open_vulns,
            "critical_vulnerabilities": critical_vulns,
            "open_alerts": open_alerts,
            "expiring_certificates": expiring_certs,
            "new_exposed_services": new_services,
            "approved_domains": len(domains),
        },
        "approved_domains": [{"id": d.id, "domain": d.domain, "owner": d.owner, "status": d.status.value} for d in domains],
        "recent_changes": [
            {"id": c.id, "type": c.change_type.value, "description": c.description,
             "priority": c.priority.value, "detected_at": c.detected_at.isoformat()}
            for c in recent_changes
        ],
        "top_vulnerabilities": [
            {"id": v.id, "title": v.title, "cve": v.cve_id, "severity": v.severity.value,
             "cvss": str(v.cvss_score) if v.cvss_score else None, "status": v.status.value}
            for v in top_vulns
        ],
        "top_alerts": [
            {"id": a.id, "title": a.title, "severity": a.severity.value,
             "status": a.status.value, "created_at": a.created_at.isoformat()}
            for a in top_alerts
        ],
    }
