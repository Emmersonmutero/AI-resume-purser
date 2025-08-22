from typing import Annotated, Any, cast
import os
from math import isfinite
from datetime import datetime
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel

from app.auth import require_firebase_user
from app.firestore_client import get_firestore_client
from app.groq_client import call_llm, ResumeData
from app.embeddings import embed_texts

router = APIRouter(prefix="/api", tags=["resumes"])

# Request/Response Models
class GroqParseRequest(BaseModel):
    resumeText: str

class GroqParseResponse(BaseModel):
    parsed: dict[str, Any]

class IndexResumeRequest(BaseModel):
    resumeId: str 
    parsed: dict[str, Any] | None = None

class SearchResponse(BaseModel):
    results: list[dict[str, Any]]
    total: int
    query: str

class UploadResponse(BaseModel):
    resumeId: str
    fileName: str
    message: str

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

# Routes
@router.post("/parse", response_model=GroqParseResponse)
async def parse_resume_groq(
    req: GroqParseRequest,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> GroqParseResponse:
    """Parse a resume using Groq LLM and return structured data."""
    try:
        parsed = call_llm(req.resumeText)
        return GroqParseResponse(parsed=parsed)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Groq parsing failed: {str(e)}"
        )

@router.post("/parse-resume", response_model=UploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    job_description: str = Form(""),
    user: Annotated[dict, Depends(require_firebase_user)] = None
) -> UploadResponse:
    """Upload a resume file, parse it with AI, and store structured data."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name is required"
        )
    
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.txt']
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # Extract text from file
        from app.parsing import bytes_to_text, parse_resume_content, calculate_match_score
        
        # Convert file extension format
        ext_map = {'.pdf': 'pdf', '.docx': 'docx', '.txt': 'txt'}
        ext = ext_map[file_ext]
        
        # Extract text
        resume_text = bytes_to_text(content, ext)
        
        if not resume_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract text from file"
            )
        
        # Parse resume with AI
        parsed_data = parse_resume_content(resume_text)
        
        # Calculate match score
        match_score = calculate_match_score(parsed_data, job_description)
        
        # Store in Firestore
        db = get_firestore_client()
        
        resume_doc = {
            "fileName": file.filename,
            "uid": user.get("uid") if user else "anonymous",
            "uploadedAt": datetime.now().isoformat(),
            "rawText": resume_text,
            "parsedResume": parsed_data,
            "matchScore": match_score,
            "jobDescription": job_description,
            "isNew": True,
            "fileSize": len(content),
            "fileType": file_ext
        }
        
        # Add to Firestore
        doc_ref = db.collection("resumes").add(resume_doc)
        resume_id = doc_ref[1].id
        
        return UploadResponse(
            resumeId=resume_id,
            fileName=file.filename,
            message="Resume uploaded and parsed successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process resume: {str(e)}"
        )

@router.post("/index")
async def index_resume(
    req: IndexResumeRequest,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> dict[str, Any]:
    """Index a resume's parsed data for text search."""
    db = get_firestore_client()
    doc_ref = db.collection("resumes").document(req.resumeId)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
        
    data = doc.to_dict()
    if data is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid document data"
        )
        
    # Use provided parsed data or build from document fields
    parsed_base = cast(dict[str, Any], data.get("parsed", {}))
    parsed = cast(dict[str, Any], req.parsed if req.parsed is not None else parsed_base)
    
    # Create search blob from parsed resume
    resume_data: ResumeData = {
        "contact": parsed.get("contact", {}),
        "summary": parsed.get("summary", ""),
        "skills": parsed.get("skills", []),
        "experience": parsed.get("experience", []),
        "education": parsed.get("education", []),
        "certifications": parsed.get("certifications", []),
        "languages": parsed.get("languages", [])
    }
    blob = _resume_text_blob(resume_data)
    
    # Generate embeddings for text search
    raw_vec = embed_texts([blob])[0]
    vec_array = np.array(raw_vec, dtype=np.float32)
    vec_list = vec_array.tolist()
    
    # Update the document with parsed data and embeddings
    result_data: dict[str, Any] = {
        "parsed": parsed,
        "text_blob": blob,
        "embedding": vec_list,
    }
    
    # Update Firestore document
    doc_ref.update(result_data)
    return result_data

@router.get("/search", response_model=SearchResponse)
async def search_resumes(
    q: str, 
    top_k: int = 20, 
    user: Annotated[dict, Depends(require_firebase_user)] = None
) -> SearchResponse:
    """Perform semantic search on indexed resumes."""
    query_vec = np.array(embed_texts([q])[0], dtype="float32")
    db = get_firestore_client()
    items = []

    docs = db.collection("resumes").limit(1500).stream()
    for d in docs:
        x = d.to_dict()
        emb = x.get("embedding")
        if not emb or not isinstance(emb, list) or not emb:
            continue
        v = np.array(emb, dtype="float32")
        sim = float(np.dot(query_vec, v))
        if isfinite(sim):
            items.append({
                "id": d.id,
                "fileName": x.get("fileName"),
                "uid": x.get("uid"),
                "url": x.get("url"),
                "matchScore": x.get("matchScore"),
                "skills": (x.get("parsed_llm") or x.get("parsed") or {}).get("skills", []),
                "sim": sim
            })

    items.sort(key=lambda r: r["sim"], reverse=True)
    results = items[:max(1, min(top_k, 50))]
    
    return SearchResponse(
        results=results,
        total=len(results),
        query=q
    )

@router.get("/parsed-data/{resume_id}")
async def get_resume(
    resume_id: str,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> dict[str, Any]:
    """Get a specific resume by ID."""
    db = get_firestore_client()
    doc_ref = db.collection("resumes").document(resume_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    data = doc.to_dict()
    if data is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid document data"
        )
    
    return {"id": doc.id, **data}

@router.get("/")
async def list_resumes(
    limit: int = 50,
    user: Annotated[dict, Depends(require_firebase_user)] = None
) -> dict[str, Any]:
    """List all resumes with pagination."""
    db = get_firestore_client()
    docs = db.collection("resumes").limit(min(limit, 100)).stream()
    
    resumes = []
    for doc in docs:
        data = doc.to_dict()
        if data:
            resumes.append({"id": doc.id, **data})
    
    return {
        "resumes": resumes,
        "total": len(resumes)
    }

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> dict[str, str]:
    """Delete a resume by ID."""
    db = get_firestore_client()
    doc_ref = db.collection("resumes").document(resume_id)
    
    # Check if document exists
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Delete the document
    doc_ref.delete()
    
    return {"message": f"Resume {resume_id} deleted successfully"}
