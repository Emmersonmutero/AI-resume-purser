import { ROUTES } from '../constants/routes';

// HR Dashboard navigation links
export const HR_LINKS = [
  { 
    to: ROUTES.HR_DASHBOARD, 
    label: "Dashboard", 
    icon: "📊",
    description: "Overview and quick actions"
  },
  { 
    to: ROUTES.HR_UPLOAD, 
    label: "Upload Resumes", 
    icon: "📤",
    description: "Upload and process resumes"
  },
  { 
    to: ROUTES.HR_MATCHES, 
    label: "Matched Candidates", 
    icon: "🎯",
    description: "View matched candidates"
  },
  { 
    to: ROUTES.HR_ANALYTICS, 
    label: "Analytics", 
    icon: "📈",
    description: "Resume and hiring analytics"
  },
  { 
    to: ROUTES.HR_SEARCH, 
    label: "Semantic Search", 
    icon: "🔎",
    description: "AI-powered resume search"
  },
  { 
    to: ROUTES.HR_USERS, 
    label: "Users", 
    icon: "👥",
    description: "Manage team members",
    adminOnly: true
  },
  { 
    to: ROUTES.HR_SETTINGS, 
    label: "Settings", 
    icon: "⚙️",
    description: "Dashboard settings"
  }
];

// Candidate Dashboard navigation links
export const CANDIDATE_LINKS = [
  { 
    to: ROUTES.CANDIDATE_DASHBOARD, 
    label: "Dashboard", 
    icon: "📊",
    description: "Your application overview"
  },
  { 
    to: ROUTES.CANDIDATE_PROFILE, 
    label: "My Profile", 
    icon: "👤",
    description: "Manage your profile"
  },
  { 
    to: ROUTES.CANDIDATE_APPLICATIONS, 
    label: "Applications", 
    icon: "📄",
    description: "Track your applications"
  },
  { 
    to: ROUTES.CANDIDATE_JOBS, 
    label: "Find Jobs", 
    icon: "🔍",
    description: "Search for opportunities"
  }
];

// Admin Dashboard navigation links
export const ADMIN_LINKS = [
  { 
    to: ROUTES.ADMIN_DASHBOARD, 
    label: "Dashboard", 
    icon: "🏠",
    description: "System overview"
  },
  { 
    to: ROUTES.ADMIN_USERS, 
    label: "User Management", 
    icon: "👥",
    description: "Manage all users"
  },
  { 
    to: ROUTES.ADMIN_SYSTEM, 
    label: "System Management", 
    icon: "⚙️",
    description: "System operations"
  },
  { 
    to: ROUTES.ADMIN_ANALYTICS, 
    label: "System Analytics", 
    icon: "📊",
    description: "System performance metrics"
  }
];

// Helper function to get navigation links based on role
export const getNavigationLinks = (role, isAdmin = false) => {
  switch (role) {
    case 'hr':
    case 'admin':
      // Filter admin-only links for HR users who aren't admins
      return HR_LINKS.filter(link => !link.adminOnly || isAdmin);
    case 'candidate':
      return CANDIDATE_LINKS;
    default:
      return [];
  }
};

// Helper function to get admin links
export const getAdminLinks = () => ADMIN_LINKS;

// Helper function to check if a route is accessible by role
export const isRouteAccessible = (route, userRole, isAdmin = false) => {
  const links = getNavigationLinks(userRole, isAdmin);
  return links.some(link => link.to === route);
};
