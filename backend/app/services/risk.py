from app.models.models import Asset, RiskLevel
from decimal import Decimal

RISK_WEIGHTS = {
    "criticality": {"critical": 30, "high": 20, "medium": 10, "low": 5, "info": 0},
    "port_risk": {21: 25, 23: 25, 3389: 30, 3306: 25, 5432: 25, 27017: 25, 6379: 20, 8080: 10, 8443: 5},
}

def compute_risk(asset: Asset) -> None:
    score = 0.0
    factors = []

    crit = (asset.criticality.value if asset.criticality else "medium")
    score += RISK_WEIGHTS["criticality"].get(crit, 10)

    if asset.port:
        port_risk = RISK_WEIGHTS["port_risk"].get(asset.port, 0)
        if port_risk:
            score += port_risk
            factors.append(f"Risky port {asset.port} exposed")

    if asset.service and asset.service.upper() in ("FTP", "TELNET", "RDP"):
        score += 20
        factors.append(f"Insecure protocol: {asset.service}")

    if asset.environment and asset.environment.lower() in ("dev", "development", "staging"):
        score += 5
        factors.append("Non-production environment exposed")

    score = min(score, 100.0)
    asset.risk_score = Decimal(str(round(score, 2)))
    asset.risk_factors = factors

    if score >= 80:
        asset.risk_level = RiskLevel.critical
    elif score >= 60:
        asset.risk_level = RiskLevel.high
    elif score >= 40:
        asset.risk_level = RiskLevel.medium
    elif score >= 20:
        asset.risk_level = RiskLevel.low
    else:
        asset.risk_level = RiskLevel.info
