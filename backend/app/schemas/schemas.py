from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime, date
from decimal import Decimal
from app.models.models import (
    UserRole, AssetType, AssetStatus, RiskLevel, VulnStatus,
    AlertStatus, DomainStatus, ScanStatus, ChangeType
)

# ---- Pagination ----
class PaginatedResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[Any]

# ---- Token ----
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# ---- User ----
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.viewer
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    last_login: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

# ---- Approved Domain ----
class ApprovedDomainBase(BaseModel):
    domain: str
    owner: Optional[str] = None
    status: DomainStatus = DomainStatus.approved
    approval_date: Optional[date] = None
    review_date: Optional[date] = None
    notes: Optional[str] = None

class ApprovedDomainCreate(ApprovedDomainBase):
    pass

class ApprovedDomainUpdate(BaseModel):
    owner: Optional[str] = None
    status: Optional[DomainStatus] = None
    review_date: Optional[date] = None
    notes: Optional[str] = None

class ApprovedDomainOut(ApprovedDomainBase):
    id: int
    approved_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# ---- Asset ----
class AssetBase(BaseModel):
    name: str
    asset_type: AssetType
    ip_address: Optional[str] = None
    domain_id: Optional[int] = None
    port: Optional[int] = None
    protocol: Optional[str] = None
    service: Optional[str] = None
    service_version: Optional[str] = None
    technology: Optional[str] = None
    environment: Optional[str] = "production"
    owner: Optional[str] = None
    criticality: RiskLevel = RiskLevel.medium
    status: AssetStatus = AssetStatus.active

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    ip_address: Optional[str] = None
    port: Optional[int] = None
    service: Optional[str] = None
    service_version: Optional[str] = None
    technology: Optional[str] = None
    environment: Optional[str] = None
    owner: Optional[str] = None
    criticality: Optional[RiskLevel] = None
    status: Optional[AssetStatus] = None

class AssetOut(AssetBase):
    id: int
    risk_score: Optional[Decimal] = None
    risk_level: RiskLevel
    risk_factors: Optional[list] = None
    first_seen: datetime
    last_seen: datetime
    created_at: datetime
    domain: Optional[ApprovedDomainOut] = None
    class Config:
        from_attributes = True

# ---- DNS Record ----
class DNSRecordBase(BaseModel):
    domain_id: Optional[int] = None
    fqdn: str
    record_type: str
    value: str
    ttl: int = 3600
    is_current: bool = True

class DNSRecordCreate(DNSRecordBase):
    pass

class DNSRecordOut(DNSRecordBase):
    id: int
    first_seen: datetime
    last_seen: datetime
    created_at: datetime
    class Config:
        from_attributes = True

# ---- Certificate ----
class CertificateOut(BaseModel):
    id: int
    asset_id: Optional[int] = None
    domain_id: Optional[int] = None
    common_name: Optional[str] = None
    issuer: Optional[str] = None
    issuer_org: Optional[str] = None
    serial_number: Optional[str] = None
    fingerprint: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    sans: Optional[List[str]] = None
    key_algorithm: Optional[str] = None
    key_size: Optional[int] = None
    signature_algo: Optional[str] = None
    status: Optional[str] = None
    days_remaining: Optional[int] = None
    grade: Optional[str] = None
    first_seen: datetime
    last_seen: datetime
    domain: Optional[ApprovedDomainOut] = None
    class Config:
        from_attributes = True

# ---- Exposed Service ----
class ExposedServiceOut(BaseModel):
    id: int
    asset_id: Optional[int] = None
    ip_address: str
    port: int
    protocol: str
    service_name: Optional[str] = None
    service_version: Optional[str] = None
    banner: Optional[str] = None
    domain_id: Optional[int] = None
    is_new: bool
    risk_level: RiskLevel
    first_seen: datetime
    last_seen: datetime
    domain: Optional[ApprovedDomainOut] = None
    class Config:
        from_attributes = True

# ---- Vulnerability ----
class VulnerabilityBase(BaseModel):
    cve_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    asset_id: Optional[int] = None
    service_id: Optional[int] = None
    severity: RiskLevel = RiskLevel.medium
    cvss_score: Optional[Decimal] = None
    cvss_vector: Optional[str] = None
    status: VulnStatus = VulnStatus.open
    owner: Optional[str] = None
    remediation: Optional[str] = None
    notes: Optional[str] = None

class VulnerabilityCreate(VulnerabilityBase):
    pass

class VulnerabilityUpdate(BaseModel):
    status: Optional[VulnStatus] = None
    owner: Optional[str] = None
    remediation: Optional[str] = None
    notes: Optional[str] = None
    severity: Optional[RiskLevel] = None

class VulnerabilityOut(VulnerabilityBase):
    id: int
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    asset: Optional[AssetOut] = None
    class Config:
        from_attributes = True

# ---- Scan ----
class ScanCreate(BaseModel):
    name: str
    scan_type: str = "simulated"
    domain_id: int
    notes: Optional[str] = None

class ScanOut(BaseModel):
    id: int
    name: str
    scan_type: str
    status: ScanStatus
    domain_id: Optional[int] = None
    initiated_by: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    findings: Optional[dict] = None
    notes: Optional[str] = None
    created_at: datetime
    domain: Optional[ApprovedDomainOut] = None
    class Config:
        from_attributes = True

# ---- Surface Change ----
class SurfaceChangeOut(BaseModel):
    id: int
    change_type: ChangeType
    asset_id: Optional[int] = None
    domain_id: Optional[int] = None
    description: str
    previous_val: Optional[str] = None
    new_val: Optional[str] = None
    priority: RiskLevel
    scan_id: Optional[int] = None
    detected_at: datetime
    created_at: datetime
    asset: Optional[AssetOut] = None
    domain: Optional[ApprovedDomainOut] = None
    class Config:
        from_attributes = True

# ---- Alert ----
class AlertUpdate(BaseModel):
    status: Optional[AlertStatus] = None
    assigned_to: Optional[int] = None

class AlertOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    alert_type: str
    severity: RiskLevel
    status: AlertStatus
    asset_id: Optional[int] = None
    domain_id: Optional[int] = None
    assigned_to: Optional[int] = None
    change_id: Optional[int] = None
    vuln_id: Optional[int] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    asset: Optional[AssetOut] = None
    domain: Optional[ApprovedDomainOut] = None
    class Config:
        from_attributes = True

# ---- Audit Log ----
class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    resource: Optional[str] = None
    resource_id: Optional[int] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    created_at: datetime
    user: Optional[UserOut] = None
    class Config:
        from_attributes = True

# ---- Dashboard Stats ----
class DashboardStats(BaseModel):
    total_assets: int
    total_domains: int
    total_subdomains: int
    total_ips: int
    total_services: int
    total_certificates: int
    total_vulnerabilities: int
    critical_vulns: int
    high_vulns: int
    open_alerts: int
    critical_alerts: int
    new_assets_7d: int
    expiring_certs: int
    risk_distribution: dict
    vuln_by_severity: dict
    asset_by_type: dict
    recent_changes: List[SurfaceChangeOut]
    top_alerts: List[AlertOut]
