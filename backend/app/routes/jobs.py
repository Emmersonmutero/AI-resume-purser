from typing import Annotated, Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth import require_firebase_user
from app.firestore_client import get_firestore_client

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

# Request/Response Models
class JobCreateRequest(BaseModel):
    title: str
    company: str
    department: str
    description: str
    requirements: List[str]
    location: str
    salary_range: str = ""
    employment_type: str = "full-time"

class JobResponse(BaseModel):
    id: str
    title: str
    company: str
    department: str
    description: str
    requirements: List[str]
    location: str
    salary_range: str
    employment_type: str
    posted_by: str
    posted_at: str
    status: str
    applications_count: int

class JobUpdateRequest(BaseModel):
    title: str = None
    company: str = None
    department: str = None
    description: str = None
    requirements: List[str] = None
    location: str = None
    salary_range: str = None
    employment_type: str = None
    status: str = None

# Routes
@router.post("/", response_model=JobResponse)
async def create_job(
    req: JobCreateRequest,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> JobResponse:
    """Create a new job posting."""
    db = get_firestore_client()
    
    job_data = {
        "title": req.title,
        "company": req.company,
        "department": req.department,
        "description": req.description,
        "requirements": req.requirements,
        "location": req.location,
        "salary_range": req.salary_range,
        "employment_type": req.employment_type,
        "posted_by": user.get("uid"),
        "posted_at": datetime.now().isoformat(),
        "status": "active",
        "applications_count": 0
    }
    
    # Add to Firestore
    doc_ref = db.collection("jobs").add(job_data)
    job_id = doc_ref[1].id
    
    return JobResponse(
        id=job_id,
        **job_data
    )

@router.get("/", response_model=List[JobResponse])
async def list_jobs(
    limit: int = 50,
    department: str = None,
    status: str = "active",
    user: Annotated[dict, Depends(require_firebase_user)] = None
) -> List[JobResponse]:
    """List all job postings with optional filtering."""
    db = get_firestore_client()
    
    # Build query
    query = db.collection("jobs")
    
    if status:
        query = query.where("status", "==", status)
    
    if department:
        query = query.where("department", "==", department)
    
    docs = query.limit(min(limit, 100)).stream()
    
    jobs = []
    for doc in docs:
        data = doc.to_dict()
        if data:
            jobs.append(JobResponse(
                id=doc.id,
                **data
            ))
    
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> JobResponse:
    """Get a specific job by ID."""
    db = get_firestore_client()
    doc_ref = db.collection("jobs").document(job_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    data = doc.to_dict()
    if data is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid document data"
        )
    
    return JobResponse(id=doc.id, **data)

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str,
    req: JobUpdateRequest,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> JobResponse:
    """Update a job posting."""
    db = get_firestore_client()
    doc_ref = db.collection("jobs").document(job_id)
    
    # Check if job exists
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Build update data (only include fields that are not None)
    update_data = {}
    for field, value in req.dict().items():
        if value is not None:
            update_data[field] = value
    
    if update_data:
        update_data["updated_at"] = datetime.now().isoformat()
        doc_ref.update(update_data)
    
    # Return updated job
    updated_doc = doc_ref.get()
    data = updated_doc.to_dict()
    
    return JobResponse(id=job_id, **data)

@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> dict[str, str]:
    """Delete a job posting."""
    db = get_firestore_client()
    doc_ref = db.collection("jobs").document(job_id)
    
    # Check if job exists
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Delete the job
    doc_ref.delete()
    
    return {"message": f"Job {job_id} deleted successfully"}

@router.post("/{job_id}/apply")
async def apply_to_job(
    job_id: str,
    resume_id: str,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> dict[str, Any]:
    """Apply to a job with a resume."""
    db = get_firestore_client()
    
    # Check if job exists
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()
    if not job_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if resume exists
    resume_ref = db.collection("resumes").document(resume_id)
    resume_doc = resume_ref.get()
    if not resume_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Create application
    application_data = {
        "job_id": job_id,
        "resume_id": resume_id,
        "applicant_id": user.get("uid"),
        "applied_at": datetime.now().isoformat(),
        "status": "pending",
        "match_score": resume_doc.to_dict().get("matchScore", 0)
    }
    
    # Add application to Firestore
    app_ref = db.collection("applications").add(application_data)
    application_id = app_ref[1].id
    
    # Update job applications count
    job_data = job_doc.to_dict()
    current_count = job_data.get("applications_count", 0)
    job_ref.update({"applications_count": current_count + 1})
    
    return {
        "application_id": application_id,
        "message": "Application submitted successfully",
        "status": "pending"
    }
