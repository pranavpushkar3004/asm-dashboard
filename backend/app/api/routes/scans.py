from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.db.database import get_db
from app.models.models import (
    Scan, ScanStatus, ApprovedDomain, Asset, DNSRecord, Certificate,
    ExposedService, Vulnerability, SurfaceChange, Alert, User,
    AssetType, RiskLevel, ChangeType, VulnStatus, AlertStatus
)
from app.schemas.schemas import ScanOut, ScanCreate, PaginatedResponse
from app.core.security import get_current_user, require_analyst_or_above
from app.services.audit import log_action
from datetime import datetime
import random

router = APIRouter()

@router.get("", response_model=PaginatedResponse)
def list_scans(
    page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = db.query(Scan).options(joinedload(Scan.domain))
    total = query.count()
    items = query.order_by(Scan.created_at.desc()).offset((page-1)*size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": [ScanOut.model_validate(s) for s in items]}

@router.post("", response_model=ScanOut, status_code=201)
def create_scan(data: ScanCreate, request: Request, db: Session = Depends(get_db),
                current_user: User = Depends(require_analyst_or_above)):
    domain = db.query(ApprovedDomain).filter(
        ApprovedDomain.id == data.domain_id,
        ApprovedDomain.status == "approved"
    ).first()
    if not domain:
        raise HTTPException(400, "Domain must be approved before scanning")
    scan = Scan(
        name=data.name, scan_type=data.scan_type, domain_id=data.domain_id,
        initiated_by=current_user.id, status=ScanStatus.running, started_at=datetime.utcnow(),
        notes=data.notes
    )
    db.add(scan)
    db.flush()
    log_action(db, current_user.id, "scan_initiated", "scan", scan.id,
               {"domain": domain.domain, "scan_type": data.scan_type}, request)
    # Run simulated discovery
    results = _simulate_scan(db, domain, scan, current_user)
    scan.status = ScanStatus.completed
    scan.completed_at = datetime.utcnow()
    scan.findings = results
    db.commit()
    db.refresh(scan)
    log_action(db, current_user.id, "scan_completed", "scan", scan.id, results, request)
    return ScanOut.model_validate(scan)

def _simulate_scan(db: Session, domain: ApprovedDomain, scan: Scan, user: User) -> dict:
    """Generate realistic simulated scan findings for an approved domain."""
    subdomains = [f"scan-{random.randint(100,999)}.{domain.domain}"]
    ports = random.choices([80, 443, 8080, 22, 25, 8443], k=random.randint(1, 3))
    vuln_templates = [
        {"title": "Missing HSTS Header", "severity": "low", "cvss": 3.1, "remediation": "Add Strict-Transport-Security header"},
        {"title": "Outdated TLS Version", "severity": "medium", "cvss": 5.9, "remediation": "Disable TLS 1.0/1.1"},
        {"title": "X-Content-Type-Options Missing", "severity": "low", "cvss": 2.5, "remediation": "Add X-Content-Type-Options: nosniff"},
    ]
    new_assets = 0
    new_services = 0
    new_vulns = 0

    for sub in subdomains:
        existing = db.query(Asset).filter(Asset.name == sub).first()
        if not existing:
            asset = Asset(
                name=sub, asset_type=AssetType.subdomain,
                ip_address=f"192.0.2.{random.randint(100, 200)}",
                domain_id=domain.id, environment="production",
                owner=domain.owner, criticality=RiskLevel.medium,
                risk_score=15, risk_level=RiskLevel.low
            )
            db.add(asset)
            db.flush()
            change = SurfaceChange(
                change_type=ChangeType.new_subdomain, asset_id=asset.id,
                domain_id=domain.id, description=f"New subdomain {sub} discovered by scan",
                new_val=str(asset.ip_address), priority=RiskLevel.medium, scan_id=scan.id
            )
            db.add(change)
            new_assets += 1

    for port in ports:
        svc_map = {80: "HTTP", 443: "HTTPS", 8080: "HTTP", 22: "SSH", 25: "SMTP", 8443: "HTTPS"}
        svc = ExposedService(
            ip_address=f"192.0.2.{random.randint(10, 50)}",
            port=port, protocol="tcp",
            service_name=svc_map.get(port, "Unknown"),
            domain_id=domain.id, is_new=True,
            risk_level=RiskLevel.high if port in [21, 23, 3389] else RiskLevel.low
        )
        db.add(svc)
        new_services += 1

    for tpl in random.choices(vuln_templates, k=random.randint(1, 2)):
        v = Vulnerability(
            title=tpl["title"], severity=tpl["severity"],
            cvss_score=tpl["cvss"], remediation=tpl["remediation"],
            status=VulnStatus.open, scan_id=scan.id
        )
        db.add(v)
        new_vulns += 1

    db.flush()
    return {"new_assets": new_assets, "new_services": new_services, "new_vulnerabilities": new_vulns}
