import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardRouter() {
  const { user, profile, loading } = useAuth();

  console.log("DashboardRouter:", { loading, user: !!user, profile });

  // Wait for user and profile to load
  if (loading || (user && profile === undefined)) {
    return (
      <div className="center p-6" aria-live="polite" aria-busy="true" role="alert">
        <div className="spinner" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // No role → redirect to role selection
  if (!profile?.role) {
    return <Navigate to="/select-role" replace />;
  }

  // Role-based redirection
  if (profile.role === 'hr' || profile.role === 'admin') {
    console.log("DashboardRouter: Redirecting HR/Admin to HR dashboard");
    return <Navigate to="/hr-dashboard" replace />;
  }

  if (profile.role === 'candidate') {
    console.log("DashboardRouter: Redirecting candidate to candidate dashboard");
    return <Navigate to="/candidate-dashboard" replace />;
  }

  // Fallback
  return <Navigate to="/select-role" replace />;
}
