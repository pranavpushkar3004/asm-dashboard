-- =============================================================
-- Attack Surface Management Dashboard - Seed Data
-- =============================================================

-- USERS (passwords: Admin@123, Analyst@123, Viewer@123)
INSERT INTO users (username, email, full_name, hashed_password, role, last_login) VALUES
('admin',   'admin@example-corp.test',   'Alice Admin',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbKEBJuHi', 'admin',   NOW() - INTERVAL '1h'),
('analyst', 'analyst@example-corp.test', 'Bob Analyst',    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'analyst', NOW() - INTERVAL '2h'),
('viewer',  'viewer@example-corp.test',  'Carol Viewer',   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uSxRfHd.6', 'viewer',  NOW() - INTERVAL '1d');

-- APPROVED DOMAINS
INSERT INTO approved_domains (domain, owner, status, approval_date, review_date, notes, approved_by_id) VALUES
('example-corp.test',         'IT Security',  'approved', '2024-01-15', '2025-01-15', 'Primary corporate domain',          1),
('acme-security.test',        'Security Team','approved', '2024-02-01', '2025-02-01', 'Security product domain',           1),
('demo-company.test',         'DevOps',       'approved', '2024-03-10', '2025-03-10', 'Demo/test environment domain',      2),
('staging.example-corp.test', 'DevOps',       'pending',  '2024-11-01', '2025-05-01', 'Staging subdomain, pending review', 1);

-- ASSETS
INSERT INTO assets (name, asset_type, ip_address, domain_id, port, protocol, service, service_version, technology, environment, owner, criticality, status, risk_score, risk_level, first_seen, last_seen) VALUES
('www.example-corp.test',      'subdomain', '192.0.2.10',  1, 443, 'tcp', 'HTTPS',    'nginx/1.24',    'nginx,TLS1.3',     'production', 'IT Security',  'high',     'active', 22.5,  'low',      NOW()-INTERVAL '90d', NOW()-INTERVAL '1h'),
('api.example-corp.test',      'subdomain', '192.0.2.11',  1, 443, 'tcp', 'HTTPS',    'gunicorn/21.2', 'Python,FastAPI',   'production', 'Engineering',  'critical', 'active', 65.0,  'high',     NOW()-INTERVAL '60d', NOW()-INTERVAL '2h'),
('mail.example-corp.test',     'subdomain', '192.0.2.12',  1,  25, 'tcp', 'SMTP',     'Postfix/3.8',   'Postfix',          'production', 'IT Ops',       'high',     'active', 45.0,  'medium',   NOW()-INTERVAL '120d',NOW()-INTERVAL '3h'),
('vpn.example-corp.test',      'subdomain', '192.0.2.13',  1, 1194,'udp', 'OpenVPN',  'OpenVPN/2.6',   'OpenVPN',          'production', 'IT Security',  'critical', 'active', 30.0,  'medium',   NOW()-INTERVAL '180d',NOW()-INTERVAL '4h'),
('dev.example-corp.test',      'subdomain', '192.0.2.14',  1, 8080,'tcp', 'HTTP',     'nginx/1.22',    'nginx',            'development','Engineering',  'medium',   'active', 78.5,  'high',     NOW()-INTERVAL '30d', NOW()-INTERVAL '5h'),
('db.example-corp.test',       'subdomain', '192.0.2.15',  1, 3306,'tcp', 'MySQL',    'MySQL/8.0',     'MySQL',            'production', 'DBA Team',     'critical', 'active', 91.0,  'critical', NOW()-INTERVAL '45d', NOW()-INTERVAL '1h'),
('admin.acme-security.test',   'subdomain', '198.51.100.10',2, 443, 'tcp', 'HTTPS',   'Apache/2.4',    'Apache,PHP/8.1',   'production', 'Security Team','critical', 'active', 55.0,  'high',     NOW()-INTERVAL '75d', NOW()-INTERVAL '2h'),
('api.acme-security.test',     'subdomain', '198.51.100.11',2, 443, 'tcp', 'HTTPS',   'gunicorn/21',   'FastAPI,Redis',    'production', 'Engineering',  'high',     'active', 40.0,  'medium',   NOW()-INTERVAL '50d', NOW()-INTERVAL '3h'),
('ci.acme-security.test',      'subdomain', '198.51.100.12',2, 8443,'tcp', 'HTTPS',   'Jetty/11',      'Jenkins/2.430',    'production', 'DevOps',       'high',     'active', 72.0,  'high',     NOW()-INTERVAL '25d', NOW()-INTERVAL '6h'),
('shop.demo-company.test',     'subdomain', '203.0.113.10', 3, 443, 'tcp', 'HTTPS',   'nginx/1.25',    'nginx,Magento',    'production', 'E-Commerce',   'critical', 'active', 48.0,  'medium',   NOW()-INTERVAL '100d',NOW()-INTERVAL '1h'),
('blog.demo-company.test',     'subdomain', '203.0.113.11', 3, 443, 'tcp', 'HTTPS',   'Apache/2.4',    'WordPress/6.4',    'production', 'Marketing',    'medium',   'active', 60.0,  'high',     NOW()-INTERVAL '80d', NOW()-INTERVAL '2h'),
('legacy.demo-company.test',   'subdomain', '203.0.113.12', 3, 8080,'tcp', 'HTTP',    'Tomcat/9.0',    'Java,Tomcat',      'production', 'IT Ops',       'high',     'active', 88.0,  'critical', NOW()-INTERVAL '365d',NOW()-INTERVAL '1d'),
('192.0.2.20',                 'ip',        '192.0.2.20',  1, NULL, NULL,  NULL,       NULL,            NULL,               'production', 'IT Security',  'medium',   'active', 15.0,  'low',      NOW()-INTERVAL '10d', NOW()-INTERVAL '12h'),
('198.51.100.20',              'ip',        '198.51.100.20',2, NULL, NULL, NULL,       NULL,            NULL,               'production', 'Security Team','medium',   'active', 20.0,  'low',      NOW()-INTERVAL '7d',  NOW()-INTERVAL '6h'),
('ftp.example-corp.test',      'subdomain', '192.0.2.16',  1,  21, 'tcp', 'FTP',      'vsftpd/3.0',    'vsftpd',           'production', 'IT Ops',       'medium',   'active', 82.0,  'critical', NOW()-INTERVAL '200d',NOW()-INTERVAL '2d'),
('rdp.demo-company.test',      'subdomain', '203.0.113.13', 3, 3389,'tcp', 'RDP',     'Windows RDP',   'Windows Server',   'production', 'IT Ops',       'critical', 'active', 95.0,  'critical', NOW()-INTERVAL '15d', NOW()-INTERVAL '3h');

-- DNS RECORDS
INSERT INTO dns_records (domain_id, fqdn, record_type, value, ttl, is_current) VALUES
(1, 'example-corp.test',          'A',     '192.0.2.10',                      3600, true),
(1, 'www.example-corp.test',      'A',     '192.0.2.10',                      3600, true),
(1, 'api.example-corp.test',      'A',     '192.0.2.11',                      3600, true),
(1, 'mail.example-corp.test',     'A',     '192.0.2.12',                      3600, true),
(1, 'vpn.example-corp.test',      'A',     '192.0.2.13',                      3600, true),
(1, 'dev.example-corp.test',      'A',     '192.0.2.14',                      300,  true),
(1, 'db.example-corp.test',       'A',     '192.0.2.15',                      3600, true),
(1, 'example-corp.test',          'MX',    '10 mail.example-corp.test',        3600, true),
(1, 'example-corp.test',          'TXT',   'v=spf1 ip4:192.0.2.0/24 -all',    3600, true),
(1, 'example-corp.test',          'NS',    'ns1.example-corp.test',            86400,true),
(1, 'example-corp.test',          'NS',    'ns2.example-corp.test',            86400,true),
(2, 'acme-security.test',         'A',     '198.51.100.10',                   3600, true),
(2, 'admin.acme-security.test',   'A',     '198.51.100.10',                   3600, true),
(2, 'api.acme-security.test',     'A',     '198.51.100.11',                   3600, true),
(2, 'ci.acme-security.test',      'A',     '198.51.100.12',                   3600, true),
(2, 'acme-security.test',         'MX',    '10 mail.acme-security.test',       3600, true),
(2, 'acme-security.test',         'TXT',   'v=spf1 include:_spf.acme-security.test ~all', 3600, true),
(3, 'demo-company.test',          'A',     '203.0.113.10',                    3600, true),
(3, 'shop.demo-company.test',     'A',     '203.0.113.10',                    3600, true),
(3, 'blog.demo-company.test',     'A',     '203.0.113.11',                    3600, true),
(3, 'legacy.demo-company.test',   'A',     '203.0.113.12',                    3600, true),
(3, 'rdp.demo-company.test',      'A',     '203.0.113.13',                    600,  true),
(3, 'demo-company.test',          'MX',    '10 mail.demo-company.test',        3600, true),
(3, 'demo-company.test',          'TXT',   'v=spf1 ip4:203.0.113.0/24 -all',  3600, true),
(1, 'old.example-corp.test',      'CNAME', 'www.example-corp.test',            3600, false);

-- CERTIFICATES
INSERT INTO certificates (domain_id, common_name, issuer, issuer_org, serial_number, fingerprint, valid_from, valid_to, sans, key_algorithm, key_size, signature_algo, status, days_remaining) VALUES
(1, 'example-corp.test',       'R3, Let''s Encrypt, US',         'Let''s Encrypt',   'A1B2C3D4E5F6',  'SHA256:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99', NOW()-INTERVAL '60d', NOW()+INTERVAL '30d',  ARRAY['example-corp.test','www.example-corp.test','api.example-corp.test'],  'RSA', 2048, 'SHA256withRSA', 'valid',   30),
(1, 'mail.example-corp.test',  'R3, Let''s Encrypt, US',         'Let''s Encrypt',   'B2C3D4E5F6A1',  'SHA256:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA', NOW()-INTERVAL '80d', NOW()+INTERVAL '10d',  ARRAY['mail.example-corp.test'],                                              'RSA', 2048, 'SHA256withRSA', 'expiring',10),
(1, 'vpn.example-corp.test',   'DigiCert Inc',                   'DigiCert',         'C3D4E5F6A1B2',  'SHA256:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB', NOW()-INTERVAL '300d',NOW()+INTERVAL '65d',  ARRAY['vpn.example-corp.test'],                                               'RSA', 4096, 'SHA256withRSA', 'valid',   65),
(2, 'acme-security.test',      'Sectigo RSA DV CA',              'Sectigo',          'D4E5F6A1B2C3',  'SHA256:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC', NOW()-INTERVAL '10d', NOW()+INTERVAL '350d', ARRAY['acme-security.test','admin.acme-security.test','api.acme-security.test'],'RSA', 2048, 'SHA256withRSA', 'valid',   350),
(2, 'ci.acme-security.test',   'DigiCert Inc',                   'DigiCert',         'E5F6A1B2C3D4',  'SHA256:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD', NOW()-INTERVAL '400d',NOW()-INTERVAL '35d',  ARRAY['ci.acme-security.test'],                                               'RSA', 2048, 'SHA256withRSA', 'expired', -35),
(3, 'demo-company.test',       'R3, Let''s Encrypt, US',         'Let''s Encrypt',   'F6A1B2C3D4E5',  'SHA256:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE', NOW()-INTERVAL '30d', NOW()+INTERVAL '60d',  ARRAY['demo-company.test','shop.demo-company.test','blog.demo-company.test'], 'RSA', 2048, 'SHA256withRSA', 'valid',   60),
(3, 'legacy.demo-company.test','Entrust Certification Authority','Entrust',          'A2B3C4D5E6F7',  'SHA256:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF', NOW()-INTERVAL '500d',NOW()+INTERVAL '5d',   ARRAY['legacy.demo-company.test'],                                            'RSA', 2048, 'SHA1withRSA',   'expiring',5),
(1, 'ftp.example-corp.test',   'Expired CA',                     'Old CA Inc',       'B3C4D5E6F7A2',  'SHA256:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00', NOW()-INTERVAL '730d',NOW()-INTERVAL '365d', ARRAY['ftp.example-corp.test'],                                               'RSA', 1024, 'SHA1withRSA',   'expired', -365);

-- EXPOSED SERVICES
INSERT INTO exposed_services (asset_id, ip_address, port, protocol, service_name, service_version, banner, domain_id, is_new, risk_level) VALUES
(1,  '192.0.2.10',   443, 'tcp', 'HTTPS',   'nginx/1.24',     'HTTP/1.1 200 OK Server: nginx/1.24',           1, false, 'low'),
(2,  '192.0.2.11',   443, 'tcp', 'HTTPS',   'gunicorn/21.2',  'HTTP/2 200',                                   1, false, 'low'),
(3,  '192.0.2.12',    25, 'tcp', 'SMTP',    'Postfix/3.8',    '220 mail.example-corp.test ESMTP Postfix',     1, false, 'medium'),
(3,  '192.0.2.12',   587, 'tcp', 'SMTPS',   'Postfix/3.8',    '220 mail.example-corp.test ESMTP Postfix',     1, false, 'low'),
(5,  '192.0.2.14',  8080, 'tcp', 'HTTP',    'nginx/1.22',     'HTTP/1.1 200 OK',                              1, true,  'high'),
(6,  '192.0.2.15',  3306, 'tcp', 'MySQL',   'MySQL/8.0.35',   '8.0.35-MySQL Community Server',                1, false, 'critical'),
(7,  '198.51.100.10',443, 'tcp', 'HTTPS',   'Apache/2.4.58',  'HTTP/1.1 200 OK Server: Apache/2.4.58',        2, false, 'medium'),
(9,  '198.51.100.12',8443,'tcp', 'HTTPS',   'Jetty/11.0',     'HTTP/2 200',                                   2, true,  'medium'),
(10, '203.0.113.10', 443, 'tcp', 'HTTPS',   'nginx/1.25',     'HTTP/1.1 200 OK',                              3, false, 'low'),
(11, '203.0.113.11', 443, 'tcp', 'HTTPS',   'Apache/2.4',     'HTTP/1.1 200 OK Server: Apache',               3, false, 'medium'),
(12, '203.0.113.12',8080, 'tcp', 'HTTP',    'Tomcat/9.0.82',  'HTTP/1.1 200 OK',                              3, false, 'high'),
(15, '192.0.2.16',   21,  'tcp', 'FTP',     'vsftpd/3.0.5',   '220 (vsFTPd 3.0.5)',                           1, false, 'critical'),
(16, '203.0.113.13',3389, 'tcp', 'RDP',     'Windows RDP',    'Windows Remote Desktop Protocol',              3, true,  'critical'),
(2,  '192.0.2.11',  5432, 'tcp', 'PostgreSQL','PostgreSQL 15', 'PostgreSQL 15 on x86_64-linux',               1, true,  'critical'),
(9,  '198.51.100.12',6379,'tcp', 'Redis',   'Redis 7.2',      'Redis server v7.2',                            2, true,  'high');

-- VULNERABILITIES
INSERT INTO vulnerabilities (cve_id, title, description, asset_id, severity, cvss_score, cvss_vector, status, owner, detected_at, remediation) VALUES
('CVE-2021-44228','Log4Shell - Remote Code Execution in Log4j','Apache Log4j2 JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints.', 12, 'critical', 10.0, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', 'open',        'Bob Analyst', NOW()-INTERVAL '30d', 'Upgrade Log4j to 2.17.1 or later. Apply vendor patches immediately.'),
('CVE-2022-22965','Spring4Shell - Spring Framework RCE','A Spring MVC or Spring WebFlux application running on JDK 9+ may be vulnerable to remote code execution via data binding.',                                           12, 'critical', 9.8,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'in_progress', 'Bob Analyst', NOW()-INTERVAL '25d', 'Upgrade to Spring Framework 5.3.18+ or 5.2.20+.'),
('CVE-2023-44487','HTTP/2 Rapid Reset Attack','The HTTP/2 protocol allows a denial of service because request cancellation can reset many streams quickly.',                                                                       1, 'high',     7.5,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H', 'resolved',    'Alice Admin', NOW()-INTERVAL '60d', 'Update nginx to 1.25.3+. Enable rate limiting.'),
('CVE-2023-0464', 'OpenSSL Certificate Verification Vulnerability','Excessive Resource Usage Verifying X.509 Policy Constraints.',                                                                                              4,  'high',     7.5,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H', 'open',        'Bob Analyst', NOW()-INTERVAL '20d', 'Upgrade OpenSSL to 3.0.8+ or 1.1.1t+.'),
('CVE-2023-38408','OpenSSH Remote Code Execution','Remote code execution in OpenSSH ssh-agent via forwarded agent connections.',                                                                                                 4,  'critical', 9.8,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'open',        'Bob Analyst', NOW()-INTERVAL '15d', 'Upgrade OpenSSH to 9.3p2 or later.'),
('CVE-2024-1086', 'Linux Kernel Use-After-Free','Use-after-free vulnerability in the netfilter subsystem.',                                                                                                                     6,  'high',     7.8,  'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', 'open',        'Alice Admin', NOW()-INTERVAL '10d', 'Apply kernel patch or upgrade to patched version.'),
('CVE-2023-46604','Apache ActiveMQ RCE','Remote Code Execution in Apache ActiveMQ via OpenWire protocol.',                                                                                                                       7,  'critical', 10.0, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', 'open',        'Bob Analyst', NOW()-INTERVAL '8d',  'Upgrade to Apache ActiveMQ 5.15.16, 5.16.7, 5.17.6, or 5.18.3.'),
('CVE-2023-36664','Ghostscript RCE','Code execution in Artifex Ghostscript through 10.01.2.',                                                                                                                                   11, 'high',     9.8,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'in_progress', 'Bob Analyst', NOW()-INTERVAL '40d', 'Upgrade Ghostscript to 10.01.3 or later.'),
(NULL,            'MySQL Exposed to Internet','MySQL database port 3306 is publicly accessible from the internet without firewall restrictions.',                                                                                 6,  'critical', 9.0,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'open',        'Alice Admin', NOW()-INTERVAL '5d',  'Restrict MySQL to internal network only. Apply firewall rules immediately.'),
(NULL,            'FTP Unencrypted Protocol','FTP service exposes credentials in cleartext. No TLS encryption.',                                                                                                                 15, 'high',     7.5,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N', 'open',        'Bob Analyst', NOW()-INTERVAL '3d',  'Disable FTP and replace with SFTP/FTPS.'),
(NULL,            'RDP Exposed to Internet','Windows Remote Desktop Protocol (RDP) is publicly accessible, risk of brute force and exploitation.',                                                                               16, 'critical', 9.5,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'open',        'Alice Admin', NOW()-INTERVAL '2d',  'Move RDP behind VPN. Restrict access to authorized IPs only.'),
('CVE-2021-26855','ProxyLogon - Microsoft Exchange SSRF','Server-Side Request Forgery in Microsoft Exchange Server.',                                                                                                            3,  'critical', 9.8,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'resolved',    'Alice Admin', NOW()-INTERVAL '180d','Apply Microsoft Exchange security update KB5000871.'),
('CVE-2023-4863', 'WebP Heap Buffer Overflow','Heap buffer overflow in libwebp in Google Chrome and other applications.',                                                                                                       11, 'high',     8.8,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', 'resolved',    'Bob Analyst', NOW()-INTERVAL '90d', 'Update WordPress and all plugins to latest versions.'),
(NULL,            'Weak SSL/TLS Configuration on Legacy Server','Legacy server uses TLS 1.0/1.1 and weak cipher suites.',                                                                                                       12, 'medium',   5.9,  'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N', 'open',        'Bob Analyst', NOW()-INTERVAL '7d',  'Disable TLS 1.0/1.1. Enforce TLS 1.2+ with strong cipher suites.'),
(NULL,            'Expired SSL Certificate on CI Server','The SSL certificate for ci.acme-security.test expired 35 days ago.',                                                                                                  9,  'medium',   5.3,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L', 'in_progress', 'Bob Analyst', NOW()-INTERVAL '35d', 'Renew SSL certificate immediately. Enable auto-renewal.'),
(NULL,            'HTTP (Unencrypted) Dev Server Exposed','Development server on port 8080 is accessible without HTTPS.',                                                                                                        5,  'medium',   6.5,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N', 'open',        'Bob Analyst', NOW()-INTERVAL '4d',  'Enable HTTPS, restrict to internal network or VPN only.'),
(NULL,            'Redis Unauthenticated Access','Redis instance is accessible without authentication on port 6379.',                                                                                                             9,  'critical', 9.8,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'open',        'Alice Admin', NOW()-INTERVAL '1d',  'Enable Redis AUTH, bind to localhost, or restrict with firewall.'),
(NULL,            'PostgreSQL Exposed to Internet','PostgreSQL port 5432 is publicly accessible.',                                                                                                                               2,  'critical', 9.8,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'open',        'Alice Admin', NOW()-INTERVAL '1d',  'Restrict PostgreSQL to internal network. Apply firewall rules.'),
(NULL,            'Missing Security Headers','Web server does not return security headers (CSP, HSTS, X-Frame-Options).',                                                                                                        10, 'low',      3.1,  'CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:N', 'open',        'Bob Analyst', NOW()-INTERVAL '14d', 'Configure security headers in nginx/Apache configuration.'),
(NULL,            'WordPress Outdated Version','WordPress version 6.4 has known vulnerabilities. Latest is 6.5.x.',                                                                                                              11, 'medium',   5.3,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N', 'in_progress', 'Bob Analyst', NOW()-INTERVAL '21d', 'Update WordPress to latest version. Enable auto-updates.'),
(NULL,            'Jenkins Outdated Version','Jenkins 2.430 has known security vulnerabilities.',                                                                                                                                9,  'high',     7.5,  'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N', 'open',        'Bob Analyst', NOW()-INTERVAL '12d', 'Upgrade Jenkins to latest LTS release.');

-- SCANS
INSERT INTO scans (name, scan_type, status, domain_id, initiated_by, started_at, completed_at, notes) VALUES
('Full Discovery Scan - example-corp.test',  'simulated', 'completed', 1, 2, NOW()-INTERVAL '3d', NOW()-INTERVAL '3d'+INTERVAL '2h', 'Completed full asset discovery'),
('Quick Scan - acme-security.test',          'simulated', 'completed', 2, 2, NOW()-INTERVAL '1d', NOW()-INTERVAL '1d'+INTERVAL '1h', 'Targeted scan on security domain'),
('Scheduled Scan - demo-company.test',       'simulated', 'running',   3, 2, NOW()-INTERVAL '1h', NULL,                              'Automated scheduled discovery scan');

-- SURFACE CHANGES
INSERT INTO surface_changes (change_type, asset_id, domain_id, description, previous_val, new_val, priority, scan_id, detected_at) VALUES
('new_service',    16, 3, 'RDP port 3389 newly exposed on rdp.demo-company.test',             NULL,          '3389/tcp RDP',   'critical', 2, NOW()-INTERVAL '2d'),
('new_service',    NULL,1, 'PostgreSQL port 5432 exposed on api.example-corp.test',            NULL,          '5432/tcp PG',    'critical', 1, NOW()-INTERVAL '1d'),
('new_service',    NULL,2, 'Redis port 6379 exposed on ci.acme-security.test',                 NULL,          '6379/tcp Redis', 'high',     2, NOW()-INTERVAL '1d'),
('new_subdomain',  5,  1, 'New subdomain dev.example-corp.test discovered',                   NULL,          '192.0.2.14',     'medium',   1, NOW()-INTERVAL '30d'),
('dns_change',     NULL,3, 'DNS A record for rdp.demo-company.test added',                    NULL,          '203.0.113.13',   'high',     2, NOW()-INTERVAL '2d'),
('cert_change',    NULL,2, 'Certificate on ci.acme-security.test has expired',                'valid',       'expired',        'high',     2, NOW()-INTERVAL '35d'),
('cert_change',    NULL,1, 'Certificate on mail.example-corp.test expiring in 10 days',       '90 days',     '10 days',        'high',     1, NOW()-INTERVAL '5d'),
('new_vulnerability',6, 1, 'Critical: MySQL 3306 exposed to internet on db.example-corp.test',NULL,          'CVSS 9.0',       'critical', 1, NOW()-INTERVAL '5d'),
('risk_change',    12, 3, 'Risk score increased for legacy.demo-company.test',                '60.0',        '88.0',           'high',     2, NOW()-INTERVAL '7d'),
('new_service',    5,  1, 'HTTP port 8080 exposed on dev server without encryption',          NULL,          '8080/tcp HTTP',  'medium',   1, NOW()-INTERVAL '30d'),
('new_vulnerability',16,3, 'Critical: RDP exposed to internet on rdp.demo-company.test',      NULL,          'CVSS 9.5',       'critical', 2, NOW()-INTERVAL '2d'),
('removed_asset',  NULL,1, 'Old CNAME record old.example-corp.test marked inactive',          'CNAME active','inactive',       'low',      1, NOW()-INTERVAL '3d'),
('dns_change',     NULL,1, 'TTL reduced from 3600 to 300 for dev.example-corp.test',          '3600',        '300',            'low',      1, NOW()-INTERVAL '3d'),
('new_subdomain',  9,  2, 'Jenkins CI server ci.acme-security.test discovered',               NULL,          '198.51.100.12',  'medium',   2, NOW()-INTERVAL '25d'),
('cert_change',    NULL,3, 'Expiring certificate on legacy.demo-company.test: 5 days left',   '30 days',     '5 days',         'critical', 2, NOW()-INTERVAL '1d');

-- ALERTS
INSERT INTO alerts (title, description, alert_type, severity, status, asset_id, domain_id, assigned_to, change_id, vuln_id, created_at) VALUES
('CRITICAL: RDP Exposed to Internet',             'RDP port 3389 on rdp.demo-company.test is publicly accessible. Immediate action required.', 'exposed_service',       'critical','open',         16, 3, 2, 1,  11, NOW()-INTERVAL '2d'),
('CRITICAL: MySQL Database Exposed',              'MySQL port 3306 on db.example-corp.test is accessible from the internet.',                  'exposed_service',       'critical','open',         6,  1, 1, 2,  9,  NOW()-INTERVAL '5d'),
('CRITICAL: Redis Unauthenticated Access',        'Redis on ci.acme-security.test is accessible without authentication.',                       'exposed_service',       'critical','acknowledged', 9,  2, 2, 3,  17, NOW()-INTERVAL '1d'),
('CRITICAL: PostgreSQL Exposed to Internet',      'PostgreSQL port 5432 on api.example-corp.test is publicly accessible.',                     'exposed_service',       'critical','open',         2,  1, 1, 2,  18, NOW()-INTERVAL '1d'),
('HIGH: Log4Shell Vulnerability Detected',        'CVE-2021-44228 detected on legacy.demo-company.test. CVSS 10.0.',                           'critical_vulnerability','critical','open',         12, 3, 2, NULL,1,  NOW()-INTERVAL '30d'),
('HIGH: SSL Certificate Expiring in 10 Days',     'Certificate for mail.example-corp.test expires in 10 days.',                                'cert_expiration',       'high',    'acknowledged', NULL,1, 2, 7,  NULL,NOW()-INTERVAL '5d'),
('HIGH: Expired SSL Certificate on CI Server',    'SSL certificate for ci.acme-security.test expired 35 days ago.',                            'cert_expiration',       'high',    'open',         9,  2, 2, 6,  15, NOW()-INTERVAL '35d'),
('CRITICAL: Legacy Cert Expiring in 5 Days',      'SSL certificate for legacy.demo-company.test expires in 5 days.',                           'cert_expiration',       'critical','open',         12, 3, 1, 15, NULL,NOW()-INTERVAL '1d'),
('HIGH: FTP Unencrypted Protocol Exposed',        'FTP on ftp.example-corp.test exposes credentials in cleartext.',                            'exposed_service',       'high',    'open',         15, 1, 2, NULL,10, NOW()-INTERVAL '3d'),
('HIGH: OpenSSH RCE Vulnerability',               'CVE-2023-38408 on vpn.example-corp.test allows remote code execution.',                     'critical_vulnerability','critical','open',         4,  1, 2, NULL,5,  NOW()-INTERVAL '15d'),
('MEDIUM: New Dev Subdomain Discovered',          'New asset dev.example-corp.test with HTTP on 8080 discovered.',                             'new_asset',             'medium',  'resolved',     5,  1, 2, 4,  NULL,NOW()-INTERVAL '30d'),
('MEDIUM: Jenkins Version Outdated',              'Jenkins 2.430 on ci.acme-security.test has known vulnerabilities.',                         'critical_vulnerability','high',    'open',         9,  2, 2, NULL,20, NOW()-INTERVAL '12d'),
('HIGH: DNS Record Added for RDP Server',         'New DNS A record for rdp.demo-company.test pointing to 203.0.113.13.',                      'dns_change',            'high',    'open',         NULL,3, 2, 5,  NULL,NOW()-INTERVAL '2d'),
('MEDIUM: Risk Score Spike on Legacy Server',     'Risk score for legacy.demo-company.test increased from 60 to 88.',                          'risk_increase',         'high',    'acknowledged', 12, 3, 2, 9,  NULL,NOW()-INTERVAL '7d'),
('LOW: Unencrypted HTTP on Dev Server',           'Port 8080 is serving HTTP without HTTPS on dev.example-corp.test.',                         'exposed_service',       'medium',  'open',         5,  1, 2, 10, 16, NOW()-INTERVAL '4d');

-- REMEDIATION TASKS
INSERT INTO remediation_tasks (title, vuln_id, alert_id, asset_id, assigned_to, status, priority, due_date, notes) VALUES
('Firewall RDP port 3389 immediately',            11, 1,  16, 2, 'open',        'critical', CURRENT_DATE + 1,  'Block at perimeter firewall and move behind VPN'),
('Firewall MySQL port 3306 from internet',         9, 2,  6,  1, 'in_progress', 'critical', CURRENT_DATE + 1,  'Apply iptables rule. Whitelist only internal IPs'),
('Renew certificate for mail.example-corp.test',  NULL,6, NULL,2,'in_progress', 'high',     CURRENT_DATE + 5,  'Use certbot to renew Let''s Encrypt cert'),
('Renew/replace expired CI server certificate',   15, 7,  9,  2, 'open',        'high',     CURRENT_DATE + 2,  'Certificate expired. Urgent renewal needed'),
('Upgrade Log4j on legacy server',                 1, 5,  12, 2, 'open',        'critical', CURRENT_DATE + 3,  'Upgrade Log4j to 2.17.1. Verify no other Java apps affected'),
('Secure Redis with authentication',              17, 3,  9,  2, 'open',        'critical', CURRENT_DATE + 2,  'Enable requirepass in redis.conf, restrict binding'),
('Disable FTP, enable SFTP',                      10, 9,  15, 1, 'open',        'high',     CURRENT_DATE + 7,  'Replace vsftpd with OpenSSH SFTP subsystem'),
('Patch OpenSSH CVE-2023-38408',                   5, 10, 4,  2, 'open',        'critical', CURRENT_DATE + 3,  'Upgrade OpenSSH to 9.3p2 on vpn server');

-- AUDIT LOGS
INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address) VALUES
(1, 'login',             'user',            1, '{"method":"password","success":true}',                         '192.168.1.100'),
(2, 'login',             'user',            2, '{"method":"password","success":true}',                         '192.168.1.101'),
(3, 'login',             'user',            3, '{"method":"password","success":true}',                         '192.168.1.102'),
(1, 'create',            'approved_domain', 1, '{"domain":"example-corp.test","status":"approved"}',           '192.168.1.100'),
(1, 'create',            'approved_domain', 2, '{"domain":"acme-security.test","status":"approved"}',          '192.168.1.100'),
(2, 'scan_initiated',    'scan',            1, '{"domain":"example-corp.test","scan_type":"simulated"}',        '192.168.1.101'),
(2, 'scan_completed',    'scan',            1, '{"assets_found":12,"vulns_found":8}',                          '192.168.1.101'),
(2, 'scan_initiated',    'scan',            2, '{"domain":"acme-security.test","scan_type":"simulated"}',       '192.168.1.101'),
(2, 'scan_completed',    'scan',            2, '{"assets_found":6,"vulns_found":5}',                           '192.168.1.101'),
(1, 'update',            'vulnerability',   3, '{"status":"open->resolved","cve":"CVE-2023-44487"}',           '192.168.1.100'),
(2, 'create',            'alert',           1, '{"title":"RDP Exposed","severity":"critical"}',                '192.168.1.101'),
(1, 'acknowledge',       'alert',           3, '{"alert":"Redis Unauthenticated Access"}',                     '192.168.1.100'),
(2, 'update',            'vulnerability',   2, '{"status":"open->in_progress","cve":"CVE-2022-22965"}',        '192.168.1.101'),
(1, 'create',            'remediation',     1, '{"title":"Firewall RDP port 3389","priority":"critical"}',     '192.168.1.100'),
(2, 'report_generated',  'report',          NULL,'{"type":"executive_summary","format":"pdf"}',                '192.168.1.101'),
(3, 'view',              'asset',           6, '{"asset":"db.example-corp.test"}',                             '192.168.1.102'),
(2, 'update',            'asset',           12, '{"risk_score":"60->88","risk_level":"high->critical"}',       '192.168.1.101'),
(1, 'create',            'user',            3, '{"username":"viewer","role":"viewer"}',                        '192.168.1.100'),
(2, 'scan_initiated',    'scan',            3, '{"domain":"demo-company.test","scan_type":"simulated"}',       '192.168.1.101'),
(1, 'login',             'user',            1, '{"method":"password","success":true}',                         '10.0.0.1');
