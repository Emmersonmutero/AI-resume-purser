from typing import Annotated, Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth import require_firebase_user
from app.firestore_client import get_firestore_client

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

# Request/Response Models
class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    recipient_id: str
    data: dict = {}
    created_at: str
    read: bool = False

class NotificationUpdateRequest(BaseModel):
    read: bool = True

class NotificationStatsResponse(BaseModel):
    total_notifications: int
    unread_notifications: int

# Routes
@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(
    limit: int = 50,
    unread_only: bool = False,
    user: Annotated[dict, Depends(require_firebase_user)] = None
) -> List[NotificationResponse]:
    """List notifications for the current user."""
    db = get_firestore_client()
    
    # Build query
    query = db.collection("notifications").where("recipient_id", "==", user.get("uid"))
    
    if unread_only:
        query = query.where("read", "==", False)
    
    # Order by creation time (newest first)
    query = query.order_by("created_at", direction="DESCENDING")
    
    docs = query.limit(min(limit, 100)).stream()
    
    notifications = []
    for doc in docs:
        data = doc.to_dict()
        if data:
            notifications.append(NotificationResponse(
                id=doc.id,
                **data
            ))
    
    return notifications

@router.get("/stats", response_model=NotificationStatsResponse)
async def get_notification_stats(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> NotificationStatsResponse:
    """Get notification statistics for the current user."""
    db = get_firestore_client()
    
    # Get all notifications
    all_notifications = list(db.collection("notifications").where("recipient_id", "==", user.get("uid")).stream())
    
    # Get unread notifications
    unread_notifications = list(db.collection("notifications")
                               .where("recipient_id", "==", user.get("uid"))
                               .where("read", "==", False)
                               .stream())
    
    return NotificationStatsResponse(
        total_notifications=len(all_notifications),
        unread_notifications=len(unread_notifications)
    )

@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: str,
    req: NotificationUpdateRequest,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> NotificationResponse:
    """Update a notification (mark as read/unread)."""
    db = get_firestore_client()
    doc_ref = db.collection("notifications").document(notification_id)
    
    # Check if notification exists and belongs to user
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification_data = doc.to_dict()
    if notification_data.get("recipient_id") != user.get("uid"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update notification
    update_data = req.dict()
    update_data["updated_at"] = datetime.now().isoformat()
    
    doc_ref.update(update_data)
    
    # Return updated notification
    updated_doc = doc_ref.get()
    data = updated_doc.to_dict()
    
    return NotificationResponse(id=notification_id, **data)

@router.post("/mark-all-read")
async def mark_all_notifications_read(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> dict[str, Any]:
    """Mark all notifications as read for the current user."""
    db = get_firestore_client()
    
    # Get all unread notifications
    unread_notifications = db.collection("notifications")\
        .where("recipient_id", "==", user.get("uid"))\
        .where("read", "==", False)\
        .stream()
    
    count = 0
    for doc in unread_notifications:
        doc.reference.update({
            "read": True,
            "updated_at": datetime.now().isoformat()
        })
        count += 1
    
    return {
        "message": f"Marked {count} notifications as read",
        "count": count
    }

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    user: Annotated[dict, Depends(require_firebase_user)]
) -> dict[str, str]:
    """Delete a notification."""
    db = get_firestore_client()
    doc_ref = db.collection("notifications").document(notification_id)
    
    # Check if notification exists and belongs to user
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification_data = doc.to_dict()
    if notification_data.get("recipient_id") != user.get("uid"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Delete the notification
    doc_ref.delete()
    
    return {"message": f"Notification {notification_id} deleted successfully"}

@router.post("/create")
async def create_notification(
    type: str,
    title: str,
    message: str,
    recipient_id: str,
    data: dict = {},
    user: Annotated[dict, Depends(require_firebase_user)] = None
) -> dict[str, Any]:
    """Create a new notification (for system use)."""
    db = get_firestore_client()
    
    notification_data = {
        "type": type,
        "title": title,
        "message": message,
        "recipient_id": recipient_id,
        "data": data,
        "created_at": datetime.now().isoformat(),
        "read": False
    }
    
    # Add notification to Firestore
    doc_ref = db.collection("notifications").add(notification_data)
    notification_id = doc_ref[1].id
    
    return {
        "notification_id": notification_id,
        "message": "Notification created successfully"
    }
