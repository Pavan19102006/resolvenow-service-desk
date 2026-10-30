import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import ComplaintList from './components/ComplaintList';
import NewComplaintModal from './components/NewComplaintModal';
import AuthModal from './components/AuthModal';
import ArchitectureModal from './components/ArchitectureModal';
import {
  Plus,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Database,
  ExternalLink
} from 'lucide-react';
import {
  api,
  getToken,
  setToken,
  getCurrentUser,
  setCurrentUser,
  getBaseUrl
} from './services/api';

export default function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [token, setTokenState] = useState(getToken());
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isArchOpen, setIsArchOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Dark mode
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load complaints
  const loadComplaints = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.complaints.getAll();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 401) {
        // Token expired or invalid
        handleLogout();
        setError('Your session has expired. Please sign in again.');
      } else {
        setError(err.message || 'Failed to fetch complaints.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!token || !user?.id) return;
    try {
      const data = await api.notifications.getByUser(user.id);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not fetch notifications:', err.message);
    }
  }, [token, user?.id]);

  // Refresh all
  const refreshAll = useCallback(() => {
    loadComplaints();
    loadNotifications();
  }, [loadComplaints, loadNotifications]);

  useEffect(() => {
    if (token) {
      refreshAll();
      const interval = setInterval(refreshAll, 12000);
      return () => clearInterval(interval);
    }
  }, [token, refreshAll]);

  const handleAuthSuccess = (userData, jwtToken) => {
    setUser(userData);
    setTokenState(jwtToken);
    setError(null);
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setUser(null);
    setTokenState(null);
    setComplaints([]);
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenArchitecture={() => setIsArchOpen(true)}
        notifications={notifications}
        onRefreshNotifications={loadNotifications}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onSelectComplaint={(id) => setSelectedComplaintId(id)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner if not signed in */}
        {!token && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                Full-Stack Cloud Connected
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Welcome to ResolveNow Service Desk
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl">
                Integrated with live Spring Cloud microservices on Render & PostgreSQL. Sign in or
                create an account with 1-click test credentials to lodge complaints and track
                automated departmental routing.
              </p>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg shadow-black/20 flex items-center space-x-2 transition-transform transform active:scale-95 flex-shrink-0"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Global Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={refreshAll}
              className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/60 font-semibold text-[11px] hover:bg-rose-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard KPIs */}
        <DashboardStats
          complaints={complaints}
          onFilterStatus={(status) => {
            // Optional quick filter trigger
          }}
        />

        {/* Main Section Header with Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Customer Grievances & Service Tickets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live tickets processed through Gateway and auto-assigned by the Assignment microservice
            </p>
          </div>

          <div className="flex items-center space-x-2.5 self-start sm:self-auto">
            <button
              onClick={refreshAll}
              disabled={loading}
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1.5"
              title="Refresh tickets"
            >
              <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => {
                if (!token) {
                  setIsAuthOpen(true);
                } else {
                  setIsNewComplaintOpen(true);
                }
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all flex items-center space-x-1.5 transform active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Lodge New Complaint</span>
            </button>
          </div>
        </div>

        {/* Complaints Listing */}
        <ComplaintList
          complaints={complaints}
          onRefresh={refreshAll}
          selectedComplaintId={selectedComplaintId}
          onSelectComplaint={(id) => setSelectedComplaintId(id)}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">ResolveNow</span>
            <span>—</span>
            <span>Spring Boot 3.2.0 Microservices Architecture</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <button
              onClick={() => setIsArchOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
            >
              Architecture & API Spec
            </button>
            <a
              href="https://resolvenow-service-desk.onrender.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-medium"
            >
              <span>Live Render Backend</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewComplaintModal
        isOpen={isNewComplaintOpen}
        onClose={() => setIsNewComplaintOpen(false)}
        onSuccess={() => {
          refreshAll();
        }}
        user={user}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ArchitectureModal
        isOpen={isArchOpen}
        onClose={() => setIsArchOpen(false)}
      />
    </div>
  );
}
