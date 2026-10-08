-- =============================================================
-- Attack Surface Management Dashboard - PostgreSQL Schema
-- =============================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'analyst', 'viewer');
CREATE TYPE asset_type AS ENUM ('domain', 'subdomain', 'ip', 'service', 'certificate');
CREATE TYPE asset_status AS ENUM ('active', 'inactive', 'retired', 'unknown');
CREATE TYPE risk_level AS ENUM ('critical', 'high', 'medium', 'low', 'info');
CREATE TYPE vuln_status AS ENUM ('open', 'in_progress', 'resolved', 'accepted', 'false_positive');
CREATE TYPE alert_status AS ENUM ('open', 'acknowledged', 'resolved', 'suppressed');
CREATE TYPE domain_status AS ENUM ('approved', 'pending', 'revoked', 'expired');
CREATE TYPE scan_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE change_type AS ENUM (
  'new_domain', 'new_subdomain', 'new_ip', 'new_service',
  'dns_change', 'cert_change', 'new_vulnerability',
  'removed_asset', 'risk_change', 'status_change'
);

-- =====================
-- USERS & ROLES
-- =====================
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(64) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  full_name     VARCHAR(128),
  hashed_password TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'viewer',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================
-- APPROVED DOMAINS
-- =====================
CREATE TABLE approved_domains (
  id              SERIAL PRIMARY KEY,
  domain          VARCHAR(255) UNIQUE NOT NULL,
  owner           VARCHAR(128),
  status          domain_status NOT NULL DEFAULT 'approved',
  approval_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  review_date     DATE,
  notes           TEXT,
  approved_by_id  INTEGER REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_approved_domains_domain ON approved_domains(domain);
CREATE INDEX idx_approved_domains_status ON approved_domains(status);

-- =====================
-- ASSETS
-- =====================
CREATE TABLE assets (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  asset_type      asset_type NOT NULL,
  ip_address      INET,
  domain_id       INTEGER REFERENCES approved_domains(id),
  port            INTEGER,
  protocol        VARCHAR(16),
  service         VARCHAR(128),
  service_version VARCHAR(128),
  technology      VARCHAR(255),
  environment     VARCHAR(64) DEFAULT 'production',
  owner           VARCHAR(128),
  criticality     risk_level NOT NULL DEFAULT 'medium',
  status          asset_status NOT NULL DEFAULT 'active',
  risk_score      DECIMAL(5,2) DEFAULT 0,
  risk_level      risk_level NOT NULL DEFAULT 'low',
  risk_factors    JSONB DEFAULT '[]',
  first_seen      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_ip ON assets(ip_address);
CREATE INDEX idx_assets_domain ON assets(domain_id);
CREATE INDEX idx_assets_risk ON assets(risk_level);
CREATE INDEX idx_assets_status ON assets(status);

-- =====================
-- DNS RECORDS
-- =====================
CREATE TABLE dns_records (
  id          SERIAL PRIMARY KEY,
  domain_id   INTEGER REFERENCES approved_domains(id),
  fqdn        VARCHAR(255) NOT NULL,
  record_type VARCHAR(16) NOT NULL,
  value       TEXT NOT NULL,
  ttl         INTEGER DEFAULT 3600,
  first_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_current  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dns_domain ON dns_records(domain_id);
CREATE INDEX idx_dns_fqdn ON dns_records(fqdn);
CREATE INDEX idx_dns_type ON dns_records(record_type);

-- =====================
-- SSL/TLS CERTIFICATES
-- =====================
CREATE TABLE certificates (
  id              SERIAL PRIMARY KEY,
  asset_id        INTEGER REFERENCES assets(id),
  domain_id       INTEGER REFERENCES approved_domains(id),
  common_name     VARCHAR(255),
  issuer          VARCHAR(512),
  issuer_org      VARCHAR(255),
  subject         VARCHAR(512),
  serial_number   VARCHAR(128),
  fingerprint     VARCHAR(256),
  valid_from      TIMESTAMPTZ,
  valid_to        TIMESTAMPTZ,
  sans            TEXT[],
  key_algorithm   VARCHAR(64),
  key_size        INTEGER,
  signature_algo  VARCHAR(64),
  status          VARCHAR(32) DEFAULT 'valid',
  days_remaining  INTEGER,
  grade           VARCHAR(4),
  first_seen      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_certs_domain ON certificates(domain_id);
CREATE INDEX idx_certs_valid_to ON certificates(valid_to);
CREATE INDEX idx_certs_status ON certificates(status);

-- =====================
-- EXPOSED SERVICES
-- =====================
CREATE TABLE exposed_services (
  id              SERIAL PRIMARY KEY,
  asset_id        INTEGER REFERENCES assets(id),
  ip_address      INET NOT NULL,
  port            INTEGER NOT NULL,
  protocol        VARCHAR(16) NOT NULL DEFAULT 'tcp',
  service_name    VARCHAR(128),
  service_version VARCHAR(255),
  banner          TEXT,
  domain_id       INTEGER REFERENCES approved_domains(id),
  is_new          BOOLEAN NOT NULL DEFAULT TRUE,
  risk_level      risk_level NOT NULL DEFAULT 'low',
  first_seen      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_services_ip ON exposed_services(ip_address);
CREATE INDEX idx_services_port ON exposed_services(port);
CREATE INDEX idx_services_risk ON exposed_services(risk_level);

-- =====================
-- VULNERABILITIES
-- =====================
CREATE TABLE vulnerabilities (
  id              SERIAL PRIMARY KEY,
  cve_id          VARCHAR(32),
  title           VARCHAR(512) NOT NULL,
  description     TEXT,
  asset_id        INTEGER REFERENCES assets(id),
  service_id      INTEGER REFERENCES exposed_services(id),
  severity        risk_level NOT NULL DEFAULT 'medium',
  cvss_score      DECIMAL(4,1),
  cvss_vector     VARCHAR(128),
  status          vuln_status NOT NULL DEFAULT 'open',
  owner           VARCHAR(128),
  detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ,
  remediation     TEXT,
  notes           TEXT,
  plugin_id       VARCHAR(64),
  scan_id         INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_vulns_cve ON vulnerabilities(cve_id);
CREATE INDEX idx_vulns_severity ON vulnerabilities(severity);
CREATE INDEX idx_vulns_status ON vulnerabilities(status);
CREATE INDEX idx_vulns_asset ON vulnerabilities(asset_id);

-- =====================
-- SCANS
-- =====================
CREATE TABLE scans (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  scan_type     VARCHAR(64) NOT NULL DEFAULT 'simulated',
  status        scan_status NOT NULL DEFAULT 'pending',
  domain_id     INTEGER REFERENCES approved_domains(id),
  initiated_by  INTEGER REFERENCES users(id),
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  findings      JSONB DEFAULT '{}',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================
-- ATTACK SURFACE CHANGES
-- =====================
CREATE TABLE surface_changes (
  id            SERIAL PRIMARY KEY,
  change_type   change_type NOT NULL,
  asset_id      INTEGER REFERENCES assets(id),
  domain_id     INTEGER REFERENCES approved_domains(id),
  description   TEXT NOT NULL,
  previous_val  TEXT,
  new_val       TEXT,
  priority      risk_level NOT NULL DEFAULT 'low',
  scan_id       INTEGER REFERENCES scans(id),
  detected_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_changes_type ON surface_changes(change_type);
CREATE INDEX idx_changes_detected ON surface_changes(detected_at);
CREATE INDEX idx_changes_priority ON surface_changes(priority);

-- =====================
-- ALERTS
-- =====================
CREATE TABLE alerts (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(512) NOT NULL,
  description   TEXT,
  alert_type    VARCHAR(64) NOT NULL,
  severity      risk_level NOT NULL DEFAULT 'medium',
  status        alert_status NOT NULL DEFAULT 'open',
  asset_id      INTEGER REFERENCES assets(id),
  domain_id     INTEGER REFERENCES approved_domains(id),
  assigned_to   INTEGER REFERENCES users(id),
  change_id     INTEGER REFERENCES surface_changes(id),
  vuln_id       INTEGER REFERENCES vulnerabilities(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_created ON alerts(created_at);

-- =====================
-- REMEDIATION TASKS
-- =====================
CREATE TABLE remediation_tasks (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(512) NOT NULL,
  description   TEXT,
  vuln_id       INTEGER REFERENCES vulnerabilities(id),
  alert_id      INTEGER REFERENCES alerts(id),
  asset_id      INTEGER REFERENCES assets(id),
  assigned_to   INTEGER REFERENCES users(id),
  status        VARCHAR(32) NOT NULL DEFAULT 'open',
  priority      risk_level NOT NULL DEFAULT 'medium',
  due_date      DATE,
  completed_at  TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================
-- AUDIT LOGS
-- =====================
CREATE TABLE audit_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  action      VARCHAR(128) NOT NULL,
  resource    VARCHAR(128),
  resource_id INTEGER,
  details     JSONB DEFAULT '{}',
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- =====================
-- UPDATE TRIGGERS
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vulns_updated BEFORE UPDATE ON vulnerabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_alerts_updated BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_approved_domains_updated BEFORE UPDATE ON approved_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_remediation_updated BEFORE UPDATE ON remediation_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
