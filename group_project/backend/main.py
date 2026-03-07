from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import your database configurations and routers based on your specific tree structure
from db.neon_session import engine, Base
from api.routes_auth import router as auth_router

# 1. Automatically create the NeonDB tables on startup
# (If the 'users' table doesn't exist yet, SQLAlchemy will create it now)
Base.metadata.create_all(bind=engine)

# 2. Initialize the FastAPI Application
app = FastAPI(
    title="Group Project Auth API",
    description="Modular API using FastAPI, NeonDB (PostgreSQL), and MongoDB.",
    version="1.0.0"
)

# 3. Configure CORS (Crucial for React integration)
# This tells the backend to accept requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development. In production, change to ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Register the Authentication Router
app.include_router(auth_router)

# 5. Root Health Check Endpoint
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "message": "The API is running successfully. Ready for frontend connections!"
    }

# Add this near your other imports
from api import routes_ussd
from api.routes_dashboard import router as dashboard_router
from api.routes_knowledge import router as knowledge_router
from api.routes_vault import router as vault_router

# Add this where you include your other routers
app.include_router(routes_ussd.router)
app.include_router(dashboard_router)
app.include_router(knowledge_router)
app.include_router(vault_router)