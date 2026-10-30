import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Server,
  LogOut,
  Moon,
  Sun,
  Layers,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Check
} from 'lucide-react';
import { getBaseUrl, setBaseUrl, DEFAULT_CLOUD_URL, DEFAULT_LOCAL_URL, api } from '../services/api';

export default function Navbar({
  user,
  onLogout,
  onOpenAuth,
  onOpenArchitecture,
  notifications,
  onRefreshNotifications,
  darkMode,
  setDarkMode,
  onSelectComplaint
}) {
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(getBaseUrl());
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isLiveOnline, setIsLiveOnline] = useState(null);
  const [checkingPing, setCheckingPing] = useState(false);

  const isCloud = currentUrl === DEFAULT_CLOUD_URL;

  // Check health on load and URL change
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      setCheckingPing(true);
      const online = await api.ping(currentUrl);
      if (mounted) {
        setIsLiveOnline(online);
        setCheckingPing(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [currentUrl]);

  const handleSwitchUrl = (newUrl) => {
    setBaseUrl(newUrl);
    setCurrentUrl(newUrl);
    setShowEnvDropdown(false);
    window.location.reload();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      handleSwitchUrl(customUrlInput.trim());
    }
  };

  const unreadCount = notifications ? notifications.filter((n) => !n.read).length : 0;

  const handleMarkAllRead = async () => {
    if (user?.id) {
      try {
        await api.notifications.markAllRead(user.id);
        onRefreshNotifications();
      } catch (e) {
        console.error('Failed to mark all read', e);
      }
    }
  };

  const handleMarkOneRead = async (notif) => {
    try {
      if (!notif.read) {
        await api.notifications.markRead(notif.id);
        onRefreshNotifications();
      }
      if (notif.complaintId && onSelectComplaint) {
        onSelectComplaint(notif.complaintId);
        setShowNotifDropdown(false);
      }
    } catch (e) {
      console.error('Failed to mark notification read', e);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                  ResolveNow
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                  v1.0 Cloud
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Microservices Service Desk Platform
              </p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Backend Environment Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowEnvDropdown(!showEnvDropdown)}
                className={`flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  isLiveOnline
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
                }`}
                title="Click to switch backend environment"
              >
                <span className="relative flex h-2 w-2">
                  {isLiveOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isLiveOnline ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  ></span>
                </span>
                <span className="font-semibold">{isCloud ? 'Render Cloud' : 'Localhost:8080'}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {/* Env Dropdown */}
              {showEnvDropdown && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Server className="h-4 w-4 text-indigo-500" /> Backend Connection
                    </span>
                    <button
                      onClick={() => {
                        setCheckingPing(true);
                        api.ping(currentUrl).then((res) => {
                          setIsLiveOnline(res);
                          setCheckingPing(false);
                        });
                      }}
                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 p-1 rounded-md"
                      title="Test Connection"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${checkingPing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {/* Render Cloud Option */}
                    <div
                      onClick={() => handleSwitchUrl(DEFAULT_CLOUD_URL)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isCloud
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold">
                          ☁️ Live Render Cloud (Postgres)
                        </span>
                        {isCloud && <Check className="h-4 w-4 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {DEFAULT_CLOUD_URL}
                      </p>
                    </div>

                    {/* Localhost Option */}
                    <div
                      onClick={() => handleSwitchUrl(DEFAULT_LOCAL_URL)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        !isCloud && currentUrl === DEFAULT_LOCAL_URL
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold">
                          💻 Local Gateway (Port 8080)
                        </span>
                        {!isCloud && currentUrl === DEFAULT_LOCAL_URL && (
                          <Check className="h-4 w-4 text-indigo-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {DEFAULT_LOCAL_URL}
                      </p>
                    </div>

                    {/* Custom URL form */}
                    <form onSubmit={handleCustomSubmit} className="pt-2">
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                        Custom Backend URL:
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="https://..."
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Architecture Modal Trigger */}
            <button
              onClick={onOpenArchitecture}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View Microservices Architecture"
            >
              <Layers className="h-5 w-5" />
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Drawer */}
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                      {notifications && notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkOneRead(n)}
                            className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start space-x-3 ${
                              !n.read
                                ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                                : 'opacity-75'
                            }`}
                          >
                            <div className="mt-0.5">
                              {n.type === 'STATUS_UPDATE' ? (
                                <RefreshCw className="h-4 w-4 text-indigo-500" />
                              ) : (
                                <Bell className="h-4 w-4 text-emerald-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 dark:text-slate-100 leading-tight">
                                {n.message}
                              </p>
                              <div className="mt-1 flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400">
                                {n.complaintId && (
                                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                                    Complaint #{n.complaintId}
                                  </span>
                                )}
                                <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            {!n.read && (
                              <span className="h-2 w-2 rounded-full bg-indigo-600 mt-1 flex-shrink-0"></span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                          No notifications yet. You will see alerts when complaints are assigned or updated.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Button or User Profile */}
            {user ? (
              <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {user.username.substring(0, 2)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    {user.username}
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      ID: {user.id || 1}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {user.roles && user.roles.includes('ADMIN') ? 'Administrator' : 'Standard User'}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all transform active:scale-95"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
