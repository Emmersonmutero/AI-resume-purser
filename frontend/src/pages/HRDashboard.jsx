// src/pages/HRDashboard.jsx - Cybersecurity-Inspired HR Dashboard
import React, { useState, useEffect, useMemo } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/HRDashboard.css";
import LineCard from "../components/LineCard";
import DoughnutCard from "../components/DoughnutCard";

import { apiGetDashboardOverview } from "../services/api";

export default function HRDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [unreadApplications, setUnreadApplications] = useState(0);
  const [jd, setJd] = useState("");
  
  // Dashboard analytics state
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await apiGetDashboardOverview();
        setDashboardStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleResumeClick = async (resume) => {
    window.open(resume.url, "_blank");
  };

  const handleNotificationClick = () => {
    navigate('/hr-dashboard/applicants');
    setUnreadApplications(0);
  };

  // Show overview by default
  const isOverviewPage = location.pathname === '/hr-dashboard' || 
                         location.pathname === '/hr-dashboard/overview' ||
                         location.pathname.endsWith('/hr-dashboard');

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="talentparse-dashboard">
      {/* Integrated Header with Navigation */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="brand-logo">
            <div className="logo-icon">🎯</div>
            <h1 className="brand-name">TalentParse AI</h1>
          </div>
          <div className="welcome-section">
            <h2 className="welcome-title">Welcome! {user?.displayName || 'HR Manager'}</h2>
            <p className="welcome-subtitle">Hiring made intelligent.</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="search-container">
            <input type="text" className="header-search" placeholder="Search candidates..." />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="notification-bell" onClick={handleNotificationClick}>
            <span className="bell-icon">🔔</span>
            {unreadApplications > 0 && (
              <span className="notification-badge">{unreadApplications}</span>
            )}
          </div>
          
          <div className="user-profile">
            <img 
              src={user?.photoURL || '/default-avatar.png'} 
              alt="Profile" 
              className="profile-avatar"
            />
            <span className="profile-name">{user?.displayName || 'HR Manager'}</span>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar Navigation */}
        <nav className="dashboard-sidebar">
          <div className="nav-section">
            <h3 className="nav-title">General</h3>
            <NavLink to="/hr-dashboard/overview" className={({ isActive }) => `nav-item ${isActive || isOverviewPage ? 'active' : ''}`}>
              <span className="nav-icon">📊</span>
              Overview
            </NavLink>
          </div>
          
          <div className="nav-section">
            <h3 className="nav-title">Reports</h3>
            <NavLink to="/hr-dashboard/applicants" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">👥</span>
              Applicants
              {unreadApplications > 0 && <span className="nav-badge">{unreadApplications}</span>}
            </NavLink>
            <NavLink to="/hr-dashboard/upload" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📁</span>
              Upload
            </NavLink>
            <NavLink to="/hr-dashboard/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📈</span>
              Analytics
            </NavLink>
            <NavLink to="/hr-dashboard/jobs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">💼</span>
              Jobs
            </NavLink>
          </div>
          
          <div className="nav-section">
            <h3 className="nav-title">Settings</h3>
            <NavLink to="/hr-dashboard/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">🔧</span>
              Search
            </NavLink>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="dashboard-main">
          {isOverviewPage ? (
            <div className="dashboard-overview">
              {/* Current Risk Score equivalent */}
              <div className="overview-header">
                <div className="risk-score-section">
                  <h3>Current Status</h3>
                  <p className="status-time">Daily ▼</p>
                </div>
                
                <div className="risk-score-card">
                  <div className="risk-score-circle">
                    <div className="score-number">{dashboardStats?.resumeStats.averageMatchScore.toFixed(0) || 0}</div>
                    <div className="score-label">Score</div>
                  </div>
                  <div className="score-indicators">
                    <div className="score-range good">Good</div>
                    <div className="score-range high">High</div>
                    <div className="score-range max">Max</div>
                  </div>
                </div>
              </div>

              {/* Key Metrics Cards - replacing the colored metric cards */}
              <div className="metrics-grid">
                <div className="metric-card metric-applications">
                  <div className="metric-icon">📄</div>
                  <div className="metric-content">
                    <div className="metric-number">{dashboardStats?.resumeStats.totalResumes || 0}</div>
                    <div className="metric-label">Total Applications</div>
                  </div>
                </div>
                
                <div className="metric-card metric-interviews">
                  <div className="metric-icon">🎯</div>
                  <div className="metric-content">
                    <div className="metric-number">{dashboardStats?.userStats.hr || 0}</div>
                    <div className="metric-label">Interviews Scheduled</div>
                  </div>
                </div>
                
                <div className="metric-card metric-jobs">
                  <div className="metric-icon">💼</div>
                  <div className="metric-content">
                    <div className="metric-number">{dashboardStats?.userStats.admin || 0}</div>
                    <div className="metric-label">Active Job Postings</div>
                  </div>
                </div>
                
                <div className="metric-card metric-score">
                  <div className="metric-icon">⭐</div>
                  <div className="metric-content">
                    <div className="metric-number">{dashboardStats?.resumeStats.averageMatchScore.toFixed(0) || 0}%</div>
                    <div className="metric-label">Avg Match Score</div>
                  </div>
                </div>
              </div>

              {/* Analytics Charts Row */}
              <div className="charts-row">
                {/* Main chart area - Applications over time */}
                <div className="chart-container main-chart">
                  <div className="chart-header">
                    <h3>Application Summary</h3>
                    <select className="chart-filter">
                      <option>Yearly</option>
                      <option>Monthly</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <div className="chart-content">
                    <LineCard title="Popular Skills" points={dashboardStats?.resumeStats.topSkills.map(s => ({ label: s.skill, value: s.count })) || []} />
                  </div>
                </div>

                {/* Side charts */}
                <div className="side-charts">
                  <div className="chart-container side-chart">
                    <div className="chart-header">
                      <h4>Applications by Department</h4>
                    </div>
                    <div className="chart-content">
                      <DoughnutCard title="Applications by Department" dataMap={{}} />
                    </div>
                  </div>
                  
                  <div className="chart-container side-chart">
                    <div className="chart-header">
                      <h4>Application Status</h4>
                    </div>
                    <div className="status-breakdown">
                      <div className="status-item">
                        <span className="status-indicator pending"></span>
                        <span className="status-label">Pending Review</span>
                        <span className="status-count">{dashboardStats?.resumeStats.unprocessedResumes || 0}</span>
                      </div>
                      <div className="status-item">
                        <span className="status-indicator approved"></span>
                        <span className="status-label">Interviews</span>
                        <span className="status-count">{dashboardStats?.userStats.hr || 0}</span>
                      </div>
                      <div className="status-item">
                        <span className="status-indicator rejected"></span>
                        <span className="status-label">Rejected</span>
                        <span className="status-count">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Applicants Section */}
              <div className="recent-applicants">
                <h3>Recent Applicants</h3>
                <div className="applicant-list">
                  {dashboardStats?.recentActivity.map((activity) => (
                    <div key={activity.id} className="applicant-card">
                      <div className="applicant-info">
                        <span className="applicant-name">{activity.fileName}</span>
                        <span className="applicant-status">{activity.status}</span>
                      </div>
                      <span className="applicant-time">{new Date(activity.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Outlet context={{
              resumes,
              handleResumeClick,
              jd,
              dashboardStats
            }} />
          )}
        </main>
      </div>
    </div>
  );
}