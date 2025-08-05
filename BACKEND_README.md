# Backend Implementation - AI Resume Parser

This document provides a comprehensive overview of the backend implementation for the AI Resume Parser application.

## Overview

The backend is built using Next.js 15 with App Router, Firebase (Firestore, Storage, Auth), and Google's Genkit AI for resume processing and job matching. It provides a complete REST API for the application's functionality.

## Architecture

```
├── src/
│   ├── app/api/                 # API Routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── resumes/            # Resume management
│   │   ├── jobs/               # Job postings
│   │   ├── applications/       # Job applications
│   │   ├── ai/                 # AI-powered features
│   │   └── users/              # User profile management
│   ├── lib/                    # Utilities and configurations
│   │   ├── auth-utils.ts       # Authentication helpers
│   │   ├── api-client.ts       # Client-side API utility
│   │   ├── rate-limiter.ts     # Rate limiting implementation
│   │   └── firebase.ts         # Firebase configuration
│   ├── ai/                     # AI flows and configurations
│   └── middleware.ts           # Next.js middleware for auth
```

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with Firebase Auth
- Role-based access control (job-seeker, recruiter)
- Protected API routes with middleware
- Rate limiting for security

### 📄 Resume Management
- Secure file upload (PDF, DOCX)
- AI-powered resume parsing
- Resume data extraction and storage
- File validation and size limits

### 💼 Job Management
- CRUD operations for job postings
- Advanced filtering and search
- Pagination support
- Job application tracking

### 🤖 AI Integration
- Resume data extraction using Genkit
- Resume summarization
- Job matching algorithm
- Skills analysis and matching

### 📊 Application Tracking
- Application status management
- Match score calculation
- Recruiter dashboard functionality
- Application analytics

## API Endpoints

### Authentication
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
```

### Resumes
```
GET    /api/resumes           # Get user's resumes
POST   /api/resumes/upload    # Upload new resume
GET    /api/resumes/[id]      # Get specific resume
PATCH  /api/resumes/[id]      # Update resume
DELETE /api/resumes/[id]      # Delete resume
```

### Jobs
```
GET    /api/jobs              # Get jobs (with filtering)
POST   /api/jobs              # Create job (recruiter only)
GET    /api/jobs/[id]         # Get specific job
PATCH  /api/jobs/[id]         # Update job (recruiter only)
DELETE /api/jobs/[id]         # Delete job (recruiter only)
POST   /api/jobs/[id]/apply   # Apply to job (job-seeker only)
```

### Applications
```
GET   /api/applications       # Get applications
GET   /api/applications/[id]  # Get specific application
PATCH /api/applications/[id]  # Update application status
```

### AI Features
```
POST /api/ai/match-jobs       # AI job matching
```

### User Profile
```
GET   /api/users/profile      # Get user profile
PATCH /api/users/profile      # Update user profile
```

## Database Schema

### Users Collection
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  role: 'job-seeker' | 'recruiter';
  phoneNumber?: string;
  location?: string;
  bio?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  photoURL?: string;
  preferences?: {
    jobAlerts: boolean;
    profileVisibility: 'public' | 'private';
    desiredJobType?: string;
    desiredSalaryRange?: { min: number; max: number };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Resumes Collection
```typescript
{
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadURL: string;
  storagePath: string;
  extractedData: ExtractResumeDataOutput;
  summary: string;
  uploadedAt: Timestamp;
  isActive: boolean;
}
```

### Jobs Collection
```typescript
{
  title: string;
  company: string;
  description: string;
  location: string;
  salaryRange?: { min: number; max: number };
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skills: string[];
  benefits?: string[];
  remote: boolean;
  postedBy: string;
  recruiterName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  applicationsCount: number;
}
```

### Applications Collection
```typescript
{
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  resumeId: string;
  resumeData: ExtractResumeDataOutput;
  matchScore: number;
  matchExplanation: string;
  coverLetter?: string;
  appliedAt: Timestamp;
  status: 'pending' | 'reviewed' | 'interviewed' | 'offered' | 'hired' | 'rejected';
  recruiterId: string;
  notes?: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
}
```

## Security Features

### Rate Limiting
- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- AI endpoints: 10 requests per minute
- File uploads: 5 requests per minute

### File Upload Security
- File type validation (PDF, DOCX only)
- File size limits (10MB max)
- Virus scanning capabilities
- Secure storage with Firebase Storage

### Authentication
- JWT token validation
- Role-based access control
- Secure password handling
- Token refresh mechanism

## Environment Variables

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Google AI Configuration
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Application Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:9002
NODE_ENV=development
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Fill in your configuration values
   ```

3. **Firebase Setup**
   - Create a Firebase project
   - Enable Firestore, Storage, and Authentication
   - Download service account key
   - Configure Firestore security rules

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## API Usage Examples

### Authentication
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Register
await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, displayName, role })
});
```

### Resume Upload
```javascript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/resumes/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Job Search
```javascript
const response = await fetch('/api/jobs?search=developer&jobType=full-time&remote=true', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Error Handling

The API uses consistent error response format:

```typescript
{
  success: false,
  error: string,
  details?: any
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (auth required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Performance Considerations

### Caching
- Firebase Firestore provides automatic caching
- Client-side caching for frequently accessed data
- CDN caching for static assets

### Optimization
- Pagination for large datasets
- Efficient Firestore queries with proper indexing
- File compression for uploads
- Lazy loading for AI processing

### Monitoring
- Error logging and tracking
- Performance metrics
- Rate limit monitoring
- Resource usage tracking

## Deployment

### Firebase App Hosting
```yaml
# apphosting.yaml
runConfig:
  maxInstances: 1
```

### Environment Variables
Ensure all required environment variables are set in your deployment environment.

### Database Rules
Update Firestore security rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /jobs/{jobId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /applications/{applicationId} {
      allow read, write: if request.auth != null;
    }
    
    match /resumes/{resumeId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Testing

### API Testing
```bash
# Run tests
npm test

# Test specific endpoints
npm run test:api

# Integration tests
npm run test:integration
```

### Manual Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Test authentication
curl -X POST http://localhost:9002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Contributing

1. Follow the established code structure
2. Add proper error handling
3. Include input validation
4. Write tests for new endpoints
5. Update documentation

## Support

For issues and questions:
- Check the API documentation
- Review error logs
- Test with different input parameters
- Verify authentication tokens

---

This backend provides a robust foundation for the AI Resume Parser application with comprehensive security, scalability, and maintainability features.