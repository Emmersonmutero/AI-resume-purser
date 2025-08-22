from typing import Annotated, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel

from app.auth import require_firebase_user
from app.firestore_client import get_firestore_client

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

# Response Models
class ResumeStatsResponse(BaseModel):
    totalResumes: int
    processedResumes: int
    unprocessedResumes: int
    averageMatchScore: float | None
    topSkills: list[dict[str, Any]]

class TimeSeriesData(BaseModel):
    date: str
    count: int

class TimeSeriesResponse(BaseModel):
    data: list[TimeSeriesData]
    total: int
    period: str

class MatchingStatsResponse(BaseModel):
    totalMatches: int
    averageScore: float
    scoreDistribution: dict[str, int]
    topMatchedSkills: list[dict[str, Any]]

class DashboardOverviewResponse(BaseModel):
    resumeStats: ResumeStatsResponse
    userStats: dict[str, int]
    recentActivity: list[dict[str, Any]]
    systemHealth: dict[str, Any]

# Helper Functions
def _check_admin_access(user_data: dict[str, Any]) -> bool:
    """Check if user has admin or HR access."""
    role = user_data.get("role", "")
    return role in ["admin", "hr"]

def _get_date_range(period: str) -> tuple[datetime, datetime]:
    """Get date range for time series queries."""
    end_date = datetime.now()
    
    if period == "7d":
        start_date = end_date - timedelta(days=7)
    elif period == "30d":
        start_date = end_date - timedelta(days=30)
    elif period == "90d":
        start_date = end_date - timedelta(days=90)
    elif period == "1y":
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)  # default to 30 days
    
    return start_date, end_date

# Routes
@router.get("/resumes", response_model=ResumeStatsResponse)
async def get_resume_stats(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> ResumeStatsResponse:
    """Get resume statistics."""
    db = get_firestore_client()
    
    # Check user permissions
    user_doc = db.collection("users").document(user["uid"]).get()
    user_data = user_doc.to_dict() or {}
    
    if not _check_admin_access(user_data):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or HR access required"
        )
    
    # Get resume statistics
    resumes = list(db.collection("resumes").stream())
    total_resumes = len(resumes)
    processed_resumes = 0
    match_scores = []
    all_skills = []
    
    for resume_doc in resumes:
        data = resume_doc.to_dict() or {}
        
        # Check if resume is processed (has parsed data)
        if data.get("parsed") or data.get("parsed_llm"):
            processed_resumes += 1
        
        # Collect match scores
        if data.get("matchScore"):
            match_scores.append(float(data["matchScore"]))
        
        # Collect skills
        parsed_data = data.get("parsed") or data.get("parsed_llm") or {}
        skills = parsed_data.get("skills", [])
        if isinstance(skills, list):
            all_skills.extend(skills)
    
    # Calculate average match score
    avg_match_score = sum(match_scores) / len(match_scores) if match_scores else None
    
    # Count skill frequencies
    skill_counts = {}
    for skill in all_skills:
        if isinstance(skill, str) and skill.strip():
            skill_lower = skill.lower()
            skill_counts[skill_lower] = skill_counts.get(skill_lower, 0) + 1
    
    # Get top skills
    top_skills = [
        {"skill": skill, "count": count}
        for skill, count in sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    ]
    
    return ResumeStatsResponse(
        totalResumes=total_resumes,
        processedResumes=processed_resumes,
        unprocessedResumes=total_resumes - processed_resumes,
        averageMatchScore=avg_match_score,
        topSkills=top_skills
    )

@router.get("/resumes/timeseries", response_model=TimeSeriesResponse)
async def get_resume_timeseries(
    period: str = Query(default="30d", regex="^(7d|30d|90d|1y)$"),
    user: Annotated[dict, Depends(require_firebase_user)] = None
) -> TimeSeriesResponse:
    """Get resume upload time series data."""
    db = get_firestore_client()
    
    # Check user permissions
    user_doc = db.collection("users").document(user["uid"]).get()
    user_data = user_doc.to_dict() or {}
    
    if not _check_admin_access(user_data):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or HR access required"
        )
    
    # Get date range
    start_date, end_date = _get_date_range(period)
    
    # Query resumes within date range
    resumes_query = db.collection("resumes").where(
        "uploadedAt", ">=", start_date
    ).where(
        "uploadedAt", "<=", end_date
    )
    
    resumes = list(resumes_query.stream())
    
    # Group by date
    date_counts = {}
    for resume_doc in resumes:
        data = resume_doc.to_dict() or {}
        uploaded_at = data.get("uploadedAt")
        
        if uploaded_at:
            date_str = uploaded_at.strftime("%Y-%m-%d") if hasattr(uploaded_at, 'strftime') else str(uploaded_at)[:10]
            date_counts[date_str] = date_counts.get(date_str, 0) + 1
    
    # Convert to time series format
    time_series_data = [
        TimeSeriesData(date=date, count=count)
        for date, count in sorted(date_counts.items())
    ]
    
    return TimeSeriesResponse(
        data=time_series_data,
        total=len(resumes),
        period=period
    )

@router.get("/matching", response_model=MatchingStatsResponse)
async def get_matching_stats(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> MatchingStatsResponse:
    """Get resume matching statistics."""
    db = get_firestore_client()
    
    # Check user permissions
    user_doc = db.collection("users").document(user["uid"]).get()
    user_data = user_doc.to_dict() or {}
    
    if not _check_admin_access(user_data):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or HR access required"
        )
    
    # Get resumes with match scores
    resumes = list(db.collection("resumes").where("matchScore", ">", 0).stream())
    
    if not resumes:
        return MatchingStatsResponse(
            totalMatches=0,
            averageScore=0.0,
            scoreDistribution={},
            topMatchedSkills=[]
        )
    
    match_scores = []
    matched_skills = []
    score_distribution = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    
    for resume_doc in resumes:
        data = resume_doc.to_dict() or {}
        score = data.get("matchScore", 0)
        
        if score > 0:
            match_scores.append(float(score))
            
            # Categorize score
            if score <= 20:
                score_distribution["0-20"] += 1
            elif score <= 40:
                score_distribution["21-40"] += 1
            elif score <= 60:
                score_distribution["41-60"] += 1
            elif score <= 80:
                score_distribution["61-80"] += 1
            else:
                score_distribution["81-100"] += 1
            
            # Collect skills from matched resumes
            parsed_data = data.get("parsed") or data.get("parsed_llm") or {}
            skills = parsed_data.get("skills", [])
            if isinstance(skills, list):
                matched_skills.extend(skills)
    
    # Calculate average score
    avg_score = sum(match_scores) / len(match_scores) if match_scores else 0.0
    
    # Count skill frequencies for matched resumes
    skill_counts = {}
    for skill in matched_skills:
        if isinstance(skill, str) and skill.strip():
            skill_lower = skill.lower()
            skill_counts[skill_lower] = skill_counts.get(skill_lower, 0) + 1
    
    # Get top matched skills
    top_matched_skills = [
        {"skill": skill, "count": count}
        for skill, count in sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    ]
    
    return MatchingStatsResponse(
        totalMatches=len(resumes),
        averageScore=avg_score,
        scoreDistribution=score_distribution,
        topMatchedSkills=top_matched_skills
    )

@router.get("/dashboard", response_model=DashboardOverviewResponse)
async def get_dashboard_overview(
    user: Annotated[dict, Depends(require_firebase_user)]
) -> DashboardOverviewResponse:
    """Get comprehensive dashboard overview data."""
    db = get_firestore_client()
    
    # Check user permissions
    user_doc = db.collection("users").document(user["uid"]).get()
    user_data = user_doc.to_dict() or {}
    
    if not _check_admin_access(user_data):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or HR access required"
        )
    
    # Get resume stats
    resume_stats_response = await get_resume_stats(user)
    
    # Get user stats
    users = list(db.collection("users").stream())
    user_stats = {"total": 0, "hr": 0, "admin": 0, "candidate": 0}
    
    for user_doc_item in users:
        data = user_doc_item.to_dict() or {}
        role = data.get("role", "candidate")
        user_stats["total"] += 1
        user_stats[role] = user_stats.get(role, 0) + 1
    
    # Get recent activity (last 10 resumes uploaded)
    recent_resumes = list(
        db.collection("resumes")
        .order_by("uploadedAt", direction="DESCENDING")
        .limit(10)
        .stream()
    )
    
    recent_activity = []
    for resume_doc in recent_resumes:
        data = resume_doc.to_dict() or {}
        recent_activity.append({
            "id": resume_doc.id,
            "fileName": data.get("fileName", "Unknown"),
            "uploadedAt": data.get("uploadedAt"),
            "status": "processed" if (data.get("parsed") or data.get("parsed_llm")) else "pending"
        })
    
    # System health metrics
    system_health = {
        "status": "healthy",
        "resumeProcessingRate": f"{resume_stats_response.processedResumes}/{resume_stats_response.totalResumes}",
        "lastUpdated": datetime.now().isoformat()
    }
    
    return DashboardOverviewResponse(
        resumeStats=resume_stats_response,
        userStats=user_stats,
        recentActivity=recent_activity,
        systemHealth=system_health
    )
