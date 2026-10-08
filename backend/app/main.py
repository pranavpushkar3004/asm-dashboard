from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, dashboard, assets, domains, dns, certificates, services, vulnerabilities, alerts, changes, scans, users, audit, reports

app = FastAPI(
    title="Attack Surface Management API",
    description="Defensive cybersecurity platform for external attack surface monitoring",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,            prefix="/api/auth",            tags=["Authentication"])
app.include_router(dashboard.router,       prefix="/api/dashboard",       tags=["Dashboard"])
app.include_router(assets.router,          prefix="/api/assets",          tags=["Assets"])
app.include_router(domains.router,         prefix="/api/domains",         tags=["Domains"])
app.include_router(dns.router,             prefix="/api/dns",             tags=["DNS Records"])
app.include_router(certificates.router,   prefix="/api/certificates",    tags=["Certificates"])
app.include_router(services.router,        prefix="/api/services",        tags=["Exposed Services"])
app.include_router(vulnerabilities.router, prefix="/api/vulnerabilities", tags=["Vulnerabilities"])
app.include_router(alerts.router,          prefix="/api/alerts",          tags=["Alerts"])
app.include_router(changes.router,         prefix="/api/changes",         tags=["Surface Changes"])
app.include_router(scans.router,           prefix="/api/scans",           tags=["Scans"])
app.include_router(users.router,           prefix="/api/users",           tags=["Users"])
app.include_router(audit.router,           prefix="/api/audit",           tags=["Audit Logs"])
app.include_router(reports.router,         prefix="/api/reports",         tags=["Reports"])

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ASM Dashboard API"}
