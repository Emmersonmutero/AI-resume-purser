import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, ROUTE_GROUPS, DEFAULT_ROUTES } from '../constants/routes';

/**
 * RouteGuard component for role-based access control
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if access is granted
 * @param {Array<string>} props.allowedRoles - Array of roles that can access this route
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 * @param {string} props.redirectTo - Custom redirect path if access is denied
 */
const RouteGuard = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  redirectTo = null 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If user is logged in but hasn't selected a role yet
  if (requireAuth && user && !profile?.role) {
    // Don't redirect from role selection page itself
    if (location.pathname !== ROUTES.SELECT_ROLE) {
      return <Navigate to={ROUTES.SELECT_ROLE} replace />;
    }
  }

  // If specific roles are required, check user's role
  if (allowedRoles.length > 0 && profile?.role) {
    const hasAccess = allowedRoles.includes(profile.role);
    
    if (!hasAccess) {
      // Redirect to user's default dashboard or home
      const defaultRoute = DEFAULT_ROUTES[profile.role] || ROUTES.HOME;
      const finalRedirect = redirectTo || defaultRoute;
      return <Navigate to={finalRedirect} replace />;
    }
  }

  // All checks passed, render children
  return children;
};

/**
 * Hook to check if user has access to a specific route
 * @param {string} route - Route path to check
 * @param {Array<string>} roles - Array of roles to check against
 * @returns {boolean} - Whether user has access
 */
export const useRouteAccess = (route, roles = []) => {
  const { user, profile } = useAuth();

  // Public routes are always accessible
  if (ROUTE_GROUPS.PUBLIC.includes(route)) {
    return true;
  }

  // If no user, can only access public routes
  if (!user) {
    return false;
  }

  // Authenticated routes are accessible to any logged-in user
  if (ROUTE_GROUPS.AUTHENTICATED.includes(route)) {
    return true;
  }

  // Role-specific routes
  if (roles.length > 0) {
    return profile?.role && roles.includes(profile.role);
  }

  // Check if route is in user's allowed route groups
  const userRole = profile?.role;
  if (!userRole) return false;

  const allowedRoutes = ROUTE_GROUPS[userRole.toUpperCase()] || [];
  return allowedRoutes.includes(route);
};

/**
 * Component for redirecting based on user role
 */
export const RoleBasedRedirect = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Redirecting...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!profile?.role) {
    return <Navigate to={ROUTES.SELECT_ROLE} replace />;
  }

  // Redirect to user's default dashboard
  const defaultRoute = DEFAULT_ROUTES[profile.role] || ROUTES.HOME;
  return <Navigate to={defaultRoute} replace />;
};

/**
 * Higher-order component for protecting routes
 * @param {React.Component} Component - Component to protect
 * @param {Array<string>} allowedRoles - Roles that can access this component
 * @param {boolean} requireAuth - Whether authentication is required
 */
export const withRouteGuard = (Component, allowedRoles = [], requireAuth = true) => {
  return function ProtectedComponent(props) {
    return (
      <RouteGuard allowedRoles={allowedRoles} requireAuth={requireAuth}>
        <Component {...props} />
      </RouteGuard>
    );
  };
};

export default RouteGuard;
