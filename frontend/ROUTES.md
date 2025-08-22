# AI Resume Parser - Frontend Routes Documentation

## Route Structure

The application uses React Router v6 with role-based access control and nested routing.

## Public Routes

### `/` - Landing Page
- **Component:** `Landing`
- **Access:** Public (no authentication required)
- **Description:** Homepage with app information and login/register links

### `/login` - Login Page
- **Component:** `Login`
- **Access:** Public (no authentication required)
- **Description:** User authentication page with Firebase Auth integration

### `/register` - Registration Page
- **Component:** `Register` 
- **Access:** Public (no authentication required)
- **Description:** User registration page

---

## Authenticated Routes

### `/select-role` - Role Selection
- **Component:** `ChooseRole`
- **Access:** Authenticated users without a role
- **Description:** Role selection page for new users (HR, Candidate, Admin)

### `/dashboard` - Role-based Redirect
- **Component:** `RoleBasedRedirect`
- **Access:** Authenticated users with roles
- **Description:** Automatically redirects to user's default dashboard

---

## HR Dashboard Routes

Base route: `/hr-dashboard`  
**Access:** HR and Admin roles only

### `/hr-dashboard` - HR Dashboard Home
- **Component:** `HRDashboard`
- **Description:** Main HR dashboard with overview and navigation

### `/hr-dashboard/upload` - Upload Resumes
- **Component:** `UploadResumes`
- **Description:** Upload and process resume files

### `/hr-dashboard/matches` - Matched Candidates
- **Component:** `MatchedCandidates`
- **Description:** View candidates matched to job requirements

### `/hr-dashboard/analytics` - Analytics
- **Component:** `Analytics`
- **Description:** Resume processing and hiring analytics

### `/hr-dashboard/search` - Semantic Search
- **Component:** `Search`
- **Description:** AI-powered semantic search for resumes

### `/hr-dashboard/users` - User Management
- **Access:** Admin role only
- **Description:** Manage team members and user roles

### `/hr-dashboard/settings` - Settings
- **Description:** Dashboard configuration and preferences

---

## Candidate Dashboard Routes

Base route: `/candidate-dashboard`  
**Access:** Candidate role only

### `/candidate-dashboard` - Candidate Dashboard Home
- **Component:** `CandidateDashboard`
- **Description:** Main candidate dashboard with application overview

### `/candidate-dashboard/profile` - My Profile
- **Description:** Manage candidate profile and resume

### `/candidate-dashboard/applications` - My Applications
- **Description:** Track job application status and history

### `/candidate-dashboard/jobs` - Find Jobs
- **Description:** Search and browse available job opportunities

---

## Admin Dashboard Routes

Base route: `/admin-dashboard`  
**Access:** Admin role only

### `/admin-dashboard` - Admin Dashboard Home
- **Component:** `AdminDashboard`
- **Description:** System administration overview

### `/admin-dashboard/users` - User Management
- **Description:** Manage all system users and roles

### `/admin-dashboard/system` - System Management
- **Description:** System operations, logs, and maintenance

### `/admin-dashboard/analytics` - System Analytics
- **Description:** System performance metrics and analytics

---

## Route Protection

### Route Guards
Routes are protected using the `RouteGuard` component with role-based access control:

```jsx
<RouteGuard allowedRoles={['hr', 'admin']}>
  <HRDashboard />
</RouteGuard>
```

### Access Control Rules

1. **Public Routes:** Accessible without authentication
2. **Authenticated Routes:** Require valid Firebase authentication
3. **Role-based Routes:** Require specific user roles

### Role Hierarchy
- **Admin:** Can access all routes
- **HR:** Can access HR dashboard and some admin features
- **Candidate:** Can only access candidate-specific routes

---

## Navigation

### Dynamic Navigation Links
Navigation links are generated based on user role using helper functions:

```javascript
import { getNavigationLinks } from '../utils/roleRoutes';

const navLinks = getNavigationLinks(userRole, isAdmin);
```

### Sidebar Navigation
Each dashboard includes a sidebar with role-appropriate navigation links.

---

## Error Handling

### 404 - Route Not Found
Unmatched routes redirect to the homepage (`/`)

### 403 - Access Denied
Users accessing unauthorized routes are redirected to their default dashboard

### Authentication Errors
Unauthenticated users are redirected to login with a return URL

---

## Route Constants

All routes are defined in `src/constants/routes.js` for consistent usage:

```javascript
import { ROUTES } from '../constants/routes';

// Usage
navigate(ROUTES.HR_DASHBOARD);
```

---

## Development Notes

### Adding New Routes
1. Define route constants in `routes.js`
2. Add to appropriate route group
3. Create/update navigation links in `roleRoutes.js`
4. Implement route protection with `RouteGuard`
5. Update documentation

### Route Structure Best Practices
- Use nested routes for related functionality
- Implement proper loading states
- Handle authentication edge cases
- Provide clear error messages
- Use descriptive route paths

---

## Testing

### Route Testing Checklist
- [ ] Public routes accessible without auth
- [ ] Protected routes redirect unauthenticated users
- [ ] Role-based access control works correctly
- [ ] Navigation links update based on user role
- [ ] Error routes handle edge cases
- [ ] Deep linking works for authenticated routes
