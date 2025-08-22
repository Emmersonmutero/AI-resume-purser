import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './NotificationBell.css';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Mock notifications for demo (replace with actual API calls)
  const mockNotifications = [
    {
      id: '1',
      type: 'new_application',
      title: 'New Job Application',
      message: 'Sarah Johnson applied for Senior Developer position',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      read: false,
      data: { applicant_name: 'Sarah Johnson', job_title: 'Senior Developer' }
    },
    {
      id: '2',
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: 'Interview with John Smith scheduled for tomorrow at 2 PM',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      read: false,
      data: { candidate_name: 'John Smith', interview_time: '2 PM' }
    },
    {
      id: '3',
      type: 'application_status',
      title: 'Application Status Update',
      message: 'Your application for Product Manager position has been reviewed',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      read: true,
      data: { job_title: 'Product Manager' }
    }
  ];

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/notifications', {
      //   headers: {
      //     'Authorization': `Bearer ${await user.getIdToken()}`
      //   }
      // });
      // const data = await response.json();
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // TODO: API call to mark as read
      // await fetch(`/api/notifications/${notificationId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${await user.getIdToken()}`
      //   },
      //   body: JSON.stringify({ read: true })
      // });

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: API call to mark all as read
      // await fetch('/api/notifications/mark-all-read', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${await user.getIdToken()}`
      //   }
      // });

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      new_application: '📝',
      interview_scheduled: '📅',
      application_status: '📢',
      resume_parsed: '🤖',
      job_posted: '💼',
      default: '🔔'
    };
    return icons[type] || icons.default;
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!user) return null;

  return (
    <div className="notification-bell-container">
      <button
        ref={buttonRef}
        className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''} ${isOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
        aria-label={`${unreadCount} unread notifications`}
        title="Notifications"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="bell-icon"
        >
          <path 
            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M13.73 21a2 2 0 0 1-3.46 0" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="notification-badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="notification-dropdown">
          <div className="notification-header">
            <h3 className="notification-title">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <div className="loading-spinner"></div>
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <div className="no-notifications-icon">🔔</div>
                <p>No notifications yet</p>
                <span>We'll notify you when something happens</span>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-text">
                        <h4 className="notification-item-title">
                          {notification.title}
                        </h4>
                        <p className="notification-message">
                          {notification.message}
                        </p>
                      </div>
                      <div className="notification-meta">
                        <span className="notification-time">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        {!notification.read && (
                          <span className="unread-dot" aria-hidden="true"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {notifications.length > 5 && (
                  <div className="notification-footer">
                    <button className="view-all-btn">
                      View all notifications
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
