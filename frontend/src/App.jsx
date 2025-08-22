import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardRouter from "./routes/DashboardRouter";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HRDashboard from "./pages/HRDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import ApplicantManagement from "./pages/ApplicantManagement";
import UploadResumes from "./pages/UploadResumes";
import MatchedCandidates from "./pages/MatchedCandidates";
import Analytics from "./pages/Analytics";
import Search from "./pages/search";
import ChooseRole from "./pages/ChooseRole";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import JobManagement from "./pages/JobManagement";
import ParsingResults from "./pages/ParsingResults";

// Landing page wrapper that redirects logged-in users
function LandingWrapper() {
  const { user, profile, loading } = useAuth();
  
  // Still loading, show loading state
  if (loading) {
    return (
      <div className="center p-6" aria-live="polite" aria-busy="true" role="alert">
        <div className="spinner" aria-hidden="true" />
        Loading…
      </div>
    );
  }
  
  // User is logged in - redirect to appropriate dashboard
  if (user && profile?.role) {
    if (profile.role === 'hr' || profile.role === 'admin') {
      return <Navigate to="/hr-dashboard" replace />;
    }
    if (profile.role === 'candidate') {
      return <Navigate to="/candidate-dashboard" replace />;
    }
    // Has user but no role - go to role selection
    return <Navigate to="/select-role" replace />;
  }
  
  // User is logged in but profile is still loading
  if (user && profile === undefined) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Not logged in - show landing page
  return <Landing />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingWrapper />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard auto-redirect based on role */}
        <Route path="/dashboard" element={<DashboardRouter />} />
        
        {/* Role selection */}
        <Route path="/select-role" element={<ChooseRole />} />

        {/* HR/Admin Routes (nested inside HRDashboard) */}
        <Route path="/hr-dashboard" element={<HRDashboard />}>
          <Route index element={<UploadResumes />} />
          <Route path="upload" element={<UploadResumes />} />
          <Route path="applicants" element={<ApplicantManagement />} />
          <Route path="matches" element={<MatchedCandidates />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="search" element={<Search />} />
          <Route path="users" element={<UploadResumes />} />
        </Route>

        {/* Candidate Routes */}
        <Route path="/candidate-dashboard/*" element={<CandidateDashboard />} />
      </Route>

      {/* Catch-all unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
