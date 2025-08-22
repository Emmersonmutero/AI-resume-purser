// src/pages/HRDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import LineCard from "../components/LineCard";
import DoughnutCard from "../components/DoughnutCard";
import { listenAllResumes, markResumeViewed } from "../services/resumeService";
import "../styles/HRDashboard.css";

export default function HRDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [unreadUploads, setUnreadUploads] = useState(0);
  const [unreadMatches, setUnreadMatches] = useState(0);
  const [resumes, setResumes] = useState([]);
  const [jd, setJd] = useState("");
  const navigate = useNavigate();
  const notificationSound = new Audio("/sounds/notification.mp3");

  useEffect(() => {
    const unsubscribe = listenAllResumes((newResumes) => {
      // Detect new resumes, add notifications
      const addedResumes = newResumes.filter(r => !resumes.some(n => n.id === r.id));
      if (addedResumes.length > 0) {
        const newNotifs = addedResumes.map(r => ({
          id: r.id,
          message: `New resume uploaded: ${r.fileName || r.parsedResume?.contact?.fullName || "Unnamed"}`,
          matchScore: r.matchScore || 0,
        }));
        notificationSound.play().catch(() => {});
        setNotifications(prev => [...prev, ...newNotifs]);
        setUnreadUploads(prev => prev + addedResumes.length);
        const highMatches = addedResumes.filter(r => r.matchScore > 50).length;
        if (highMatches) setUnreadMatches(prev => prev + highMatches);
        // Auto-remove each notification after 5s
        newNotifs.forEach((n) => {
          setTimeout(() => {
            setNotifications(prev => prev.filter(item => item.id !== n.id));
            setUnreadUploads(prev => Math.max(prev - 1, 0));
            if (n.matchScore > 50) setUnreadMatches(prev => Math.max(prev - 1, 0));
          }, 5000);
        });
      }
      setResumes(newResumes);
    });
    return () => unsubscribe();
  }, [resumes]);

  const removeNotification = id => {
    const notif = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadUploads(prev => Math.max(prev - 1, 0));
    if (notif?.matchScore > 50) setUnreadMatches(prev => Math.max(prev -1, 0));
  };

  const handleResumeClick = async (resume) => {
    window.open(resume.url, "_blank");
    if (resume.isNew) {
      await markResumeViewed(resume.id);
      setUnreadUploads(prev => Math.max(prev - 1, 0));
    }
    if (resume.matchScore > 50) {
      setUnreadMatches(prev => Math.max(prev - 1, 0));
    }
  };

  // Badge click resets counter and navigates
  const handleUploadBadgeClick = () => { navigate("/hr-dashboard/upload"); setUnreadUploads(0); };
  const handleMatchesBadgeClick = () => { navigate("/hr-dashboard/matches"); setUnreadMatches(0); };

  // Dashboard stats computed from resumes
  const stats = useMemo(() => {
    const total = resumes.length;
    const highMatchCount = resumes.filter(r => r.matchScore > 50).length;
    const avgMatchScore = total > 0 ? Math.round(resumes.reduce((a, r) => a + (r.matchScore || 0), 0) / total) : 0;
    return {
      total,
      highMatchCount,
      avgMatchScore,
    };
  }, [resumes]);

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar />
        <main className="content">
          <div className="jd-container">
            <textarea
              className="jd-textarea"
              placeholder="Paste Job Description here to score resumes..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          <div className="tabs">
            <NavLink to="/hr-dashboard/upload" className={({ isActive }) => "tab" + (isActive ? " tab--active" : "")}>
              Upload
              {unreadUploads > 0 && <span className="tab-badge" onClick={handleUploadBadgeClick}>{unreadUploads}</span>}
            </NavLink>
            <NavLink to="/hr-dashboard/matches" className={({ isActive }) => "tab" + (isActive ? " tab--active" : "")}>
              Matches
              {unreadMatches > 0 && <span className="tab-badge tab-badge--medium" onClick={handleMatchesBadgeClick}>{unreadMatches}</span>}
            </NavLink>
            <NavLink to="/hr-dashboard/analytics" className={({ isActive }) => "tab" + (isActive ? " tab--active" : "")}>Analytics</NavLink>
            <NavLink to="/hr-dashboard/search" className={({ isActive }) => "tab" + (isActive ? " tab--active" : "")}>Search</NavLink>
          </div>

          <div className="stats-container">
            <StatCard title="Total Resumes" value={stats.total} />
            <StatCard title="High Matches" value={stats.highMatchCount} hint="Match score > 50%" />
            <StatCard title="Average Match Score" value={stats.avgMatchScore + "%"} />
          </div>

          {/* Notifications */}
          <div className="notifications-container">
            {notifications.map(n => (
              <div key={n.id} className="notification">
                {n.message}
                <button className="btn--close" onClick={() => removeNotification(n.id)}>×</button>
              </div>
            ))}
          </div>

          <Outlet context={{
            resumes,
            handleResumeClick,
            notifications,
            setNotifications,
            setUnreadUploads,
            setUnreadMatches,
            jd
          }} />
        </main>
      </div>
    </>
  );
}
