import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Activity,
  Layers,
  Database,
  ExternalLink,
  User,
  LogOut,
  LogIn,
  Server,
  RefreshCw,
  Check,
  ChevronDown
} from 'lucide-react';
import { getBaseUrl, setBaseUrl, DEFAULT_CLOUD_URL, DEFAULT_LOCAL_URL, api } from '../services/api';

export default function Sidebar({
  activeTab,
  setActiveTab,
  ticketCount,
  user,
  onLogout,
  onOpenAuth,
  onOpenArchitecture,
  onBackendChange
}) {
  const [currentUrl, setCurrentUrl] = useState(getBaseUrl());
  const [pingLatency, setPingLatency] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  const isRender = currentUrl.includes('render.com');

  useEffect(() => {
    let mounted = true;
    const testPing = async () => {
      const start = Date.now();
      try {
        const alive = await api.ping(currentUrl);
        if (mounted) {
          setIsLive(alive);
          setPingLatency(alive ? Math.max(1, Date.now() - start) : null);
        }
      } catch {
        if (mounted) {
          setIsLive(false);
          setPingLatency(null);
        }
      }
    };

    testPing();
    const interval = setInterval(testPing, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [currentUrl]);

  const handleToggleBackend = () => {
    setIsSwitching(true);
    const newUrl = isRender ? DEFAULT_LOCAL_URL : DEFAULT_CLOUD_URL;
    setBaseUrl(newUrl);
    setCurrentUrl(newUrl);
    if (onBackendChange) onBackendChange(newUrl);
    setTimeout(() => setIsSwitching(false), 400);
  };

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-[#111113] border-r border-[#27272A] flex flex-col justify-between z-30 select-none">
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 px-5 border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-[#FAFAFA]">
                ResolveNow
              </span>
              <span className="block text-[10px] text-[#71717A] tracking-wider uppercase font-medium">
                Service Desk
              </span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#18181B] border border-[#27272A] text-[#A1A1AA]">
            v1.0
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'tickets'
                ? 'bg-[#18181B] text-[#FAFAFA] border border-[#27272A] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]/50'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Inbox className={`w-4 h-4 ${activeTab === 'tickets' ? 'text-[#8B5CF6]' : 'text-[#71717A]'}`} />
              <span>Complaints</span>
            </div>
            {ticketCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/25 font-semibold">
                {ticketCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-[#18181B] text-[#FAFAFA] border border-[#27272A] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]/50'
            }`}
          >
            <Activity className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-[#8B5CF6]' : 'text-[#71717A]'}`} />
            <span>KPIs & Routing</span>
          </button>

          <button
            onClick={onOpenArchitecture}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]/50 transition-colors"
          >
            <Layers className="w-4 h-4 text-[#71717A]" />
            <span>Architecture Flow</span>
          </button>
        </nav>
      </div>

      {/* Bottom Section: Backend Selector & User Account */}
      <div className="p-3 border-t border-[#27272A] space-y-3">
        {/* Backend Environment Box */}
        <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span className="text-[11px] font-medium text-[#FAFAFA]">
                {isRender ? 'Render Cloud' : 'Localhost Gateway'}
              </span>
            </div>
            {pingLatency && (
              <span className="text-[10px] font-mono text-[#71717A]">
                {pingLatency}ms
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#71717A]">
            <span className="truncate max-w-[140px] font-mono">
              {isRender ? 'resolvenow-service-desk' : 'localhost:8080'}
            </span>
            <button
              onClick={handleToggleBackend}
              disabled={isSwitching}
              className="text-[#8B5CF6] hover:text-[#A78BFA] font-medium transition-colors"
              title="Toggle between Render Cloud and Localhost"
            >
              Switch
            </button>
          </div>
        </div>

        {/* User Profile or Sign In */}
        {user ? (
          <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] text-xs font-bold uppercase">
                {user.username ? user.username.substring(0, 2) : 'US'}
              </div>
              <div className="overflow-hidden">
                <span className="block text-xs font-medium text-[#FAFAFA] truncate">
                  {user.username}
                </span>
                <span className="block text-[10px] text-[#71717A] uppercase font-mono tracking-wider">
                  {user.role || 'USER'}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-[#71717A] hover:text-rose-400 rounded hover:bg-[#27272A] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full py-2 px-3 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#FAFAFA] text-xs font-medium flex items-center justify-center space-x-1.5 transition-all shadow-sm shadow-[#8B5CF6]/20 active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </aside>
  );
}
