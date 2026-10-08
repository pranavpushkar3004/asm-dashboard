from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Integer
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.models import (
    Asset, ApprovedDomain, Certificate, ExposedService, Vulnerability,
    Alert, SurfaceChange, AssetType, RiskLevel, AlertStatus, VulnStatus
)
from app.schemas.schemas import DashboardStats, SurfaceChangeOut, AlertOut
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    total_assets = db.query(Asset).count()
    total_domains = db.query(Asset).filter(Asset.asset_type == AssetType.domain).count()
    total_subdomains = db.query(Asset).filter(Asset.asset_type == AssetType.subdomain).count()
    total_ips = db.query(Asset).filter(Asset.asset_type == AssetType.ip).count()
    total_services = db.query(ExposedService).count()
    total_certs = db.query(Certificate).count()
    total_vulns = db.query(Vulnerability).filter(Vulnerability.status != VulnStatus.resolved).count()
    critical_vulns = db.query(Vulnerability).filter(
        Vulnerability.severity == RiskLevel.critical,
        Vulnerability.status != VulnStatus.resolved
    ).count()
    high_vulns = db.query(Vulnerability).filter(
        Vulnerability.severity == RiskLevel.high,
        Vulnerability.status != VulnStatus.resolved
    ).count()
    open_alerts = db.query(Alert).filter(Alert.status == AlertStatus.open).count()
    critical_alerts = db.query(Alert).filter(
        Alert.severity == RiskLevel.critical,
        Alert.status == AlertStatus.open
    ).count()
    new_assets_7d = db.query(Asset).filter(Asset.first_seen >= week_ago).count()
    expiring_certs = db.query(Certificate).filter(
        Certificate.days_remaining >= 0,
        Certificate.days_remaining <= 30
    ).count()

    # Risk distribution
    risk_dist = {}
    for level in RiskLevel:
        risk_dist[level.value] = db.query(Asset).filter(Asset.risk_level == level).count()

    # Vuln by severity
    vuln_sev = {}
    for level in RiskLevel:
        vuln_sev[level.value] = db.query(Vulnerability).filter(
            Vulnerability.severity == level
        ).count()

    # Asset by type
    asset_type_dist = {}
    for at in AssetType:
        asset_type_dist[at.value] = db.query(Asset).filter(Asset.asset_type == at).count()

    # Recent changes
    changes = db.query(SurfaceChange).order_by(SurfaceChange.detected_at.desc()).limit(5).all()
    # Top alerts
    top_alerts = db.query(Alert).filter(
        Alert.status.in_([AlertStatus.open, AlertStatus.acknowledged])
    ).order_by(Alert.severity.desc(), Alert.created_at.desc()).limit(5).all()

    return {
        "total_assets": total_assets,
        "total_domains": total_domains,
        "total_subdomains": total_subdomains,
        "total_ips": total_ips,
        "total_services": total_services,
        "total_certificates": total_certs,
        "total_vulnerabilities": total_vulns,
        "critical_vulns": critical_vulns,
        "high_vulns": high_vulns,
        "open_alerts": open_alerts,
        "critical_alerts": critical_alerts,
        "new_assets_7d": new_assets_7d,
        "expiring_certs": expiring_certs,
        "risk_distribution": risk_dist,
        "vuln_by_severity": vuln_sev,
        "asset_by_type": asset_type_dist,
        "recent_changes": [SurfaceChangeOut.model_validate(c) for c in changes],
        "top_alerts": [AlertOut.model_validate(a) for a in top_alerts],
    }
