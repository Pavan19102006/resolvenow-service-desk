import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Radio,
  X,
  Check,
  Sparkles,
  Shield,
  Briefcase
} from 'lucide-react';
import { api } from '../services/api';

export default function TopBar({
  searchQuery,
  setSearchQuery,
  onRefresh,
  loading,
  lastSynced,
  syncCountdown,
  notifications,
  currentUser,
  onRefreshNotifications,
  onOpenNewComplaint,
  onSelectComplaint
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const role = currentUser?.role || 'USER';
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      if (notifications.length > 0 && notifications[0].userId) {
        await api.notifications.markAllRead(notifications[0].userId);
      }
      onRefreshNotifications();
    } catch (e) {
      console.warn('Failed to mark notifications read', e);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await api.notifications.markRead(notif.id);
        onRefreshNotifications();
      }
      if (notif.complaintId) {
        onSelectComplaint(notif.complaintId);
        setIsNotifOpen(false);
      }
    } catch (e) {
      console.warn('Failed to handle notification click', e);
    }
  };

  return (
    <header className="h-16 sticky top-0 bg-[#09090B]/90 backdrop-blur-md border-b border-[#27272A] px-6 flex items-center justify-between z-20">
      {/* Global Search Bar */}
      <div className="relative w-72 sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            role === 'USER'
              ? 'Search my service requests, status, dates...'
              : role === 'STAFF'
              ? 'Search department queue, ticket IDs, issues...'
              : 'Global admin search across all tickets & users...'
          }
          className="w-full bg-[#18181B] border border-[#27272A] text-[#FAFAFA] placeholder-[#71717A] text-xs rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-[#8B5CF6] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#FAFAFA]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right Controls: Role Badge, Auto-Sync, Notifications, New Complaint */}
      <div className="flex items-center space-x-3">
        {/* Role Pill Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#18181B] border border-[#27272A] text-xs">
          {role === 'ADMIN' ? (
            <Shield className="w-3.5 h-3.5 text-rose-400" />
          ) : role === 'STAFF' ? (
            <Briefcase className="w-3.5 h-3.5 text-[#8B5CF6]" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="text-[11px] font-mono text-[#FAFAFA]">
            {role === 'ADMIN'
              ? 'Admin Mode'
              : role === 'STAFF'
              ? `Staff Desk (${currentUser?.department || 'TECH'})`
              : 'Customer Portal'}
          </span>
        </div>

        {/* Real-time Auto-Sync Status Indicator */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-[#A1A1AA] bg-[#18181B] border border-[#27272A] px-2.5 py-1.5 rounded-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5CF6]"></span>
          </span>
          <span className="text-[11px] font-mono">
            {loading ? 'Syncing...' : `Live (${syncCountdown}s)`}
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-[#71717A] hover:text-[#FAFAFA] p-0.5 rounded transition-colors"
            title="Refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#8B5CF6]' : ''}`} />
          </button>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#8B5CF6]/50 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8B5CF6] text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Drawer Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
              <div className="p-3 border-b border-[#27272A] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-[#FAFAFA]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#8B5CF6]/20 text-[#8B5CF6] font-mono">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#27272A]">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 text-xs cursor-pointer transition-colors hover:bg-[#27272A]/50 ${
                        !n.read ? 'bg-[#8B5CF6]/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-[#FAFAFA] leading-tight">
                          {n.message}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0 mt-1" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-[#71717A]">
                        <span>{n.channel || 'IN_APP'}</span>
                        {n.createdAt && <span>{new Date(n.createdAt).toLocaleTimeString()}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-[#71717A]">
                    No notifications yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Accent Button: Lodge Complaint */}
        <button
          onClick={onOpenNewComplaint}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#FAFAFA] text-xs font-medium shadow-sm shadow-[#8B5CF6]/25 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{role === 'STAFF' ? 'Log Ticket' : 'Lodge Ticket'}</span>
        </button>
      </div>
    </header>
  );
}
