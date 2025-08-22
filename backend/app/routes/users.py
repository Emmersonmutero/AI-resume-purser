from typing import Annotated, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth import require_firebase_user
from app.firestore_client import get_firestore_client

router = APIRouter(prefix="/api/users", tags=["users"])

# Request/Response Models
class UserProfile(BaseModel):
    uid: str
    email: str | None = None
    displayName: str | None = None
    role: str | None = None
    company: str | None = None
    department: str | None = None
    createdAt: str | None = None
    lastLoginAt: str | None = None
    notificationsEnabled: bool | None = None

class UpdateProfileRequest(BaseModel):
    displayName: str | None = None
    role: str | None = None
    company: str | None = None
    department: str | None = None
    notificationsEnabled: bool | None = None

class UserStatsResponse(BaseModel):
    totalUsers: int
    hrUsers: int
    candidateUsers: int
    adminUsers: int

class UploadHistoryItem(BaseModel):
    id: str
    fileName: str
    uploadedAt: str

# Routes
@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> UserProfile:
    """Get the current user's profile."""
    db = get_firestore_client()
    user_ref = db.collection("users").document(user["uid"])
    doc = user_ref.get()
    
    if doc.exists:
        data = doc.to_dict() or {}
        return UserProfile(
            uid=user["uid"],
            email=user.get("email"),
            displayName=data.get("displayName") or user.get("displayName"),
            role=data.get("role"),
            company=data.get("company"),
            department=data.get("department"),
            createdAt=data.get("createdAt"),
            lastLoginAt=data.get("lastLoginAt"),
            notificationsEnabled=data.get("notificationsEnabled")
        )
    else:
        # Return basic profile from Firebase auth
        return UserProfile(
            uid=user["uid"],
            email=user.get("email"),
            displayName=user.get("displayName")
        )

@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    req: UpdateProfileRequest,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> UserProfile:
    """Update the current user's profile."""
    db = get_firestore_client()
    user_ref = db.collection("users").document(user["uid"])
    
    # Prepare update data
    update_data = {}
    if req.displayName is not None:
        update_data["displayName"] = req.displayName
    if req.role is not None:
        update_data["role"] = req.role
    if req.company is not None:
        update_data["company"] = req.company
    if req.department is not None:
        update_data["department"] = req.department
    if req.notificationsEnabled is not None:
        update_data["notificationsEnabled"] = req.notificationsEnabled
    
    # Update or create profile
    user_ref.set(update_data, merge=True)
    
    # Return updated profile
    doc = user_ref.get()
    data = doc.to_dict() or {}
    
    return UserProfile(
        uid=user["uid"],
        email=user.get("email"),
        displayName=data.get("displayName") or user.get("displayName"),
        role=data.get("role"),
        company=data.get("company"),
        department=data.get("department"),
        createdAt=data.get("createdAt"),
        lastLoginAt=data.get("lastLoginAt"),
        notificationsEnabled=data.get("notificationsEnabled")
    )

@router.get("/upload-history", response_model=list[UploadHistoryItem])
async def get_upload_history(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> list[UploadHistoryItem]:
    """Get the current user's resume upload history."""
    db = get_firestore_client()
    resumes_ref = db.collection("resumes").where("uid", "==", user["uid"]).stream()
    history = []
    for resume in resumes_ref:
        data = resume.to_dict()
        if data:
            history.append(UploadHistoryItem(
                id=resume.id,
                fileName=data.get("fileName"),
                uploadedAt=data.get("uploadedAt")
            ))
    return history

@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> UserStatsResponse:
    """Get user statistics (admin only)."""
    # Check if user is admin
    db = get_firestore_client()
    user_doc = db.collection("users").document(user["uid"]).get()
    user_data = user_doc.to_dict() or {}
    
    if user_data.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get user statistics
    users = db.collection("users").stream()
    
    total_users = 0
    hr_users = 0
    candidate_users = 0
    admin_users = 0
    
    for user_doc in users:
        data = user_doc.to_dict() or {}
        role = data.get("role", "candidate")
        
        total_users += 1
        if role == "hr":
            hr_users += 1
        elif role == "admin":
            admin_users += 1
        else:
            candidate_users += 1
    
    return UserStatsResponse(
        totalUsers=total_users,
        hrUsers=hr_users,
        candidateUsers=candidate_users,
        adminUsers=admin_users
    )

@router.get("/")
async def list_users(
    user: Annotated[dict, Depends(require_firebase_user)],
    limit: int = 50
) -> dict[str, Any]:
    """List all users (admin only)."""
    # Check if user is admin
    db = get_firestore_client()
    user_doc = db.collection("users").document(user["uid"]).get()
    user_data = user_doc.to_dict() or {}
    
    if user_data.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get users
    users_query = db.collection("users").limit(min(limit, 100))
    docs = users_query.stream()
    
    users = []
    for doc in docs:
        data = doc.to_dict() or {}
        users.append({
            "uid": doc.id,
            **data
        })
    
    return {
        "users": users,
        "total": len(users)
    }

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> dict[str, str]:
    """Delete a user (admin only)."""
    # Check if user is admin
    db = get_firestore_client()
    user_doc = db.collection("users").document(user["uid"]).get()
    user_data = user_doc.to_dict() or {}
    
    if user_data.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Prevent self-deletion
    if user_id == user["uid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user profile
    user_ref = db.collection("users").document(user_id)
    user_ref.delete()
    
    return {"message": f"User {user_id} deleted successfully"}
