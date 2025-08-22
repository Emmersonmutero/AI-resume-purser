import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/SelectRole.css";

export default function ChooseRole() {
  const [role, setRole] = useState("hr"); // default HR
  const { user, setUser, setProfile, updateRole } = useAuth();
  const navigate = useNavigate();

  const saveRole = async () => {
    if (!user) {
      console.log("ChooseRole: No user found, cannot save role");
      return;
    }

    console.log("ChooseRole: Saving role:", role);
    try {
      await updateRole(role);
      setUser({ ...user, role });
      setProfile(prev => ({ ...(prev || {}), role }));
      
      console.log("ChooseRole: Role saved successfully, navigating to dashboard");
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        // Navigate based on role
        if (role === "hr" || role === "admin") {
          console.log("ChooseRole: Navigating to /hr-dashboard");
          navigate("/hr-dashboard", { replace: true });
        } else {
          // For other roles, we might want to navigate to a different dashboard
          // For now, we'll just go to the HR dashboard as a fallback
          console.log("ChooseRole: Navigating to /hr-dashboard (fallback)");
          navigate("/hr-dashboard", { replace: true });
        }
      }, 100);
    } catch (error) {
      console.error("ChooseRole: Error saving role:", error);
    }
  };

  return (
    <div className="select-role">
      <div className="select-role__card">
        <h2 className="select-role__title">Select Your Role</h2>
        <p className="select-role__subtitle">Choose the role that best describes you</p>
        
        <div className="role-options">
          <button
            onClick={() => setRole("hr")}
            className={`role-button ${role === "hr" ? "selected" : ""}`}
          >
            HR / Recruiter
          </button>
          <button
            onClick={() => setRole("admin")}
            className={`role-button ${role === "admin" ? "selected" : ""}`}
          >
            Admin
          </button>
          <button
            onClick={() => setRole("candidate")}
            className={`role-button ${role === "candidate" ? "selected" : ""}`}
          >
            Candidate
          </button>
        </div>
        
        <button onClick={saveRole} className="select-role__submit">
          Continue
        </button>
      </div>
    </div>
  );
}