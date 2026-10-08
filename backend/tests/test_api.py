import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_login_invalid():
    response = client.post("/api/auth/token", data={"username": "nobody", "password": "wrong"})
    assert response.status_code == 401

def test_protected_without_token():
    response = client.get("/api/assets")
    assert response.status_code == 401
