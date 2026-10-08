from sqlalchemy import (
    Column, Integer, String, Boolean, Text, DateTime, Date,
    Numeric, ForeignKey, ARRAY, JSON, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class UserRole(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"
    viewer = "viewer"

class AssetType(str, enum.Enum):
    domain = "domain"
    subdomain = "subdomain"
    ip = "ip"
    service = "service"
    certificate = "certificate"

class AssetStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    retired = "retired"
    unknown = "unknown"

class RiskLevel(str, enum.Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"
    info = "info"

class VulnStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    accepted = "accepted"
    false_positive = "false_positive"

class AlertStatus(str, enum.Enum):
    open = "open"
    acknowledged = "acknowledged"
    resolved = "resolved"
    suppressed = "suppressed"

class DomainStatus(str, enum.Enum):
    approved = "approved"
    pending = "pending"
    revoked = "revoked"
    expired = "expired"

class ScanStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"

class ChangeType(str, enum.Enum):
    new_domain = "new_domain"
    new_subdomain = "new_subdomain"
    new_ip = "new_ip"
    new_service = "new_service"
    dns_change = "dns_change"
    cert_change = "cert_change"
    new_vulnerability = "new_vulnerability"
    removed_asset = "removed_asset"
    risk_change = "risk_change"
    status_change = "status_change"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(128))
    hashed_password = Column(Text, nullable=False)
    role = Column(SAEnum(UserRole, name="user_role"), nullable=False, default=UserRole.viewer)
    is_active = Column(Boolean, nullable=False, default=True)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ApprovedDomain(Base):
    __tablename__ = "approved_domains"
    id = Column(Integer, primary_key=True)
    domain = Column(String(255), unique=True, nullable=False)
    owner = Column(String(128))
    status = Column(SAEnum(DomainStatus, name="domain_status"), nullable=False, default=DomainStatus.approved)
    approval_date = Column(Date, nullable=False, default=func.current_date())
    review_date = Column(Date)
    notes = Column(Text)
    approved_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    assets = relationship("Asset", back_populates="domain")


class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    asset_type = Column(SAEnum(AssetType, name="asset_type"), nullable=False)
    ip_address = Column(INET)
    domain_id = Column(Integer, ForeignKey("approved_domains.id"))
    port = Column(Integer)
    protocol = Column(String(16))
    service = Column(String(128))
    service_version = Column(String(128))
    technology = Column(String(255))
    environment = Column(String(64), default="production")
    owner = Column(String(128))
    criticality = Column(SAEnum(RiskLevel, name="risk_level"), nullable=False, default=RiskLevel.medium)
    status = Column(SAEnum(AssetStatus, name="asset_status"), nullable=False, default=AssetStatus.active)
    risk_score = Column(Numeric(5, 2), default=0)
    risk_level = Column(SAEnum(RiskLevel, name="risk_level"), nullable=False, default=RiskLevel.low)
    risk_factors = Column(JSONB, default=list)
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    domain = relationship("ApprovedDomain", back_populates="assets")
    vulnerabilities = relationship("Vulnerability", back_populates="asset")
    services = relationship("ExposedService", back_populates="asset")


class DNSRecord(Base):
    __tablename__ = "dns_records"
    id = Column(Integer, primary_key=True)
    domain_id = Column(Integer, ForeignKey("approved_domains.id"))
    fqdn = Column(String(255), nullable=False)
    record_type = Column(String(16), nullable=False)
    value = Column(Text, nullable=False)
    ttl = Column(Integer, default=3600)
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    is_current = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    domain = relationship("ApprovedDomain")


class Certificate(Base):
    __tablename__ = "certificates"
    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    domain_id = Column(Integer, ForeignKey("approved_domains.id"))
    common_name = Column(String(255))
    issuer = Column(String(512))
    issuer_org = Column(String(255))
    subject = Column(String(512))
    serial_number = Column(String(128))
    fingerprint = Column(String(256))
    valid_from = Column(DateTime(timezone=True))
    valid_to = Column(DateTime(timezone=True))
    sans = Column(ARRAY(String))
    key_algorithm = Column(String(64))
    key_size = Column(Integer)
    signature_algo = Column(String(64))
    status = Column(String(32), default="valid")
    days_remaining = Column(Integer)
    grade = Column(String(4))
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    domain = relationship("ApprovedDomain")


class ExposedService(Base):
    __tablename__ = "exposed_services"
    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    ip_address = Column(INET, nullable=False)
    port = Column(Integer, nullable=False)
    protocol = Column(String(16), nullable=False, default="tcp")
    service_name = Column(String(128))
    service_version = Column(String(255))
    banner = Column(Text)
    domain_id = Column(Integer, ForeignKey("approved_domains.id"))
    is_new = Column(Boolean, nullable=False, default=True)
    risk_level = Column(SAEnum(RiskLevel, name="risk_level"), nullable=False, default=RiskLevel.low)
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    asset = relationship("Asset", back_populates="services")
    domain = relationship("ApprovedDomain")


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"
    id = Column(Integer, primary_key=True)
    cve_id = Column(String(32))
    title = Column(String(512), nullable=False)
    description = Column(Text)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    service_id = Column(Integer, ForeignKey("exposed_services.id"))
    severity = Column(SAEnum(RiskLevel, name="risk_level"), nullable=False, default=RiskLevel.medium)
    cvss_score = Column(Numeric(4, 1))
    cvss_vector = Column(String(128))
    status = Column(SAEnum(VulnStatus, name="vuln_status"), nullable=False, default=VulnStatus.open)
    owner = Column(String(128))
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True))
    remediation = Column(Text)
    notes = Column(Text)
    plugin_id = Column(String(64))
    scan_id = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    asset = relationship("Asset", back_populates="vulnerabilities")


class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    scan_type = Column(String(64), nullable=False, default="simulated")
    status = Column(SAEnum(ScanStatus, name="scan_status"), nullable=False, default=ScanStatus.pending)
    domain_id = Column(Integer, ForeignKey("approved_domains.id"))
    initiated_by = Column(Integer, ForeignKey("users.id"))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    findings = Column(JSONB, default=dict)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    domain = relationship("ApprovedDomain")
    initiator = relationship("User")


class SurfaceChange(Base):
    __tablename__ = "surface_changes"
    id = Column(Integer, primary_key=True)
    change_type = Column(SAEnum(ChangeType, name="change_type"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    domain_id = Column(Integer, ForeignKey("approved_domains.id"))
    description = Column(Text, nullable=False)
    previous_val = Column(Text)
    new_val = Column(Text)
    priority = Column(SAEnum(RiskLevel, name="risk_level"), nullable=False, default=RiskLevel.low)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    asset = relationship("Asset")
    domain = relationship("ApprovedDomain")


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True)
    title = Column(String(512), nullable=False)
    description = Column(Text)
    alert_type = Column(String(64), nullable=False)
    severity = Column(SAEnum(RiskLevel, name="risk_level"), nullable=False, default=RiskLevel.medium)
    status = Column(SAEnum(AlertStatus, name="alert_status"), nullable=False, default=AlertStatus.open)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    domain_id = Column(Integer, ForeignKey("approved_domains.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"))
    change_id = Column(Integer, ForeignKey("surface_changes.id"))
    vuln_id = Column(Integer, ForeignKey("vulnerabilities.id"))
    acknowledged_at = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    asset = relationship("Asset")
    domain = relationship("ApprovedDomain")
    assignee = relationship("User")


class RemediationTask(Base):
    __tablename__ = "remediation_tasks"
    id = Column(Integer, primary_key=True)
    title = Column(String(512), nullable=False)
    description = Column(Text)
    vuln_id = Column(Integer, ForeignKey("vulnerabilities.id"))
    alert_id = Column(Integer, ForeignKey("alerts.id"))
    asset_id = Column(Integer, ForeignKey("assets.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"))
    status = Column(String(32), nullable=False, default="open")
    priority = Column(SAEnum(RiskLevel, name="risk_level"), nullable=False, default=RiskLevel.medium)
    due_date = Column(Date)
    completed_at = Column(DateTime(timezone=True))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(128), nullable=False)
    resource = Column(String(128))
    resource_id = Column(Integer)
    details = Column(JSONB, default=dict)
    ip_address = Column(INET)
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")
