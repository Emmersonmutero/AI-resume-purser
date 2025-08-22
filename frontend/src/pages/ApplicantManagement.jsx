import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import '../styles/ApplicantManagement.css';

export default function ApplicantManagement() {
  const { resumes, handleResumeClick } = useOutletContext();
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('matchScore');

  // Filter and sort applicants
  const filteredApplicants = resumes
    .filter(resume => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'high-match') return resume.matchScore > 70;
      if (filterStatus === 'medium-match') return resume.matchScore >= 40 && resume.matchScore <= 70;
      if (filterStatus === 'low-match') return resume.matchScore < 40;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'matchScore') return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortBy === 'uploadDate') return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      if (sortBy === 'name') {
        const nameA = a.parsedResume?.contact?.fullName || 'Unknown';
        const nameB = b.parsedResume?.contact?.fullName || 'Unknown';
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

  const handleScheduleInterview = (applicant) => {
    // TODO: Implement interview scheduling
    alert(`Interview scheduled for ${applicant.parsedResume?.contact?.fullName || 'Applicant'}`);
  };

  const handleRejectApplicant = (applicant) => {
    // TODO: Implement applicant rejection
    alert(`Rejected ${applicant.parsedResume?.contact?.fullName || 'Applicant'}`);
  };

  const getMatchScoreColor = (score) => {
    if (score >= 70) return '#10b981'; // green
    if (score >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getStatusBadge = (score) => {
    if (score >= 70) return { text: 'High Match', class: 'status-high' };
    if (score >= 40) return { text: 'Medium Match', class: 'status-medium' };
    return { text: 'Low Match', class: 'status-low' };
  };

  return (
    <div className="applicant-management">
      <div className="applicant-header">
        <h2>Applicant Management</h2>
        <p>Manage candidates with parsed resume data and schedule interviews</p>
      </div>

      <div className="applicant-filters">
        <div className="filter-group">
          <label>Filter by Match Score:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Applicants</option>
            <option value="high-match">High Match (70%+)</option>
            <option value="medium-match">Medium Match (40-70%)</option>
            <option value="low-match">Low Match (under 40%)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="matchScore">Match Score</option>
            <option value="uploadDate">Upload Date</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="applicant-stats">
          <span className="stat-item">
            Total: <strong>{resumes.length}</strong>
          </span>
          <span className="stat-item">
            High Match: <strong>{resumes.filter(r => r.matchScore >= 70).length}</strong>
          </span>
        </div>
      </div>

      <div className="applicant-layout">
        <div className="applicant-list">
          {filteredApplicants.length === 0 ? (
            <div className="no-applicants">
              <p>No applicants found matching your criteria.</p>
            </div>
          ) : (
            filteredApplicants.map(applicant => {
              const contact = applicant.parsedResume?.contact || {};
              const status = getStatusBadge(applicant.matchScore);
              
              return (
                <div 
                  key={applicant.id}
                  className={`applicant-card ${selectedApplicant?.id === applicant.id ? 'selected' : ''}`}
                  onClick={() => setSelectedApplicant(applicant)}
                >
                  <div className="applicant-card-header">
                    <h3>{contact.fullName || 'Unknown Name'}</h3>
                    <span className={`status-badge ${status.class}`}>
                      {status.text}
                    </span>
                  </div>
                  
                  <div className="applicant-card-info">
                    <p className="email">{contact.email || 'No email provided'}</p>
                    <p className="phone">{contact.phone || 'No phone provided'}</p>
                    
                    <div className="match-score-bar">
                      <div className="match-score-label">
                        Match Score: <strong>{applicant.matchScore || 0}%</strong>
                      </div>
                      <div className="match-score-progress">
                        <div 
                          className="match-score-fill"
                          style={{ 
                            width: `${applicant.matchScore || 0}%`,
                            backgroundColor: getMatchScoreColor(applicant.matchScore)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="applicant-card-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResumeClick(applicant);
                      }}
                    >
                      View Resume
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {selectedApplicant && (
          <div className="applicant-details">
            <div className="details-header">
              <h3>{selectedApplicant.parsedResume?.contact?.fullName || 'Unknown Name'}</h3>
              <button 
                className="close-details"
                onClick={() => setSelectedApplicant(null)}
              >
                ×
              </button>
            </div>

            <div className="details-content">
              <div className="detail-section">
                <h4>Contact Information</h4>
                <div className="detail-grid">
                  <div><strong>Email:</strong> {selectedApplicant.parsedResume?.contact?.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {selectedApplicant.parsedResume?.contact?.phone || 'N/A'}</div>
                  <div><strong>Location:</strong> {selectedApplicant.parsedResume?.contact?.location || 'N/A'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Skills</h4>
                <div className="skills-list">
                  {selectedApplicant.parsedResume?.skills?.length > 0 ? 
                    selectedApplicant.parsedResume.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    )) : 
                    <p>No skills extracted</p>
                  }
                </div>
              </div>

              <div className="detail-section">
                <h4>Experience</h4>
                {selectedApplicant.parsedResume?.experience?.length > 0 ? 
                  selectedApplicant.parsedResume.experience.map((exp, index) => (
                    <div key={index} className="experience-item">
                      <h5>{exp.jobTitle} at {exp.company}</h5>
                      <p className="experience-duration">{exp.duration}</p>
                      <p className="experience-description">{exp.description}</p>
                    </div>
                  )) :
                  <p>No experience data extracted</p>
                }
              </div>

              <div className="detail-section">
                <h4>Education</h4>
                {selectedApplicant.parsedResume?.education?.length > 0 ? 
                  selectedApplicant.parsedResume.education.map((edu, index) => (
                    <div key={index} className="education-item">
                      <h5>{edu.degree} in {edu.fieldOfStudy}</h5>
                      <p>{edu.school} ({edu.year})</p>
                    </div>
                  )) :
                  <p>No education data extracted</p>
                }
              </div>

              <div className="detail-actions">
                <button 
                  className="btn btn-success"
                  onClick={() => handleScheduleInterview(selectedApplicant)}
                >
                  Schedule Interview
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleRejectApplicant(selectedApplicant)}
                >
                  Reject Candidate
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleResumeClick(selectedApplicant)}
                >
                  View Original Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
