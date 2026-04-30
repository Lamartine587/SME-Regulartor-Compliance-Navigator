import os
import builtins
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# --- PYDANTIC V2 HOTFIX ---
try:
    from pydantic import SecretStr
    builtins.SecretStr = SecretStr
except ImportError:
    pass
# --------------------------

from core.error_logger import setup_error_handlers
from core.config import settings
from db.neon_session import engine, Base
from core.scheduler import start_reminder_scheduler 

from api.routes_auth import router as auth_router
from api.routes_dashboard import router as dashboard_router
from api.routes_knowledge import router as knowledge_router
from api.routes_vault import router as vault_router
from api.routes_profile import router as profile_router
from api.admin import router as admin_router 
from api.routes_notifications import router as notifications_router 

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting SME Navigator Services...")
    # Initialize NeonDB Tables on startup
    Base.metadata.create_all(bind=engine)
    os.makedirs("uploads", exist_ok=True)
    start_reminder_scheduler()
    yield 
    print("🛑 Shutting down SME Navigator Services...")

app = FastAPI(
    title="SME Regulatory Compliance Navigator",
    description="AI-Powered Compliance Management using FastAPI, NeonDB, and MongoDB.",
    version="1.1.0",
    lifespan=lifespan
)

# 1. CORS MIDDLEWARE (Must be added BEFORE other custom middlewares to handle preflights correctly)
# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    # Add your specific ngrok URL here (use https!)
    "https://warner-nonexhortatory-marybeth.ngrok-free.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. CUSTOM SECURITY MIDDLEWARE
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    # This header prevents the Google Auth popup from being blocked
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response

# 3. ERROR LOGGING
setup_error_handlers(app) 

# Mount Static Files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register Routers
routers = [
    (auth_router, "Authentication"),
    (profile_router, "Profile"),
    (dashboard_router, "Dashboard"),
    (knowledge_router, "Knowledge Base"),
    (vault_router, "Document Vault"),
    (notifications_router, "Notifications"),
    (admin_router, "Admin") 
]

for router, tag in routers:
    app.include_router(router, tags=[tag])

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "online",
        "database": "connected",
        "scheduler": "active",
        "message": "SME Navigator API is fully operational."
    }

@app.get("/", tags=["System"])
def root():
    return {"message": "Welcome to the SME Regulatory Compliance API"}