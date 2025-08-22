import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/CandidateDashboard.css';

// Job Applications component
const CandidateOverview = () => {
  const [applications, setApplications] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(85);
  
  // Mock data for available jobs
  const availableJobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp',
      department: 'Engineering',
      matchScore: 92,
      requirements: ['React', 'JavaScript', 'CSS'],
      postedDate: '2 days ago'
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      company: 'DesignStudio',
      department: 'Design',
      matchScore: 78,
      requirements: ['Figma', 'Adobe XD', 'Prototyping'],
      postedDate: '5 days ago'
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      department: 'Engineering',
      matchScore: 85,
      requirements: ['Node.js', 'React', 'MongoDB'],
      postedDate: '1 week ago'
    }
  ];

  const handleApplyToJob = (jobId) => {
    alert(`Applied to job ${jobId}!`);
    // TODO: Implement actual application logic
  };

  return (
    <div className="candidate-overview">
      <div className="overview-header">
        <h2>Hello Tayo 👋</h2>
        <p>Ready to find your next opportunity?</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-staff">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">128</div>
            <div className="stat-label">Number of staff</div>
          </div>
        </div>
        
        <div className="stat-card stat-issues">
          <div className="stat-icon">🔍</div>
          <div className="stat-content">
            <div className="stat-number">16</div>
            <div className="stat-label">Average job Issues</div>
          </div>
        </div>
        
        <div className="stat-card stat-requests">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-number">21</div>
            <div className="stat-label">Profile update request</div>
          </div>
        </div>
        
        <div className="stat-card stat-date">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-number">25th Jun</div>
            <div className="stat-label">Next interview</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Available Jobs */}
        <div className="content-section jobs-section">
          <div className="section-header">
            <h3>Available Jobs</h3>
            <span className="view-all">See all openings</span>
          </div>
          
          <div className="jobs-list">
            {availableJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h4>{job.title}</h4>
                  <span className="match-score">{job.matchScore}% match</span>
                </div>
                <p className="job-company">{job.company} • {job.department}</p>
                <div className="job-requirements">
                  {job.requirements.slice(0, 3).map(req => (
                    <span key={req} className="requirement-tag">{req}</span>
                  ))}
                </div>
                <div className="job-footer">
                  <span className="job-date">{job.postedDate}</span>
                  <button 
                    className="apply-btn"
                    onClick={() => handleApplyToJob(job.id)}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Completion */}
        <div className="content-section profile-section">
          <div className="section-header">
            <h3>Profile Progress</h3>
            <span className="completion-rate">{profileCompletion}%</span>
          </div>
          
          <div className="progress-chart">
            <div className="progress-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="8"
                  strokeDasharray={`${profileCompletion * 2.83} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="progress-text">
                <span className="progress-number">{profileCompletion}%</span>
                <span className="progress-label">Complete</span>
              </div>
            </div>
          </div>
          
          <div className="progress-tasks">
            <div className="task-item completed">
              <span className="task-check">✓</span>
              <span>Upload Resume</span>
            </div>
            <div className="task-item completed">
              <span className="task-check">✓</span>
              <span>Add Skills</span>
            </div>
            <div className="task-item">
              <span className="task-check">○</span>
              <span>Complete Profile</span>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="content-section applications-section">
          <div className="section-header">
            <h3>Recent Applications</h3>
            <span className="view-all">View all</span>
          </div>
          
          <div className="applications-list">
            <div className="application-item">
              <div className="app-info">
                <h4>Senior Developer</h4>
                <p>TechCorp • Applied 2 days ago</p>
              </div>
              <span className="app-status status-pending">Under Review</span>
            </div>
            <div className="application-item">
              <div className="app-info">
                <h4>UI Designer</h4>
                <p>DesignStudio • Applied 1 week ago</p>
              </div>
              <span className="app-status status-interview">Interview Scheduled</span>
            </div>
            <div className="application-item">
              <div className="app-info">
                <h4>Product Manager</h4>
                <p>StartupXYZ • Applied 2 weeks ago</p>
              </div>
              <span className="app-status status-rejected">Not Selected</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="content-section notifications-section">
          <div className="section-header">
            <h3>Notifications</h3>
          </div>
          
          <div className="notification-banner">
            <div className="notification-content">
              <h4>Interview Invitation!</h4>
              <p>You have been invited for an interview at TechCorp for the Senior Developer position. Please confirm your availability.</p>
              <button className="confirm-btn">Confirm Interview</button>
            </div>
            <div className="notification-icon">🎉</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Other placeholder components remain the same for now
const CandidateProfile = () => (
  <div className="page-content">
    <h2>My Profile</h2>
    <div className="content-card">
      <p>Profile management coming soon...</p>
    </div>
  </div>
);

const CandidateApplications = () => (
  <div className="page-content">
    <h2>My Applications</h2>
    <div className="content-card">
      <p>Application history coming soon...</p>
    </div>
  </div>
);

const CandidateJobs = () => (
  <div className="page-content">
    <h2>Job Search</h2>
    <div className="content-card">
      <p>Job search coming soon...</p>
    </div>
  </div>
);

// Navigation links for candidates
const CANDIDATE_NAV_LINKS = [
  { to: '/candidate-dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/candidate-dashboard/profile', label: 'My Profile', icon: '👤' },
  { to: '/candidate-dashboard/applications', label: 'Applications', icon: '📄' },
  { to: '/candidate-dashboard/jobs', label: 'Find Jobs', icon: '🔍' }
];

export default function CandidateDashboard() {
  const { user } = useAuth();

  return (
    <div className="candidate-dashboard">
      {/* Sidebar Navigation */}
      <nav className="candidate-sidebar">
        <div className="sidebar-header">
          <div className="brand-logo">
            <div className="logo-icon">🎯</div>
            <h1 className="brand-name">TalentParse</h1>
          </div>
        </div>
        
        <div className="nav-menu">
          <div className="nav-section">
            <h3 className="section-title">Main</h3>
            <NavLink to="/candidate-dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📊</span>
              Dashboard
            </NavLink>
            <NavLink to="/candidate-dashboard/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">👤</span>
              My Profile
            </NavLink>
          </div>
          
          <div className="nav-section">
            <h3 className="section-title">Job Search</h3>
            <NavLink to="/candidate-dashboard/jobs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">🔍</span>
              Find Jobs
            </NavLink>
            <NavLink to="/candidate-dashboard/applications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📋</span>
              My Applications
            </NavLink>
            <NavLink to="/candidate-dashboard/interviews" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">🎯</span>
              Interviews
            </NavLink>
          </div>
          
          <div className="nav-section">
            <h3 className="section-title">Tools</h3>
            <NavLink to="/candidate-dashboard/resume-builder" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📄</span>
              Resume Builder
            </NavLink>
            <NavLink to="/candidate-dashboard/skill-tests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">🧠</span>
              Skill Tests
            </NavLink>
            <NavLink to="/candidate-dashboard/career-advice" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">💡</span>
              Career Advice
            </NavLink>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'C'}
                </div>
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.displayName || 'Candidate'}</span>
              <span className="user-role">Job Seeker</span>
            </div>
            <button className="settings-btn" title="Settings">
              <span>⚙️</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="candidate-main">
        <Routes>
          <Route index element={<CandidateOverview />} />
          <Route path="profile" element={<CandidateProfile />} />
          <Route path="applications" element={<CandidateApplications />} />
          <Route path="jobs" element={<CandidateJobs />} />
          <Route path="*" element={<Navigate to="/candidate-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
