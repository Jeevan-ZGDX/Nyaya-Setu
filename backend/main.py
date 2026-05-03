"""
main.py - Nyaya-Setu FastAPI application entry point
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db
from routes import upload, process, actions

# ── Logging Configuration ─────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)


# ── Lifespan (startup/shutdown) ───────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Nyaya-Setu backend...")
    init_db()
    os.makedirs("uploads", exist_ok=True)
    logger.info("Database initialized. Upload directory ready.")
    yield
    logger.info("Nyaya-Setu backend shutting down.")


# ── App Init ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Nyaya-Setu API",
    description="Cognitive Compliance Engine — Court Judgment to Action Plan Pipeline",
    version="2.0.0",
    lifespan=lifespan
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080", "http://localhost:8082", "http://localhost:8083"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": str(exc), "data": None}
    )


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(upload.router, tags=["Document Upload"])
app.include_router(process.router, tags=["Processing & Retrieval"])
app.include_router(actions.router, tags=["Actions & HITL"])


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "success",
        "message": "Nyaya-Setu API is running",
        "version": "2.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "success", "message": "OK"}
