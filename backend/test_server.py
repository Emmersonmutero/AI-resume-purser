import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Create a simple test app
app = FastAPI(title="Test AI Resume Parser Backend")

# CORS setup
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/health")
def health():
    return {"status": "ok", "message": "Server is running"}

@app.get("/test")
def test():
    return {"message": "Test endpoint working", "cors_origins": origins}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
