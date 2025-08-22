import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUser } from "@clerk/clerk-react";

export default function ProtectedRoute({ redirectTo = "/login" }) {
  const { user, profile, loading } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  console.log("ProtectedRoute:", { 
    loading, 
    isLoaded, 
    isSignedIn, 
    user: !!user, 
    profile, 
    pathname: location.pathname 
  });

  // Wait for user and profile to load
  if (loading || !isLoaded) {
    return (
      <div className="center p-6" aria-live="polite" aria-busy="true" role="alert">
        <div className="spinner" aria-hidden="true" />
        Loading…
      </div>
    );
  }
  
  // If we have a user but profile is still loading (undefined)
  if (user && profile === undefined) {
    return (
      <div className="center p-6" aria-live="polite" aria-busy="true" role="alert">
        <div className="spinner" aria-hidden="true" />
        Loading profile…
      </div>
    );
  }

  // Not logged in → send to login
  if (!isSignedIn) {
    console.log("ProtectedRoute: Not signed in, redirecting to login");
    return <Navigate to={redirectTo} replace />;
  }
  
  // User has no role yet → allow select-role or redirect there
  if (!profile?.role) {
    if (location.pathname === "/select-role") {
      console.log("ProtectedRoute: No role, allowing select-role page");
      return <Outlet />;
    }
    console.log("ProtectedRoute: No role, redirecting to select-role");
    return <Navigate to="/select-role" replace />;
  }
  
  // HR/Admin → allow HR routes
  if (profile.role === "hr" || profile.role === "admin") {
    console.log("ProtectedRoute: HR/Admin role, allowing access");
    return <Outlet />;
  }
  
  // Candidate → allow candidate routes
  if (profile.role === "candidate") {
    console.log("ProtectedRoute: Candidate role, allowing access");
    return <Outlet />;
  }
  
  // Fallback
  console.log("ProtectedRoute: Fallback, redirecting to login");
  return <Navigate to={redirectTo} replace />;
}