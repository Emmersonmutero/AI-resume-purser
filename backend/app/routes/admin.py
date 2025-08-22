from typing import Annotated, Any, cast
import os
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import numpy as np

from app.auth import require_firebase_user
from app.firestore_client import get_firestore_client
from app.groq_client import ResumeData
from app.embeddings import embed_texts

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Response Models
class ReindexResponse(BaseModel):
    updated: list[str]
    errors: list[str]
    total_processed: int

class SystemStatusResponse(BaseModel):
    status: str
    database_connected: bool
    embeddings_available: bool
    total_resumes: int
    total_users: int
    system_version: str

# Helper Functions
def _resume_text_blob(resume: ResumeData) -> str:
    """Convert a parsed resume into a text blob for text search."""
    parts: list[str] = []
        
    # Add contact info
    contact = resume.get("contact", {})
    if contact:
        parts.extend(filter(None, [
            contact.get("fullName", ""),
            contact.get("location", "")
        ]))
    
    # Add summary if present
    summary = resume.get("summary", "")
    if summary:
        parts.append(str(summary))
        
    # Add skills list if present
    skills = resume.get("skills", [])
    if skills and isinstance(skills, list):
        parts.extend(str(s) for s in skills if s)
        
    # Add experience entries
    experience = resume.get("experience", [])
    if experience and isinstance(experience, list):
        for exp in experience:
            parts.extend(filter(None, [
                exp.get("title", ""),
                exp.get("company", ""),
                exp.get("location", "")
            ]))
            # Add bullet points if present
            bullets = exp.get("bullets", [])
            if bullets and isinstance(bullets, list):
                parts.extend(str(b) for b in bullets if b)
                
    # Add education entries
    education = resume.get("education", [])
    if education and isinstance(education, list):
        for edu in education:
            parts.extend(filter(None, [
                edu.get("degree", ""),
                edu.get("field", ""),
                edu.get("school", "")
            ]))
                
    return "\n".join(p for p in parts if p.strip())

def _check_admin_access(user: dict[str, Any]) -> bool:
    """Check if user has admin access."""
    # Check environment variable for admin email
    allowed_email = os.getenv("ALLOW_ADMIN_EMAIL", "").lower()
    user_email = str(user.get("email", "")).lower()
    is_admin_flag = bool(user.get("admin"))
    
    return is_admin_flag or (allowed_email and user_email == allowed_email)

# Routes
@router.post("/reindex-all", response_model=ReindexResponse)
async def reindex_all_resumes(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> ReindexResponse:
    """Reindex all resumes in the database. Only accessible to admins."""
    # Check authorization
    if not _check_admin_access(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get all resume documents
    db = get_firestore_client()
    resumes = db.collection("resumes").limit(2000).stream()
    updated_ids: list[str] = []
    errors: list[str] = []
    
    # Process each resume
    for doc in resumes:
        try:
            data = doc.to_dict()
            if data is None:
                continue
                
            # Try to get parsed data from either field
            parsed_llm = cast(ResumeData | None, data.get("parsed_llm"))
            parsed_base = cast(ResumeData | None, data.get("parsed"))
            parsed_data = parsed_llm or parsed_base
            
            if not parsed_data:
                continue
                
            parsed = cast(ResumeData, parsed_data)
            blob = _resume_text_blob(parsed)
            raw_vec = embed_texts([blob])[0]
            vec_array = np.array(raw_vec, dtype=np.float32)
            
            # Update document with embedding
            doc_ref = doc.reference
            doc_ref.update({
                "text_blob": blob,
                "embedding": vec_array.tolist()
            })
            updated_ids.append(doc.id)
            
        except Exception as e:
            errors.append(f"{doc.id}: {str(e)}")
            
    return ReindexResponse(
        updated=updated_ids,
        errors=errors,
        total_processed=len(updated_ids) + len(errors)
    )

@router.get("/system-status", response_model=SystemStatusResponse)
async def get_system_status(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> SystemStatusResponse:
    """Get system status and health metrics. Admin only."""
    if not _check_admin_access(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    db = get_firestore_client()
    
    try:
        # Test database connection
        resumes_count = len(list(db.collection("resumes").limit(1).stream()))
        database_connected = True
    except Exception:
        database_connected = False
        resumes_count = 0
    
    try:
        # Test embeddings service
        embed_texts(["test"])
        embeddings_available = True
    except Exception:
        embeddings_available = False
    
    # Get counts
    try:
        total_resumes = len(list(db.collection("resumes").stream()))
        total_users = len(list(db.collection("users").stream()))
    except Exception:
        total_resumes = 0
        total_users = 0
    
    # Determine overall status
    overall_status = "healthy"
    if not database_connected:
        overall_status = "database_error"
    elif not embeddings_available:
        overall_status = "embeddings_error"
    
    return SystemStatusResponse(
        status=overall_status,
        database_connected=database_connected,
        embeddings_available=embeddings_available,
        total_resumes=total_resumes,
        total_users=total_users,
        system_version="1.0.0"
    )

@router.post("/cleanup-data")
async def cleanup_data(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> dict[str, Any]:
    """Clean up orphaned or incomplete data. Admin only."""
    if not _check_admin_access(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    db = get_firestore_client()
    
    # Find resumes without parsed data
    resumes_without_parsed = []
    resumes_without_embeddings = []
    
    for doc in db.collection("resumes").stream():
        data = doc.to_dict() or {}
        
        if not (data.get("parsed") or data.get("parsed_llm")):
            resumes_without_parsed.append(doc.id)
        
        if not data.get("embedding"):
            resumes_without_embeddings.append(doc.id)
    
    return {
        "resumes_without_parsed": len(resumes_without_parsed),
        "resumes_without_embeddings": len(resumes_without_embeddings),
        "cleanup_suggestions": {
            "reindex_needed": len(resumes_without_embeddings),
            "reparse_needed": len(resumes_without_parsed)
        }
    }

@router.delete("/purge-test-data")
async def purge_test_data(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> dict[str, Any]:
    """Purge test data from the system. Admin only - use with caution."""
    if not _check_admin_access(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    db = get_firestore_client()
    
    # Find test resumes (those with "test" in filename)
    test_resumes = []
    for doc in db.collection("resumes").stream():
        data = doc.to_dict() or {}
        filename = data.get("fileName", "").lower()
        
        if "test" in filename or "sample" in filename:
            test_resumes.append(doc.id)
            doc.reference.delete()
    
    return {
        "purged_test_resumes": len(test_resumes),
        "message": f"Deleted {len(test_resumes)} test resumes"
    }
