import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app with metadata
app = FastAPI(
    title="AI Resume Parser API",
    description="Comprehensive API for parsing, analyzing, and managing resumes with AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]

# Default origins for development
if not origins:
    origins = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok", "service": "ai-resume-parser"}

# Root endpoint
@app.get("/", tags=["root"])
def read_root() -> dict[str, str]:
    """Root endpoint with API information."""
    return {
        "message": "AI Resume Parser API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "cors_origins": origins
    }

# Test endpoint that doesn't require authentication
@app.get("/test", tags=["test"])
def test_endpoint() -> dict[str, str]:
    """Test endpoint to verify server is working."""
    return {
        "message": "Test endpoint working",
        "environment": "development"
    }
