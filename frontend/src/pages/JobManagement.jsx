import React, { useState, useEffect } from 'react';
import '../styles/JobManagement.css';
import { apiGetJobs, apiCreateJob, apiUpdateJob, apiDeleteJob } from '../services/api';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await apiGetJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiCreateJob({ title, department, description, requirements: requirements.split(','), location });
      fetchJobs();
      resetForm();
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiUpdateJob(currentJob.id, { title, department, description, requirements: requirements.split(','), location });
      fetchJobs();
      resetForm();
    } catch (error) {
      console.error('Failed to update job:', error);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await apiDeleteJob(jobId);
      fetchJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const openForm = (job = null) => {
    if (job) {
      setIsEditing(true);
      setCurrentJob(job);
      setTitle(job.title);
      setDepartment(job.department);
      setDescription(job.description);
      setRequirements(job.requirements.join(', '));
      setLocation(job.location);
    } else {
      setIsEditing(false);
      resetForm();
    }
    setShowForm(true);
  };

  const resetForm = () => {
    setCurrentJob(null);
    setTitle('');
    setDepartment('');
    setDescription('');
    setRequirements('');
    setLocation('');
    setShowForm(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="job-management-page">
      <h1>Job Posting Management</h1>
      <button className="btn btn-primary" onClick={() => openForm()}>Create New Job</button>

      {showForm && (
        <div className="job-form-container">
          <h2>{isEditing ? 'Edit Job' : 'Create Job'}</h2>
          <form onSubmit={isEditing ? handleUpdate : handleCreate}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input id="department" type="text" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="requirements">Requirements (comma-separated)</label>
              <input id="requirements" type="text" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{isEditing ? 'Update' : 'Create'}</button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="job-list">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-info">
              <h3 className="job-title">{job.title}</h3>
              <p className="job-department">{job.department}</p>
            </div>
            <div className="job-status">
              <span className={`status ${job.status.toLowerCase()}`}>{job.status}</span>
            </div>
            <div className="job-actions">
              <button className="btn btn-secondary" onClick={() => openForm(job)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(job.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobManagement;