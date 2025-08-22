from typing import Annotated, Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Form
from pydantic import BaseModel

from app.auth import require_firebase_user
from app.firestore_client import get_firestore_client

router = APIRouter(prefix="/api/applications", tags=["applications"])

# Request/Response Models
class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    resume_id: str
    applicant_id: str
    applicant_name: str = ""
    job_title: str
    company: str
    applied_at: str
    status: str
    match_score: int
    interview_scheduled: bool = False
    interview_date: Optional[str] = None
    notes: str = ""

class ApplicationUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    interview_date: Optional[str] = None
    interview_scheduled: Optional[bool] = None

class ApplicationStatsResponse(BaseModel):
    total_applications: int
    pending_applications: int
    reviewed_applications: int
    rejected_applications: int
    interview_scheduled: int
    hired_candidates: int

# Routes
@router.post("/{job_id}/apply")
async def apply_to_job(
    job_id: str,
    resume_id: str = Form(...),
    user: Annotated[dict, Depends(require_firebase_user)] = None
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
    
    # Check if user has already applied
    existing_apps = db.collection("applications").where("job_id", "==", job_id).where("applicant_id", "==", user.get("uid")).stream()
    if any(existing_apps):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )
    
    # Get additional data
    job_data = job_doc.to_dict()
    resume_data = resume_doc.to_dict()
    
    # Create application
    application_data = {
        "job_id": job_id,
        "resume_id": resume_id,
        "applicant_id": user.get("uid"),
        "applicant_name": resume_data.get("parsedResume", {}).get("contact", {}).get("fullName", "Unknown"),
        "job_title": job_data.get("title", ""),
        "company": job_data.get("company", ""),
        "applied_at": datetime.now().isoformat(),
        "status": "pending",
        "match_score": resume_data.get("matchScore", 0),
        "interview_scheduled": False,
        "interview_date": None,
        "notes": "",
        "hr_notified": False
    }
    
    # Add application to Firestore
    app_ref = db.collection("applications").add(application_data)
    application_id = app_ref[1].id
    
    # Update job applications count
    current_count = job_data.get("applications_count", 0)
    job_ref.update({"applications_count": current_count + 1})
    
    # Create notification for HR
    notification_data = {
        "type": "new_application",
        "title": "New Job Application",
        "message": f"New application received for {job_data.get('title')} position",
        "recipient_id": job_data.get("posted_by"),
        "data": {
            "job_id": job_id,
            "application_id": application_id,
            "applicant_name": application_data["applicant_name"]
        },
        "created_at": datetime.now().isoformat(),
        "read": False
    }
    
    db.collection("notifications").add(notification_data)
    
    return {
        "application_id": application_id,
        "message": "Application submitted successfully",
        "status": "pending"
    }

@router.get("/", response_model=List[ApplicationResponse])
async def list_applications(
    limit: int = 50,
    job_id: Optional[str] = None,
    status: Optional[str] = None,
    user: Annotated[dict, Depends(require_firebase_user)] = None
) -> List[ApplicationResponse]:
    """List applications with optional filtering."""
    db = get_firestore_client()
    
    # Build query based on user role
    query = db.collection("applications")
    
    if job_id:
        query = query.where("job_id", "==", job_id)
    
    if status:
        query = query.where("status", "==", status)
    
    # If user is a candidate, only show their applications
    user_role = user.get("role", "candidate") if user else "candidate"
    if user_role == "candidate":
        query = query.where("applicant_id", "==", user.get("uid"))
    
    docs = query.limit(min(limit, 100)).stream()
    
    applications = []
    for doc in docs:
        data = doc.to_dict()
        if data:
            applications.append(ApplicationResponse(
                id=doc.id,
                **data
            ))
    
    return applications

@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: str,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> ApplicationResponse:
    """Get a specific application by ID."""
    db = get_firestore_client()
    doc_ref = db.collection("applications").document(application_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    data = doc.to_dict()
    if data is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid document data"
        )
    
    return ApplicationResponse(id=doc.id, **data)

@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    req: ApplicationUpdateRequest,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> ApplicationResponse:
    """Update an application (HR only)."""
    db = get_firestore_client()
    doc_ref = db.collection("applications").document(application_id)
    
    # Check if application exists
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Build update data
    update_data = {}
    for field, value in req.dict().items():
        if value is not None:
            update_data[field] = value
    
    if update_data:
        update_data["updated_at"] = datetime.now().isoformat()
        doc_ref.update(update_data)
        
        # Create notification for candidate if status changed
        app_data = doc.to_dict()
        if "status" in update_data and update_data["status"] != app_data.get("status"):
            notification_data = {
                "type": "application_status_update",
                "title": "Application Status Update",
                "message": f"Your application status has been updated to: {update_data['status']}",
                "recipient_id": app_data.get("applicant_id"),
                "data": {
                    "application_id": application_id,
                    "new_status": update_data["status"],
                    "job_title": app_data.get("job_title")
                },
                "created_at": datetime.now().isoformat(),
                "read": False
            }
            
            db.collection("notifications").add(notification_data)
    
    # Return updated application
    updated_doc = doc_ref.get()
    data = updated_doc.to_dict()
    
    return ApplicationResponse(id=application_id, **data)

@router.get("/stats/overview", response_model=ApplicationStatsResponse)
async def get_application_stats(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> ApplicationStatsResponse:
    """Get application statistics for HR dashboard."""
    db = get_firestore_client()
    
    # Get all applications for jobs posted by this HR user
    user_jobs = [doc.id for doc in db.collection("jobs").where("posted_by", "==", user.get("uid")).stream()]
    
    if not user_jobs:
        return ApplicationStatsResponse(
            total_applications=0,
            pending_applications=0,
            reviewed_applications=0,
            rejected_applications=0,
            interview_scheduled=0,
            hired_candidates=0
        )
    
    # Get applications for user's jobs
    applications = []
    for job_id in user_jobs:
        job_apps = db.collection("applications").where("job_id", "==", job_id).stream()
        applications.extend([app.to_dict() for app in job_apps])
    
    # Calculate stats
    total = len(applications)
    pending = len([app for app in applications if app.get("status") == "pending"])
    reviewed = len([app for app in applications if app.get("status") == "reviewed"])
    rejected = len([app for app in applications if app.get("status") == "rejected"])
    interview_scheduled = len([app for app in applications if app.get("interview_scheduled")])
    hired = len([app for app in applications if app.get("status") == "hired"])
    
    return ApplicationStatsResponse(
        total_applications=total,
        pending_applications=pending,
        reviewed_applications=reviewed,
        rejected_applications=rejected,
        interview_scheduled=interview_scheduled,
        hired_candidates=hired
    )

@router.delete("/{application_id}")
async def delete_application(
    application_id: str,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> dict[str, str]:
    """Delete an application."""
    db = get_firestore_client()
    doc_ref = db.collection("applications").document(application_id)
    
    # Check if application exists
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Delete the application
    doc_ref.delete()
    
    return {"message": f"Application {application_id} deleted successfully"}
