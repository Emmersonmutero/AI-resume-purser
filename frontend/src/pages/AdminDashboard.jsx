import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

// Placeholder components for admin routes
const AdminOverview = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">System Administration</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Total Users</h3>
        <p className="text-3xl font-bold text-blue-600">1,234</p>
        <p className="text-sm text-gray-600">+12% this month</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Total Resumes</h3>
        <p className="text-3xl font-bold text-green-600">5,678</p>
        <p className="text-sm text-gray-600">+8% this month</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">System Health</h3>
        <p className="text-3xl font-bold text-green-600">98.5%</p>
        <p className="text-sm text-gray-600">Uptime</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Storage Usage</h3>
        <p className="text-3xl font-bold text-orange-600">75%</p>
        <p className="text-sm text-gray-600">2.1GB / 3.0GB</p>
      </div>
    </div>
    
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">New user registration</span>
            <span className="text-xs text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Resume uploaded</span>
            <span className="text-xs text-gray-500">5 minutes ago</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">System backup completed</span>
            <span className="text-xs text-gray-500">1 hour ago</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Database</span>
            <span className="text-xs text-green-600 font-semibold">Healthy</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">API Services</span>
            <span className="text-xs text-green-600 font-semibold">Online</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Background Jobs</span>
            <span className="text-xs text-green-600 font-semibold">Running</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AdminUsers = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">User Management</h2>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">User management interface coming soon...</p>
    </div>
  </div>
);

const AdminSystem = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">System Management</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">System Operations</h3>
        <div className="space-y-3">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Reindex All Resumes
          </button>
          <button className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700">
            Clear Cache
          </button>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
            Backup Database
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">System Logs</h3>
        <div className="bg-gray-100 p-4 rounded text-sm font-mono">
          <div>2024-01-15 10:30:15 - INFO - System started</div>
          <div>2024-01-15 10:30:16 - INFO - Database connected</div>
          <div>2024-01-15 10:30:17 - INFO - API server listening on port 8000</div>
          <div>2024-01-15 10:35:22 - INFO - New user registered</div>
          <div>2024-01-15 10:42:33 - INFO - Resume processing completed</div>
        </div>
      </div>
    </div>
  </div>
);

const AdminAnalytics = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">System Analytics</h2>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Advanced analytics dashboard coming soon...</p>
    </div>
  </div>
);

// Navigation links for admins
const ADMIN_NAV_LINKS = [
  { to: '/admin-dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/admin-dashboard/users', label: 'User Management', icon: '👥' },
  { to: '/admin-dashboard/system', label: 'System', icon: '⚙️' },
  { to: '/admin-dashboard/analytics', label: 'Analytics', icon: '📊' }
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar links={ADMIN_NAV_LINKS} />
        <main className="flex-1 ml-64">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="system" element={<AdminSystem />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
