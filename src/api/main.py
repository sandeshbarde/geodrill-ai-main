"""
main.py
=======
FastAPI application entry point for GeoDrill AI.
Provides RESTful APIs for document ingestion, LLM schema extraction, incident correlation,
and Copilot knowledge retrieval.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
import json
import logging
import os
import re
import time
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse, HTMLResponse

from src.api.routes.ocr_routes import router as ocr_router
from src.api.routes.incident_routes import router as incident_router
from src.api.routes.copilot_routes import router as copilot_router
from src.api.routes.wells_routes import router as wells_router
from src.api.routes.ingest_routes import router as ingest_router
from src.api.routes.trajectory_routes import router as trajectory_router
from src.api.routes.telemetry_routes import router as telemetry_router
from src.api.routes.predictive_risk_routes import router as predictive_risk_router
from src.api.routes.alert_routes import router as alert_router
from src.layer4_knowledge_graph.db_service import db_service
from src.layer4_knowledge_graph.vector_store import vector_store
from starlette.concurrency import run_in_threadpool

logger = logging.getLogger(__name__)
_REQUEST_ID = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")


def _validate_configuration() -> None:
    """Validate safe, deployment-facing settings without logging credential values."""
    environment = os.getenv("GEODRILL_ENVIRONMENT", "development").strip().lower()
    if environment not in {"development", "test", "staging", "production"}:
        raise RuntimeError("GEODRILL_ENVIRONMENT must be development, test, staging, or production")
    if environment == "production":
        configured_origins = os.getenv("GEODRILL_CORS_ORIGINS", "").strip()
        if not configured_origins:
            logger.warning("Production CORS origins are not explicitly configured; using defaults")
        for name in ("ANTHROPIC_API_KEY", "GROQ_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY"):
            value = os.getenv(name, "")
            if value.lower().startswith("your_") or value.lower() in {"", "changeme"}:
                logger.warning("Production provider credential %s is not configured", name)


def _check_dependencies() -> dict[str, str]:
    """Run inexpensive dependency probes and return status-only details."""
    checks: dict[str, str] = {}
    try:
        with db_service.get_connection() as connection:
            connection.execute("SELECT 1").fetchone()
        checks["sqlite"] = "ok"
    except Exception:
        checks["sqlite"] = "unavailable"
    try:
        vector_store.collection.count()
        checks["chroma"] = "ok"
    except Exception:
        checks["chroma"] = "unavailable"
    return checks


class RequestLoggingMiddleware:
    """Attach a bounded correlation ID and emit one structured access log per request."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        headers = dict(scope.get("headers", []))
        supplied = headers.get(b"x-request-id", b"").decode("latin-1")
        request_id = supplied if _REQUEST_ID.fullmatch(supplied) else str(uuid4())
        scope.setdefault("state", {})["request_id"] = request_id
        status_code = 500
        started = time.perf_counter()

        async def send_with_id(message):
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
                response_headers = list(message.get("headers", []))
                response_headers.append((b"x-request-id", request_id.encode("ascii")))
                message = dict(message, headers=response_headers)
            await send(message)

        try:
            await self.app(scope, receive, send_with_id)
        finally:
            logger.info(json.dumps({
                "event": "http_request",
                "request_id": request_id,
                "method": scope.get("method"),
                "path": scope.get("path"),
                "status": status_code,
                "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            }, separators=(",", ":")))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler: initializes database tables and resources on startup."""
    _validate_configuration()
    await run_in_threadpool(db_service.init_db)
    yield


app = FastAPI(
    title="GeoDrill AI API",
    description="Agentic Oil & Gas Knowledge System for Drilling Report Extraction and Offset-Well Intelligence",
    version="1.0.0",
    lifespan=lifespan,
)

def _cors_origins() -> list[str]:
    """Read comma-separated browser origins while keeping local defaults."""
    configured = os.getenv("GEODRILL_CORS_ORIGINS", "").strip()
    if not configured:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    origins = [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]
    return origins or ["http://localhost:3000", "http://127.0.0.1:3000"]


def _cors_origin_regex() -> str | None:
    """Permit Vercel preview deployments; custom domains use explicit origins."""
    return os.getenv(
        "GEODRILL_CORS_ORIGIN_REGEX",
        r"^https://[a-zA-Z0-9-]+\.vercel\.app$",
    ).strip() or None


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_origin_regex=_cors_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

# Include route handlers
app.include_router(ocr_router, prefix="/api/v1")
app.include_router(incident_router, prefix="/api/v1")
app.include_router(copilot_router, prefix="/api/v1")
app.include_router(wells_router, prefix="/api/v1")
app.include_router(ingest_router, prefix="/api/v1")
app.include_router(trajectory_router, prefix="/api/v1")
app.include_router(telemetry_router, prefix="/api/v1")
app.include_router(predictive_risk_router, prefix="/api/v1")
app.include_router(alert_router, prefix="/api/v1")


@app.get("/", tags=["System"])
async def root(request: Request):
    """Root endpoint welcoming users and providing direct links to API docs and health."""
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>eRTMAC-NWIS | GeoDrill AI API</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #071018; color: #EAF4FA; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #0E1821; border: 1px solid #26333F; border-radius: 16px; max-width: 640px; width: 100%; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; background: rgba(50, 210, 150, 0.15); border: 1px solid rgba(50, 210, 150, 0.4); color: #32D296; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; font-family: monospace; }
        .badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #32D296; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        h1 { font-size: 24px; font-weight: 700; color: #FFFFFF; margin-bottom: 8px; }
        p { color: #8EA3B3; font-size: 14px; line-height: 1.5; margin-bottom: 24px; }
        .btn-group { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 28px; }
        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .btn-primary { background: #4DA3FF; color: #FFFFFF; box-shadow: 0 4px 12px rgba(77, 163, 255, 0.3); }
        .btn-primary:hover { background: #3D8BE6; transform: translateY(-1px); }
        .btn-secondary { background: #14232E; color: #EAF4FA; border: 1px solid #26333F; }
        .btn-secondary:hover { background: #1C3040; border-color: #4DA3FF; }
        .section-title { font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.05em; color: #8EA3B3; margin-bottom: 12px; font-weight: 600; }
        .endpoints { background: #080F18; border: 1px solid #1A2633; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 12px; }
        .endpoint-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #14232E; }
        .endpoint-row:last-child { border-bottom: none; }
        .method { color: #32D296; font-weight: bold; width: 50px; }
        .path { color: #4DA3FF; text-decoration: none; }
        .desc { color: #8EA3B3; text-align: right; }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge"><span class="badge-dot"></span> Backend API Live</div>
        <h1>GeoDrill AI • eRTMAC-NWIS</h1>
        <p>Nearby Wells Intelligence & Real-Time Offset Correlation API is successfully deployed and running on Render.</p>
        <div class="btn-group">
            <a href="/docs" class="btn btn-primary">📖 Open Interactive Swagger Docs</a>
            <a href="/health" class="btn btn-secondary">🩺 System Health Check</a>
        </div>
        <div class="section-title">Core API Endpoints</div>
        <div class="endpoints">
            <div class="endpoint-row"><span class="method">GET</span><a href="/api/v1/wells/nearby?lat=16.245&lon=82.352&radius_km=10" class="path">/api/v1/wells/nearby</a><span class="desc">Nearby GIS Wells</span></div>
            <div class="endpoint-row"><span class="method">GET</span><a href="/docs#/Copilot" class="path">/api/v1/copilot/search</a><span class="desc">Grounded AI Copilot</span></div>
            <div class="endpoint-row"><span class="method">GET</span><a href="/docs#/Incidents" class="path">/api/v1/incidents/correlate-near</a><span class="desc">Offset Hazards</span></div>
            <div class="endpoint-row"><span class="method">POST</span><a href="/docs#/Telemetry" class="path">/api/v1/telemetry</a><span class="desc">Validated Ingestion</span></div>
            <div class="endpoint-row"><span class="method">POST</span><a href="/docs#/Risk" class="path">/api/v1/predictive-risk</a><span class="desc">Hazard Prediction</span></div>
        </div>
    </div>
</body>
</html>"""
        return HTMLResponse(content=html_content)

    return {
        "app": "GeoDrill AI • eRTMAC-NWIS",
        "version": "1.0.0",
        "status": "online",
        "documentation": "/docs",
        "health": "/health",
        "endpoints": {
            "nearby_wells": "/api/v1/wells/nearby",
            "copilot": "/api/v1/copilot/search",
            "incidents": "/api/v1/incidents/correlate-near",
            "telemetry": "/api/v1/telemetry",
            "predictive_risk": "/api/v1/predictive-risk",
            "alerts": "/api/v1/alerts",
            "ingest": "/api/v1/ingest-document",
        },
    }


@app.get("/health", tags=["System"])
async def health_check():
    """Backward-compatible shallow health endpoint."""
    return {"status": "ok", "app": "GeoDrill AI", "version": "1.0.0"}


@app.get("/health/live", tags=["System"])
@app.get("/livez", tags=["System"], include_in_schema=False)
async def liveness_check():
    """Report whether the process is alive; no dependency calls are made."""
    return {"status": "ok", "app": "GeoDrill AI", "version": "1.0.0"}


@app.get("/health/ready", tags=["System"])
@app.get("/readyz", tags=["System"], include_in_schema=False)
async def readiness_check():
    """Report dependency readiness using status-only, non-sensitive diagnostics."""
    checks = await run_in_threadpool(_check_dependencies)
    ready = all(value == "ok" for value in checks.values())
    payload = {"status": "ok" if ready else "unavailable", "checks": checks}
    if not ready:
        return JSONResponse(status_code=503, content=payload)
    return payload


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=8000, reload=True)
