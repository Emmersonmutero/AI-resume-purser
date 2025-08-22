# AI Resume Parser - API Routes Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
All API endpoints (except health checks) require Firebase authentication. Include the Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## API Endpoints

### Root & Health

#### GET `/`
**Description:** Root endpoint with API information  
**Authentication:** Not required  
**Response:**
```json
{
  "message": "AI Resume Parser API",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health"
}
```

#### GET `/health`
**Description:** Health check endpoint  
**Authentication:** Not required  
**Response:**
```json
{
  "status": "ok",
  "service": "ai-resume-parser"
}
```

---

## Resume Management Routes (`/api/resumes`)

#### POST `/api/resumes/parse`
**Description:** Parse a resume using Groq LLM  
**Authentication:** Required  
**Request Body:**
```json
{
  "resumeText": "string"
}
```
**Response:**
```json
{
  "parsed": {
    "contact": {
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "location": "string"
    },
    "summary": "string",
    "skills": ["string"],
    "experience": [
      {
        "title": "string",
        "company": "string",
        "startDate": "YYYY-MM",
        "endDate": "YYYY-MM",
        "bullets": ["string"],
        "location": "string"
      }
    ],
    "education": [
      {
        "degree": "string",
        "institution": "string",
        "startDate": "YYYY-MM",
        "endDate": "YYYY-MM",
        "field": "string"
      }
    ],
    "certifications": ["string"],
    "languages": ["string"]
  }
}
```

#### POST `/api/resumes/upload`
**Description:** Upload a resume file  
**Authentication:** Required  
**Request:** Multipart form data with file  
**Response:**
```json
{
  "resumeId": "string",
  "fileName": "string",
  "message": "string"
}
```

#### POST `/api/resumes/index`
**Description:** Index a resume for search  
**Authentication:** Required  
**Request Body:**
```json
{
  "resumeId": "string",
  "parsed": {} // Optional parsed resume data
}
```
**Response:**
```json
{
  "parsed": {},
  "text_blob": "string",
  "embedding": [number]
}
```

#### GET `/api/resumes/search`
**Description:** Search resumes using semantic search  
**Authentication:** Required  
**Query Parameters:**
- `q` (required): Search query
- `top_k` (optional): Maximum results to return (default: 20)

**Response:**
```json
{
  "results": [
    {
      "id": "string",
      "fileName": "string", 
      "uid": "string",
      "url": "string",
      "matchScore": number,
      "skills": ["string"],
      "sim": number
    }
  ],
  "total": number,
  "query": "string"
}
```

#### GET `/api/resumes/{resume_id}`
**Description:** Get a specific resume by ID  
**Authentication:** Required  
**Response:**
```json
{
  "id": "string",
  "fileName": "string",
  "uid": "string",
  "parsed": {},
  "uploadedAt": "string",
  "matchScore": number
}
```

#### GET `/api/resumes/`
**Description:** List all resumes with pagination  
**Authentication:** Required  
**Query Parameters:**
- `limit` (optional): Maximum results to return (default: 50)

**Response:**
```json
{
  "resumes": [
    {
      "id": "string",
      "fileName": "string",
      "uid": "string",
      "parsed": {},
      "uploadedAt": "string"
    }
  ],
  "total": number
}
```

#### DELETE `/api/resumes/{resume_id}`
**Description:** Delete a resume by ID  
**Authentication:** Required  
**Response:**
```json
{
  "message": "Resume {resume_id} deleted successfully"
}
```

---

## User Management Routes (`/api/users`)

#### GET `/api/users/profile`
**Description:** Get current user's profile  
**Authentication:** Required  
**Response:**
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "role": "string",
  "company": "string", 
  "department": "string",
  "createdAt": "string",
  "lastLoginAt": "string"
}
```

#### PUT `/api/users/profile`
**Description:** Update current user's profile  
**Authentication:** Required  
**Request Body:**
```json
{
  "displayName": "string",
  "role": "string",
  "company": "string",
  "department": "string"
}
```
**Response:** Same as GET profile

#### GET `/api/users/stats`
**Description:** Get user statistics (Admin only)  
**Authentication:** Required (Admin role)  
**Response:**
```json
{
  "totalUsers": number,
  "hrUsers": number,
  "candidateUsers": number,
  "adminUsers": number
}
```

#### GET `/api/users/`
**Description:** List all users (Admin only)  
**Authentication:** Required (Admin role)  
**Query Parameters:**
- `limit` (optional): Maximum results to return (default: 50)

**Response:**
```json
{
  "users": [
    {
      "uid": "string",
      "email": "string",
      "displayName": "string",
      "role": "string",
      "createdAt": "string"
    }
  ],
  "total": number
}
```

#### DELETE `/api/users/{user_id}`
**Description:** Delete a user (Admin only)  
**Authentication:** Required (Admin role)  
**Response:**
```json
{
  "message": "User {user_id} deleted successfully"
}
```

---

## Analytics Routes (`/api/analytics`)

#### GET `/api/analytics/resumes`
**Description:** Get resume statistics  
**Authentication:** Required (HR/Admin role)  
**Response:**
```json
{
  "totalResumes": number,
  "processedResumes": number,
  "unprocessedResumes": number,
  "averageMatchScore": number,
  "topSkills": [
    {
      "skill": "string",
      "count": number
    }
  ]
}
```

#### GET `/api/analytics/resumes/timeseries`
**Description:** Get resume upload time series data  
**Authentication:** Required (HR/Admin role)  
**Query Parameters:**
- `period` (optional): Time period - "7d", "30d", "90d", "1y" (default: "30d")

**Response:**
```json
{
  "data": [
    {
      "date": "YYYY-MM-DD",
      "count": number
    }
  ],
  "total": number,
  "period": "string"
}
```

#### GET `/api/analytics/matching`
**Description:** Get resume matching statistics  
**Authentication:** Required (HR/Admin role)  
**Response:**
```json
{
  "totalMatches": number,
  "averageScore": number,
  "scoreDistribution": {
    "0-20": number,
    "21-40": number,
    "41-60": number, 
    "61-80": number,
    "81-100": number
  },
  "topMatchedSkills": [
    {
      "skill": "string",
      "count": number
    }
  ]
}
```

#### GET `/api/analytics/dashboard`
**Description:** Get comprehensive dashboard overview data  
**Authentication:** Required (HR/Admin role)  
**Response:**
```json
{
  "resumeStats": {},
  "userStats": {
    "total": number,
    "hr": number,
    "admin": number,
    "candidate": number
  },
  "recentActivity": [
    {
      "id": "string",
      "fileName": "string",
      "uploadedAt": "string",
      "status": "string"
    }
  ],
  "systemHealth": {
    "status": "string",
    "resumeProcessingRate": "string",
    "lastUpdated": "string"
  }
}
```

---

## Admin Routes (`/api/admin`)

#### POST `/api/admin/reindex-all`
**Description:** Reindex all resumes in the database  
**Authentication:** Required (Admin only)  
**Response:**
```json
{
  "updated": ["string"],
  "errors": ["string"],
  "total_processed": number
}
```

#### GET `/api/admin/system-status`
**Description:** Get system status and health metrics  
**Authentication:** Required (Admin only)  
**Response:**
```json
{
  "status": "string",
  "database_connected": boolean,
  "embeddings_available": boolean,
  "total_resumes": number,
  "total_users": number,
  "system_version": "string"
}
```

#### POST `/api/admin/cleanup-data`
**Description:** Analyze and suggest data cleanup operations  
**Authentication:** Required (Admin only)  
**Response:**
```json
{
  "resumes_without_parsed": number,
  "resumes_without_embeddings": number,
  "cleanup_suggestions": {
    "reindex_needed": number,
    "reparse_needed": number
  }
}
```

#### DELETE `/api/admin/purge-test-data`
**Description:** Purge test data from the system (DANGEROUS)  
**Authentication:** Required (Admin only)  
**Response:**
```json
{
  "purged_test_resumes": number,
  "message": "string"
}
```

---

## Error Responses

All endpoints may return the following error responses:

#### 401 Unauthorized
```json
{
  "detail": "Authentication required"
}
```

#### 403 Forbidden
```json
{
  "detail": "Access denied" 
}
```

#### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

#### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "field"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Interactive API Documentation

Visit `/docs` for interactive Swagger UI documentation  
Visit `/redoc` for ReDoc documentation
