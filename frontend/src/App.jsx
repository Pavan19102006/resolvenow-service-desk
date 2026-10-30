import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import KpiCards from './components/KpiCards';
import ComplaintsTable from './components/ComplaintsTable';
import IssueDetailsModal from './components/IssueDetailsModal';
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
  ArrowRight,
  Briefcase,
  Layers,
  Sparkles
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

  // Issue Details Centered Modal Popup
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // Modals
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isArchOpen, setIsArchOpen] = useState(false);

  // Auto-sync timer state
  const [syncCountdown, setSyncCountdown] = useState(SYNC_INTERVAL_SECONDS);
  const [lastSynced, setLastSynced] = useState(new Date());

  // Backend URL tracker
  const [backendUrl, setBackendUrl] = useState(getBaseUrl());

  const currentRole = user?.role || 'USER';

  // Fetch Complaints from Backend
  const loadComplaints = useCallback(async (isSilent = false) => {
    if (!token) return;
    try {
      if (!isSilent) setLoading(true);
      setError(null);
      const list = await api.complaints.getAll();
      setComplaints(Array.isArray(list) ? list : []);
      setLastSynced(new Date());

      // If issue details popup is currently open, keep its details updated
      if (selectedComplaint) {
        const updated = list.find((c) => c.id === selectedComplaint.id);
        if (updated) setSelectedComplaint(updated);
      }
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
        setError('Your session has expired. Please sign in again.');
      } else {
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

  // Periodic Auto-Sync Timer
  useEffect(() => {
    if (!token) return;

    refreshAll(false);

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
    setIsIssueModalOpen(false);
  };

  // Select User Persona (Customer / Staff / Admin)
  const handleSelectUserPersona = (persona) => {
    setUser(persona);
    setCurrentUser(persona);
    setStatusFilter('ALL');
  };

  // Handle row click -> open centered issue details popup
  const handleSelectComplaint = (ticket) => {
    setSelectedComplaint(ticket);
    setIsIssueModalOpen(true);
  };

  // Handle status update directly in popup modal
  const handleStatusUpdated = (id, newStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint((prev) => ({ ...prev, status: newStatus }));
    }
    refreshAll(true);
  };

  // STRICT Role-based visibility filtering:
  // 1. CUSTOMER (USER): only sees their own complaints (c.userId === user.id)
  // 2. STAFF: only sees complaints assigned to their department (c.assignment?.department === user.department)
  // 3. ADMIN: sees all complaints across the platform
  const roleFilteredComplaints = complaints.filter((c) => {
    if (!user) return true; // guest sees preview
    if (user.role === 'USER') {
      return Number(c.userId) === Number(user.id);
    }
    if (user.role === 'STAFF') {
      const staffDept = user.department || 'TECHNICAL';
      return c.assignment?.department === staffDept;
    }
    return true; // ADMIN sees all
  });

  // Role-specific Header Title and Description
  const getDashboardHeading = () => {
    if (currentRole === 'USER') {
      return {
        title: `Customer Service Requests • ${user?.username || 'Customer'}`,
        subtitle: `Displaying personal complaints submitted by customer account #${user?.id || 1} (${user?.username || 'Customer'})`
      };
    } else if (currentRole === 'STAFF') {
      const staffDept = user?.department || 'TECHNICAL';
      return {
        title: `${staffDept.replace('_', ' ')} Department Queue`,
        subtitle: `Staff Agent: ${user?.username || 'Agent'} • Monitoring and resolving ${staffDept.replace('_', ' ')} complaints only`
      };
    } else {
      return {
        title: 'System Admin Platform Governance & Operations',
        subtitle: 'Enterprise-wide view across all microservices, Eureka instances, departments, and user workloads'
      };
    }
  };

  const heading = getDashboardHeading();

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans flex antialiased selection:bg-[#8B5CF6] selection:text-white">
      {/* 1. Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ticketCount={roleFilteredComplaints.length}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenArchitecture={() => setIsArchOpen(true)}
        onBackendChange={(newUrl) => {
          setBackendUrl(newUrl);
          refreshAll(false);
        }}
        onSelectUserPersona={handleSelectUserPersona}
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
          currentUser={user}
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
            if (found) handleSelectComplaint(found);
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
                    ResolveNow Microservices Live Connection
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A1AA]">
                  Sign in or register as <span className="text-[#8B5CF6] font-mono">Customer</span>, <span className="text-[#8B5CF6] font-mono">Company Staff</span>, or <span className="text-[#8B5CF6] font-mono">Admin</span> using 1-click test personas to explore role-tailored dashboards.
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

          {/* 3. Four Role-Tailored Clean KPI Cards */}
          <KpiCards
            complaints={roleFilteredComplaints}
            currentUser={user}
            onFilterStatus={(status) => setStatusFilter(status)}
          />

          {/* 4. Professional Complaints Table with Role-Specific Views */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#FAFAFA]">
                  {heading.title}
                </h2>
                <p className="text-[11px] text-[#71717A]">
                  {heading.subtitle}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-[#71717A] hidden sm:inline">
                  Auto-sync: 5s
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
              complaints={roleFilteredComplaints}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              currentUser={user}
              onSelectComplaint={handleSelectComplaint}
              selectedComplaintId={selectedComplaint?.id}
            />
          </div>
        </main>
      </div>

      {/* 5. Issue Details Centered Popup Modal */}
      <IssueDetailsModal
        isOpen={isIssueModalOpen}
        complaint={selectedComplaint}
        currentUser={user}
        onClose={() => {
          setIsIssueModalOpen(false);
          setSelectedComplaint(null);
        }}
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
