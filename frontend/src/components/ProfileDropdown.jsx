import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfileDropdown.css';

const ProfileDropdown = () => {
  const { user, profile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="profile-dropdown__toggle">
        <img 
          src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
          alt="User Avatar"
          className="profile-dropdown__avatar"
        />
        <span className="profile-dropdown__username">{profile?.name || user.email}</span>
        <svg className={`profile-dropdown__caret ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className="profile-dropdown__menu">
          <div className="profile-dropdown__header">
            <span className="profile-dropdown__name">{profile?.name || 'User'}</span>
            <span className="profile-dropdown__role">{profile?.role || 'Guest'}</span>
          </div>
          <div className="profile-dropdown__body">
            <a href="/user-profile" className="profile-dropdown__item">Profile</a>
            <a href="/settings" className="profile-dropdown__item">Settings</a>
          </div>
          <div className="profile-dropdown__footer">
            <button onClick={handleLogout} className="profile-dropdown__item profile-dropdown__logout">
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
