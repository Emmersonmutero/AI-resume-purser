// src/routes/RoleRouter.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES, DEFAULT_ROUTES } from "../constants/routes";

/**
 * RoleRouter component for redirecting users based on their role
 * This is used as a fallback component when no specific route is matched
 */
export default function RoleRouter() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // If no role selected, redirect to role selection
  if (!profile?.role) {
    return <Navigate to={ROUTES.SELECT_ROLE} replace />;
  }

  // Redirect based on user role
  const defaultRoute = DEFAULT_ROUTES[profile.role] || ROUTES.HOME;
  return <Navigate to={defaultRoute} replace />;
}
