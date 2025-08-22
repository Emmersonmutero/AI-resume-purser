// Route constants for consistent navigation
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Auth flow routes
  SELECT_ROLE: '/select-role',
  
  // HR Dashboard routes
  HR_DASHBOARD: '/hr-dashboard',
  HR_UPLOAD: '/hr-dashboard/upload',
  HR_MATCHES: '/hr-dashboard/matches',
  HR_ANALYTICS: '/hr-dashboard/analytics',
  HR_SEARCH: '/hr-dashboard/search',
  HR_USERS: '/hr-dashboard/users',
  HR_SETTINGS: '/hr-dashboard/settings',
  
  // Candidate Dashboard routes
  CANDIDATE_DASHBOARD: '/candidate-dashboard',
  CANDIDATE_PROFILE: '/candidate-dashboard/profile',
  CANDIDATE_APPLICATIONS: '/candidate-dashboard/applications',
  CANDIDATE_JOBS: '/candidate-dashboard/jobs',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin-dashboard',
  ADMIN_USERS: '/admin-dashboard/users',
  ADMIN_SYSTEM: '/admin-dashboard/system',
  ADMIN_ANALYTICS: '/admin-dashboard/analytics',
  
  // Shared routes
  PROFILE: '/profile',
  SETTINGS: '/settings',
  HELP: '/help',
  LOGOUT: '/logout'
};

// Route groups for role-based access
export const ROUTE_GROUPS = {
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.HELP
  ],
  
  AUTHENTICATED: [
    ROUTES.SELECT_ROLE,
    ROUTES.PROFILE,
    ROUTES.SETTINGS
  ],
  
  HR: [
    ROUTES.HR_DASHBOARD,
    ROUTES.HR_UPLOAD,
    ROUTES.HR_MATCHES,
    ROUTES.HR_ANALYTICS,
    ROUTES.HR_SEARCH,
    ROUTES.HR_USERS,
    ROUTES.HR_SETTINGS
  ],
  
  CANDIDATE: [
    ROUTES.CANDIDATE_DASHBOARD,
    ROUTES.CANDIDATE_PROFILE,
    ROUTES.CANDIDATE_APPLICATIONS,
    ROUTES.CANDIDATE_JOBS
  ],
  
  ADMIN: [
    ROUTES.ADMIN_DASHBOARD,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_SYSTEM,
    ROUTES.ADMIN_ANALYTICS
  ]
};

// Default routes based on role
export const DEFAULT_ROUTES = {
  hr: ROUTES.HR_DASHBOARD,
  candidate: ROUTES.CANDIDATE_DASHBOARD,
  admin: ROUTES.ADMIN_DASHBOARD
};

// Route metadata for navigation
export const ROUTE_META = {
  [ROUTES.HOME]: {
    title: 'Home',
    breadcrumb: 'Home'
  },
  [ROUTES.LOGIN]: {
    title: 'Login',
    breadcrumb: 'Login'
  },
  [ROUTES.REGISTER]: {
    title: 'Register',
    breadcrumb: 'Register'
  },
  [ROUTES.SELECT_ROLE]: {
    title: 'Select Role',
    breadcrumb: 'Role Selection'
  },
  [ROUTES.HR_DASHBOARD]: {
    title: 'HR Dashboard',
    breadcrumb: 'Dashboard'
  },
  [ROUTES.HR_UPLOAD]: {
    title: 'Upload Resumes',
    breadcrumb: 'Upload'
  },
  [ROUTES.HR_MATCHES]: {
    title: 'Matched Candidates',
    breadcrumb: 'Matches'
  },
  [ROUTES.HR_ANALYTICS]: {
    title: 'Analytics',
    breadcrumb: 'Analytics'
  },
  [ROUTES.HR_SEARCH]: {
    title: 'Search',
    breadcrumb: 'Search'
  },
  [ROUTES.CANDIDATE_DASHBOARD]: {
    title: 'Candidate Dashboard',
    breadcrumb: 'Dashboard'
  },
  [ROUTES.ADMIN_DASHBOARD]: {
    title: 'Admin Dashboard',
    breadcrumb: 'Dashboard'
  }
};
