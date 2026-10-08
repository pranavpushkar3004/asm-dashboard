# 🛡️ Attack Surface Management Dashboard

A full-stack cybersecurity platform for monitoring your organization's external attack surface.  
Built with **React + FastAPI + PostgreSQL**. Suitable for portfolio, GitHub, and live demos.

---

## Features

| Module | Description |
|---|---|
| **Dashboard** | Real-time stats, risk charts, alerts, and change timeline |
| **Assets** | CRUD inventory of domains, subdomains, IPs, services |
| **Approved Domains** | Domain whitelist — only approved domains can be scanned |
| **DNS Records** | A, AAAA, CNAME, MX, NS, TXT tracking with change history |
| **SSL/TLS Certificates** | Expiration monitoring, issuer, SANs, key info |
| **Exposed Services** | Port/service discovery with risk levels |
| **Vulnerabilities** | CVE tracking, CVSS scoring, remediation workflow |
| **Surface Changes** | Timeline of all attack surface mutations |
| **Alerts** | Auto-generated alerts with assignment and resolution |
| **Scan / Import** | Controlled simulated discovery on approved assets |
| **Reports** | Executive summary + CSV export |
| **Audit Logs** | Full action audit trail |
| **Users & Settings** | Role-based access (Admin / Analyst / Viewer) |

---

## Tech Stack

- **Frontend**: React 18, React Router, Recharts, Tailwind CSS, Axios
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0, Passlib/bcrypt, python-jose JWT
- **Database**: PostgreSQL 16
- **Infrastructure**: Docker + Docker Compose

---

## Quick Start (Docker — Recommended)

### 1. Clone & Configure

```bash
git clone <repo>
cd asm-dashboard
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
```

### 2. Start Everything

```bash
docker compose up --build
```

This will:
1. Start PostgreSQL with schema + seed data
2. Start FastAPI backend on port 8000
3. Start React frontend on port 3000

### 3. Access the App

| Service | URL |
|---|---|
| **Frontend** | http://localhost:3000 |
| **API Docs** | http://localhost:8000/api/docs |
| **ReDoc** | http://localhost:8000/api/redoc |

---

## Demo Credentials

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `Admin@123` |
| **Security Analyst** | `analyst` | `Analyst@123` |
| **Viewer** | `viewer` | `Viewer@123` |

---

## Local Development (Without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://asm_user:asm_secret@localhost:5432/asm_db"
export SECRET_KEY="dev-secret-key"

# Run database migrations manually in psql:
# psql -U asm_user -d asm_db -f ../database/migrations/init.sql
# psql -U asm_user -d asm_db -f ../database/seeds/seed.sql

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

---

## Running Tests

### Backend

```bash
cd backend
pip install pytest httpx
pytest tests/ -v
```

### Frontend

```bash
cd frontend
npm test
```

---

## Project Structure

```
asm-dashboard/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # FastAPI app + routes
│       ├── core/
│       │   ├── config.py        # Settings
│       │   └── security.py      # JWT auth, password hashing
│       ├── db/
│       │   └── database.py      # SQLAlchemy engine + session
│       ├── models/
│       │   └── models.py        # ORM models
│       ├── schemas/
│       │   └── schemas.py       # Pydantic request/response models
│       ├── api/routes/          # All REST API endpoints
│       │   ├── auth.py
│       │   ├── dashboard.py
│       │   ├── assets.py
│       │   ├── domains.py
│       │   ├── dns.py
│       │   ├── certificates.py
│       │   ├── services.py
│       │   ├── vulnerabilities.py
│       │   ├── alerts.py
│       │   ├── changes.py
│       │   ├── scans.py
│       │   ├── users.py
│       │   ├── audit.py
│       │   └── reports.py
│       └── services/
│           ├── audit.py         # Audit log helper
│           └── risk.py          # Risk scoring engine
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── App.js               # Router
│       ├── index.js
│       ├── context/
│       │   └── AuthContext.js   # Auth state
│       ├── services/
│       │   └── api.js           # Axios API client
│       ├── utils/
│       │   └── colors.js        # Badge/color helpers
│       ├── components/
│       │   ├── layout/          # Sidebar, Layout
│       │   └── ui/              # Shared UI components
│       └── pages/               # All 13 pages
└── database/
    ├── migrations/
    │   └── init.sql             # Full PostgreSQL schema
    └── seeds/
        └── seed.sql             # Realistic demo data
```

---

## API Reference

Full interactive API docs available at `http://localhost:8000/api/docs` (Swagger UI).

Key endpoints:

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/token` | Login (returns JWT) |
| GET | `/api/auth/me` | Current user info |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET/POST | `/api/assets` | Asset inventory |
| GET/POST | `/api/domains` | Approved domains |
| GET | `/api/dns` | DNS records |
| GET | `/api/certificates` | SSL/TLS certificates |
| GET | `/api/services` | Exposed services |
| GET/PATCH | `/api/vulnerabilities` | Vulnerability management |
| GET/PATCH | `/api/alerts` | Alert management |
| GET | `/api/changes` | Surface change timeline |
| POST | `/api/scans` | Initiate scan (approved only) |
| GET | `/api/reports/executive-summary` | Executive report |
| GET | `/api/audit` | Audit logs |
| GET/POST | `/api/users` | User management |

---

## Security Design

- **JWT authentication** — HS256 signed tokens, configurable expiry
- **bcrypt password hashing** — industry-standard with salt rounds
- **Role-based authorization** — Admin / Analyst / Viewer with enforced permissions
- **Authorized scanning only** — scans strictly limited to `approved` domains
- **Audit logging** — every significant action recorded with user, timestamp, IP
- **Input validation** — Pydantic schema validation on all inputs
- **CORS** — configurable origins, credentials-aware
- **No hardcoded secrets** — all sensitive values via environment variables
- **Parameterized queries** — SQLAlchemy ORM prevents SQL injection
- **No exploitation tools** — purely defensive monitoring platform

---

## Demo Data

Pre-seeded with realistic fictional organizations:

| Domain | Description |
|---|---|
| `example-corp.test` | Primary corporate domain (12 assets) |
| `acme-security.test` | Security product domain (6 assets) |
| `demo-company.test` | Demo/test environment (6 assets) |

Includes: 20+ assets, 25+ DNS records, 8 certificates, 15 exposed services, 20 vulnerabilities (including Log4Shell, Spring4Shell), 15 surface changes, 15 alerts.

---

## License

MIT — free for personal, portfolio, and educational use.
