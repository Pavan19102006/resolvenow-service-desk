import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { api, setToken, setCurrentUser } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('john');
  const [password, setPassword] = useState('pass123');
  const [email, setEmail] = useState('john@example.com');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleAutofill = (userType = 'john') => {
    if (userType === 'john') {
      setUsername('john');
      setPassword('pass123');
      setEmail('john@example.com');
      setRole('USER');
    } else {
      setUsername('admin');
      setPassword('admin123');
      setEmail('admin@example.com');
      setRole('ADMIN');
    }
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (tab === 'register') {
        // 1. Call Register
        await api.auth.register({
          username,
          password,
          email,
          role
        });

        // 2. Automatically log in after registration
        const loginRes = await api.auth.login({
          username,
          password
        });

        const userData = {
          username: loginRes.username || username,
          role,
          id: loginRes.userId || 1
        };

        setToken(loginRes.token);
        setCurrentUser(userData);

        if (onAuthSuccess) onAuthSuccess(userData, loginRes.token);
        onClose();
      } else {
        // Login flow
        const loginRes = await api.auth.login({
          username,
          password
        });

        const userData = {
          username: loginRes.username || username,
          role: role || 'USER',
          id: loginRes.userId || 1
        };

        setToken(loginRes.token);
        setCurrentUser(userData);

        if (onAuthSuccess) onAuthSuccess(userData, loginRes.token);
        onClose();
      }
    } catch (err) {
      if (err.status === 401 && tab === 'login') {
        setError(
          `User '${username}' does not exist or password was incorrect. Please click the "Register" tab to create this account in 1 click.`
        );
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-xl bg-[#18181B] border border-[#27272A] p-6 shadow-2xl text-[#FAFAFA] animate-fade-in space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
                <KeyRound className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-[#FAFAFA]">
                {tab === 'login' ? 'Sign In to ResolveNow' : 'Register New Account'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#27272A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex p-1 rounded-lg bg-[#111113] border border-[#27272A]">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                tab === 'login'
                  ? 'bg-[#27272A] text-[#FAFAFA]'
                  : 'text-[#71717A] hover:text-[#FAFAFA]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                tab === 'register'
                  ? 'bg-[#27272A] text-[#FAFAFA]'
                  : 'text-[#71717A] hover:text-[#FAFAFA]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Quick 1-Click Autofill Helper */}
          <div className="p-2.5 rounded-lg bg-[#111113] border border-[#27272A] flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#71717A]">Quick Test Fill:</span>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => handleAutofill('john')}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#18181B] border border-[#27272A] text-[#8B5CF6] hover:border-[#8B5CF6]/50 transition-colors"
              >
                john / pass123
              </button>
              <button
                type="button"
                onClick={() => handleAutofill('admin')}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
              >
                admin
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. john"
                className="w-full bg-[#111113] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#111113] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-[#111113] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#111113] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="USER">User (Customer)</option>
                    <option value="ADMIN">Admin / Support Lead</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 px-4 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-all shadow-sm shadow-[#8B5CF6]/25 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : tab === 'login' ? (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account & Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
