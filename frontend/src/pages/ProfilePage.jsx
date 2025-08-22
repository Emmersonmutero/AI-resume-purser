import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfilePage.css';
import { apiGetUserUploadHistory } from '../services/api';

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(user.email || '');
      setNotificationsEnabled(profile.notificationsEnabled || false);
    }
  }, [profile, user]);

  useEffect(() => {
    const fetchUploadHistory = async () => {
      try {
        const history = await apiGetUserUploadHistory();
        setUploadHistory(history);
      } catch (error) {
        console.error('Failed to fetch upload history:', error);
      }
    };

    fetchUploadHistory();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, notificationsEnabled });
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="profile-page">
      <h1>Profile Management</h1>
      <div className="profile-page__content">
        <div className="profile-page__form-container">
          <h2>Personal Information</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
              />
            </div>
            <button type="submit" className="btn btn-primary">Update Profile</button>
          </form>
        </div>
        <div className="profile-page__form-container">
          <h2>Notification Preferences</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                />
                Enable email notifications
              </label>
            </div>
            <button type="submit" className="btn btn-primary">Update Preferences</button>
          </form>
        </div>
        <div className="profile-page__form-container">
          <h2>Resume Upload History</h2>
          <div className="upload-history">
            {uploadHistory.length === 0 ? (
              <p>No resumes uploaded yet.</p>
            ) : (
              <ul>
                {uploadHistory.map((item) => (
                  <li key={item.id}>
                    <span className="file-name">{item.fileName}</span>
                    <span className="upload-date">{new Date(item.uploadedAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;