# --- START OF HOTFIX ---
# This prevents the SecretStr NameError in fastapi-mail on Pydantic V2
import builtins
try:
    from pydantic import SecretStr
    builtins.SecretStr = SecretStr
except ImportError:
    pass
# --- END OF HOTFIX ---

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.config import settings
from db.neon_session import engine, Base
from api.routes_auth import router as auth_router
from api.routes_ussd import router as ussd_router 
from api.routes_dashboard import router as dashboard_router
from api.routes_knowledge import router as knowledge_router
from api.routes_vault import router as vault_router
from core.scheduler import start_reminder_scheduler 

# 1. Initialize Database Tables
# This creates the schema in your NeonDB (PostgreSQL)
Base.metadata.create_all(bind=engine)

# 2. Initialize FastAPI
app = FastAPI(
    title="SME Regulatory Compliance Navigator",
    description="AI-Powered Compliance Management using FastAPI, NeonDB, and MongoDB.",
    version="1.1.0"
)

# 3. Mount Static Files for Document Viewing
# This allows the 'View' button in React to open the PDFs
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 4. Configure CORS
# Crucial so your React frontend at localhost:5173 can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Startup Events: Start the Reminder Engine
@app.on_event("startup")
async def startup_event():
    print("🚀 Starting SME Navigator Services...")
    # This starts the background loop that checks for expiries daily at 8 AM
    start_reminder_scheduler()

# 6. Register All Routers
app.include_router(auth_router, tags=["Authentication"])
app.include_router(dashboard_router, tags=["Dashboard"])
app.include_router(knowledge_router, tags=["Knowledge Base"])
app.include_router(ussd_router, tags=["USSD Service"])
app.include_router(vault_router, tags=["Document Vault"])

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "online",
        "database": "connected",
        "scheduler": "active",
        "message": "SME Navigator API is fully operational for Anga Systems."
    }

@app.get("/", tags=["System"])
def root():
    return {"message": "Welcome to the SME Regulatory Compliance API"}