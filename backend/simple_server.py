from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="AI Resume Parser API - Simple Mode",
    description="Basic API for testing frontend connectivity",
    version="1.0.0"
)

# CORS setup for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-resume-parser-simple"}

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "AI Resume Parser API - Simple Mode",
        "version": "1.0.0",
        "status": "running"
    }

# Mock user endpoints for testing
@app.get("/api/users/profile")
def get_user_profile():
    return {
        "uid": "mock-user-123",
        "email": "test@example.com",
        "displayName": "Test User",
        "role": "hr"
    }

# Mock analytics endpoint
@app.get("/api/analytics/stats")
def get_analytics():
    return {
        "totalApplications": 47,
        "activeJobs": 5,
        "interviewsScheduled": 12,
        "avgMatchScore": 78
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
