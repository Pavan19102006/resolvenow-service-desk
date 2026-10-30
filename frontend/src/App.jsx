import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import KpiCards from './components/KpiCards';
import ComplaintsTable from './components/ComplaintsTable';
import ComplaintDrawer from './components/ComplaintDrawer';
import NewComplaintModal from './components/NewComplaintModal';
import AuthModal from './components/AuthModal';
import ArchitectureModal from './components/ArchitectureModal';
import {
  api,
  getToken,
  setToken,
  getCurrentUser,
  setCurrentUser,
  getBaseUrl
} from './services/api';
import {
  AlertCircle,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const SYNC_INTERVAL_SECONDS = 5;

export default function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [token, setTokenState] = useState(getToken());
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Layout & Navigation State
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'analytics'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Slide-out Drawer for selected complaint
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Modals
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isArchOpen, setIsArchOpen] = useState(false);

  // Auto-sync timer state
  const [syncCountdown, setSyncCountdown] = useState(SYNC_INTERVAL_SECONDS);
  const [lastSynced, setLastSynced] = useState(new Date());

  // Backend URL tracker
  const [backendUrl, setBackendUrl] = useState(getBaseUrl());

  // Fetch Complaints from Backend
  const loadComplaints = useCallback(async (isSilent = false) => {
    if (!token) return;
    try {
      if (!isSilent) setLoading(true);
      setError(null);
      const data = await api.complaints.getAll();
      const list = Array.isArray(data) ? data : [];
      setComplaints(list);
      setLastSynced(new Date());

      // If drawer is currently open, keep its details updated with newest backend data
      if (selectedComplaint) {
        const updated = list.find((c) => c.id === selectedComplaint.id);
        if (updated) setSelectedComplaint(updated);
      }
    } catch (err) {
      if (err.status === 401) {
        // Session expired
        handleLogout();
        setError('Your session has expired. Please sign in again.');
      } else {
        // Network or server error
        setError(err.message || 'Cannot fetch data from backend.');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [token, selectedComplaint?.id]);

  // Fetch Notifications from Backend
  const loadNotifications = useCallback(async () => {
    if (!token || !user?.id) return;
    try {
      const data = await api.notifications.getByUser(user.id);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      // Non-critical, ignore silent warning
    }
  }, [token, user?.id]);

  // Combined Refresh
  const refreshAll = useCallback(async (isSilent = false) => {
    await Promise.all([loadComplaints(isSilent), loadNotifications()]);
    setSyncCountdown(SYNC_INTERVAL_SECONDS);
  }, [loadComplaints, loadNotifications]);

  // Periodic Auto-Sync Timer (updates backend data time to time)
  useEffect(() => {
    if (!token) return;

    // Initial load
    refreshAll(false);

    // 1-second interval to decrement countdown and auto-sync
    const timer = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          refreshAll(true);
          return SYNC_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [token, refreshAll]);

  // Handle successful login or registration
  const handleAuthSuccess = (userData, jwtToken) => {
    setUser(userData);
    setTokenState(jwtToken);
    setError(null);
    setSyncCountdown(SYNC_INTERVAL_SECONDS);
  };

  // Handle logout
  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setUser(null);
    setTokenState(null);
    setComplaints([]);
    setNotifications([]);
    setSelectedComplaint(null);
  };

  // Handle status update directly in drawer or table
  const handleStatusUpdated = (id, newStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint((prev) => ({ ...prev, status: newStatus }));
    }
    // Refresh backend to confirm persistence
    refreshAll(true);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans flex antialiased selection:bg-[#8B5CF6] selection:text-white">
      {/* 1. Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ticketCount={complaints.length}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenArchitecture={() => setIsArchOpen(true)}
        onBackendChange={(newUrl) => {
          setBackendUrl(newUrl);
          refreshAll(false);
        }}
      />

      {/* Main Content Area (Offset by sidebar width of 256px / 64) */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* 2. Minimal Top Navigation & Global Search */}
        <TopBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onRefresh={() => refreshAll(false)}
          loading={loading}
          lastSynced={lastSynced}
          syncCountdown={syncCountdown}
          notifications={notifications}
          onRefreshNotifications={loadNotifications}
          onOpenNewComplaint={() => {
            if (!token) {
              setIsAuthOpen(true);
            } else {
              setIsNewComplaintOpen(true);
            }
          }}
          onSelectComplaint={(complaintId) => {
            const found = complaints.find((c) => c.id === complaintId);
            if (found) setSelectedComplaint(found);
          }}
        />

        {/* Content Body */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full">
          {/* Guest Sign-in Banner (if user hasn't logged in yet) */}
          {!token && (
            <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></span>
                  <span className="text-xs font-semibold text-[#FAFAFA]">
                    Connect to Live Microservices
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A1AA]">
                  Sign in or register with 1-click test credentials (<span className="text-[#8B5CF6] font-mono">john / pass123</span>) to lodge tickets and observe real-time departmental auto-routing.
                </p>
              </div>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#FAFAFA] text-xs font-medium shrink-0 transition-colors"
              >
                Sign In / Register
              </button>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => refreshAll(false)}
                className="px-2.5 py-1 rounded text-[11px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* 3. Four Clean KPI Cards */}
          <KpiCards
            complaints={complaints}
            onFilterStatus={(status) => setStatusFilter(status)}
          />

          {/* 4. Professional Complaints Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#FAFAFA]">
                  Customer Grievances & Service Tickets
                </h2>
                <p className="text-[11px] text-[#71717A]">
                  Dispatched via Spring Cloud Gateway and auto-assigned by the Assignment microservice
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-[#71717A] hidden sm:inline">
                  Updated every 5s
                </span>
                <button
                  onClick={() => refreshAll(false)}
                  disabled={loading}
                  className="p-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
                  title="Manual refresh"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#8B5CF6]' : ''}`} />
                </button>
              </div>
            </div>

            <ComplaintsTable
              complaints={complaints}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onSelectComplaint={(ticket) => setSelectedComplaint(ticket)}
              selectedComplaintId={selectedComplaint?.id}
            />
          </div>
        </main>
      </div>

      {/* 5. Slide-Out Drawer for Complaint Details */}
      <ComplaintDrawer
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* 6. Modals */}
      <NewComplaintModal
        isOpen={isNewComplaintOpen}
        onClose={() => setIsNewComplaintOpen(false)}
        onSuccess={() => {
          refreshAll(false);
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
