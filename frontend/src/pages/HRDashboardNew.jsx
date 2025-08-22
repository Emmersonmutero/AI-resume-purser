// src/pages/HRDashboardNew.jsx - Hiring Analytics Dashboard
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/HRDashboard.css";

export default function HRDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Dashboard analytics state - hiring focused
  const [dashboardStats, setDashboardStats] = useState({
    totalApplications: 128,
    newApplications: 16,
    interviewScheduled: 21,
    nextStepDue: 25,
    hiringScore: 741
  });
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "new_application",
      title: "New Job Application",
      message: "Sarah Johnson applied for Senior Developer position",
      created_at: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      type: "interview_scheduled",
      title: "Interview Scheduled",
      message: "Interview scheduled with John Doe for tomorrow",
      created_at: new Date().toISOString(),
      read: false
    }
  ]);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch actual hiring analytics data
      const response = await fetch('/api/applications/stats/overview');
      if (response.ok) {
        const stats = await response.json();
        setDashboardStats({
          totalApplications: stats.total_applications,
          newApplications: stats.pending_applications,
          interviewScheduled: stats.interview_scheduled,
          nextStepDue: stats.reviewed_applications,
          hiringScore: Math.floor((stats.hired_candidates / Math.max(stats.total_applications, 1)) * 1000)
        });
      } else {
        // Fallback to mock data
        setDashboardStats({
          totalApplications: 128,
          newApplications: 16,
          interviewScheduled: 21,
          nextStepDue: 25,
          hiringScore: 741
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data
      setDashboardStats({
        totalApplications: 128,
        newApplications: 16,
        interviewScheduled: 21,
        nextStepDue: 25,
        hiringScore: 741
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Mock notification data
      // In real app, fetch from API
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const isCurrentPage = (path) => {
    return location.pathname === path || (path === '/hr-dashboard' && location.pathname === '/hr-dashboard');
  };

  const isOverviewPage = location.pathname === '/hr-dashboard' || location.pathname.endsWith('/hr-dashboard');

  return (
    <div className="vertex-guard-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">🎯</div>
            <div className="logo-text">
              <h2>TalentFlow</h2>
              <span className="tagline">Smart Hiring</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>General</h3>
            <NavLink 
              to="/hr-dashboard" 
              className={`nav-item ${isCurrentPage('/hr-dashboard') ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span> 
              <span className="nav-text">Overview</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <h3>Hiring</h3>
            <NavLink 
              to="/hr-dashboard/jobs" 
              className={`nav-item ${isCurrentPage('/hr-dashboard/jobs') ? 'active' : ''}`}
            >
              <span className="nav-icon">💼</span> 
              <span className="nav-text">Job Postings</span>
            </NavLink>
            <NavLink 
              to="/hr-dashboard/applicants" 
              className={`nav-item ${isCurrentPage('/hr-dashboard/applicants') ? 'active' : ''}`}
            >
              <span className="nav-icon">👥</span> 
              <span className="nav-text">Candidate Analytics</span>
            </NavLink>
            <NavLink 
              to="/hr-dashboard/upload" 
              className={`nav-item ${isCurrentPage('/hr-dashboard/upload') ? 'active' : ''}`}
            >
              <span className="nav-icon">📄</span> 
              <span className="nav-text">Resume Parser</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <h3>Reports</h3>
            <NavLink 
              to="/hr-dashboard/analytics" 
              className={`nav-item ${isCurrentPage('/hr-dashboard/analytics') ? 'active' : ''}`}
            >
              <span className="nav-icon">📈</span> 
              <span className="nav-text">Hiring Analytics</span>
            </NavLink>
            <NavLink 
              to="/hr-dashboard/search" 
              className={`nav-item ${isCurrentPage('/hr-dashboard/search') ? 'active' : ''}`}
            >
              <span className="nav-icon">🔍</span> 
              <span className="nav-text">Talent Search</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <h3>Settings</h3>
            <NavLink 
              to="/hr-dashboard/settings" 
              className={`nav-item ${isCurrentPage('/hr-dashboard/settings') ? 'active' : ''}`}
            >
              <span className="nav-icon">⚙️</span> 
              <span className="nav-text">Settings</span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.displayName || "Kathryn Murphy"}</span>
              <span className="user-role">Building the best teams</span>
            </div>
          </div>
          <button onClick={logout} className="logout-btn" title="Log Out">
            <span>🔓</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Current Hiring Status</h1>
            <p className="header-subtitle">Monitor your recruitment pipeline and candidate analytics</p>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <input type="text" placeholder="Search Here..." />
              <button className="search-btn">🔍</button>
            </div>
            
            <div className="notification-container">
              <button 
                className={`notification-btn ${notifications.filter(n => !n.read).length > 0 ? 'has-notifications' : ''}`}
                onClick={toggleNotifications}
                title="Notifications"
              >
                <span>🔔</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="notification-badge">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="dropdown-header">
                    <h3>Notifications</h3>
                    <button 
                      className="close-btn"
                      onClick={() => setShowNotifications(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="notifications-list">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        >
                          <div className="notification-icon">
                            {notification.type === 'new_application' ? '📝' : '📢'}
                          </div>
                          <div className="notification-content">
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                            <span className="notification-time">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="profile-info">
              <div className="status-indicator online" title="Online"></div>
              <span className="profile-name">Zoe M.</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Overview Dashboard - only show on main dashboard route */}
          {isOverviewPage && (
            <div className="dashboard-overview">
              {/* Main Stats Cards - Hiring Analytics */}
              <div className="stats-grid">
                <div className="stat-card total-applications">
                  <div className="stat-header">
                    <div className="stat-icon">📋</div>
                    <div className="stat-menu">⋯</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-percentage">{dashboardStats.totalApplications}</div>
                    <div className="stat-label">Total Applications</div>
                  </div>
                </div>
                
                <div className="stat-card new-applications">
                  <div className="stat-header">
                    <div className="stat-icon">📧</div>
                    <div className="stat-menu">⋯</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-percentage">{dashboardStats.newApplications}</div>
                    <div className="stat-label">New Applications</div>
                  </div>
                </div>
                
                <div className="stat-card interviews-scheduled">
                  <div className="stat-header">
                    <div className="stat-icon">🎭</div>
                    <div className="stat-menu">⋯</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-percentage">{dashboardStats.interviewScheduled}</div>
                    <div className="stat-label">Interviews Scheduled</div>
                  </div>
                </div>
                
                <div className="stat-card pending-review">
                  <div className="stat-header">
                    <div className="stat-icon">👁️</div>
                    <div className="stat-menu">⋯</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-percentage">{dashboardStats.nextStepDue}</div>
                    <div className="stat-label">Pending Review</div>
                  </div>
                </div>
                
                <div className="stat-card top-candidates">
                  <div className="stat-header">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-menu">⋯</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-percentage">12</div>
                    <div className="stat-label">Top Candidates</div>
                  </div>
                </div>
              </div>

              {/* Hiring Score and Charts Section */}
              <div className="analytics-section">
                <div className="hiring-score-card">
                  <div className="card-header">
                    <h3>Hiring Score</h3>
                    <div className="score-menu">⋯</div>
                  </div>
                  <div className="hiring-score-content">
                    <div className="score-circle">
                      <div className="score-number">{dashboardStats.hiringScore}</div>
                      <div className="score-indicators">
                        <div className="indicator low">0</div>
                        <div className="indicator medium">500</div>
                        <div className="indicator high">1000</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hiring-summary-card">
                  <div className="card-header">
                    <h3>Application Summary</h3>
                    <div className="time-filter">
                      <select>
                        <option>Yearly</option>
                        <option>Monthly</option>
                        <option>Weekly</option>
                      </select>
                    </div>
                  </div>
                  <div className="hiring-chart">
                    <div className="chart-placeholder">
                      <div className="chart-line"></div>
                      <div className="chart-points">
                        <div className="point" style={{left: '10%', top: '60%'}}></div>
                        <div className="point" style={{left: '25%', top: '40%'}}></div>
                        <div className="point" style={{left: '50%', top: '30%'}}></div>
                        <div className="point" style={{left: '75%', top: '50%'}}></div>
                        <div className="point" style={{left: '90%', top: '20%'}}></div>
                      </div>
                    </div>
                    <div className="chart-stats">
                      <div className="stat-item">
                        <span className="stat-count">45</span>
                        <span className="stat-label">Jan</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-count">62</span>
                        <span className="stat-label">Feb</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-count">58</span>
                        <span className="stat-label">Mar</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="candidates-by-status">
                  <div className="card-header">
                    <h3>Candidates By Status</h3>
                    <div className="card-menu">⋯</div>
                  </div>
                  <div className="status-chart">
                    <div className="donut-chart">
                      <div className="donut-center">
                        <span className="donut-percentage">65%</span>
                      </div>
                    </div>
                    <div className="status-legend">
                      <div className="legend-item">
                        <div className="legend-color pending"></div>
                        <span>Pending</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color interview"></div>
                        <span>Interview</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color hired"></div>
                        <span>Hired</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Candidate Analytics */}
              <div className="bottom-section">
                <div className="candidate-details-card">
                  <div className="card-header">
                    <h3>Recent Applications</h3>
                    <div className="time-filter">
                      <select>
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                  </div>
                  <div className="candidate-table">
                    <div className="table-header">
                      <div className="header-cell">📅 Date</div>
                      <div className="header-cell">👤 Candidate</div>
                      <div className="header-cell">💼 Position</div>
                      <div className="header-cell">📊 Match Score</div>
                      <div className="header-cell">📋 Status</div>
                    </div>
                    <div className="table-body">
                      <div className="table-row">
                        <div className="cell">22-08-2024</div>
                        <div className="cell">Sarah Johnson</div>
                        <div className="cell">Senior Developer</div>
                        <div className="cell">92%</div>
                        <div className="cell"><span className="status-badge pending">Pending</span></div>
                      </div>
                      <div className="table-row">
                        <div className="cell">21-08-2024</div>
                        <div className="cell">John Smith</div>
                        <div className="cell">Product Manager</div>
                        <div className="cell">88%</div>
                        <div className="cell"><span className="status-badge interview">Interview</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="top-candidates">
                  <div className="card-header">
                    <h3>Top Candidates</h3>
                    <div className="card-menu">⋯</div>
                  </div>
                  <div className="candidate-list">
                    <div className="candidate-item">
                      <div className="candidate-avatar">👩‍💻</div>
                      <div className="candidate-info">
                        <div className="candidate-name">Emily Davis</div>
                        <div className="candidate-role">Frontend Developer</div>
                        <div className="candidate-match">95% match</div>
                      </div>
                    </div>
                    <div className="candidate-item">
                      <div className="candidate-avatar">👨‍💼</div>
                      <div className="candidate-info">
                        <div className="candidate-name">Michael Chen</div>
                        <div className="candidate-role">UX Designer</div>
                        <div className="candidate-match">91% match</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Nested Routes */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
