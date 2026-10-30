import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Send,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function ComplaintDrawer({
  complaint,
  onClose,
  onStatusUpdated
}) {
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!complaint) return null;

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await api.complaints.updateStatus(complaint.id, newStatus);
      if (onStatusUpdated) onStatusUpdated(complaint.id, newStatus);
    } catch (err) {
      alert(`Could not update ticket status: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(complaint, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Slide-out drawer panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#111113] border-l border-[#27272A] flex flex-col justify-between shadow-2xl animate-slide-in">
          {/* Header */}
          <div className="p-5 border-b border-[#27272A] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-semibold text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2 py-0.5 rounded">
                #{complaint.id}
              </span>
              <span className="text-xs font-mono uppercase bg-[#18181B] border border-[#27272A] text-[#A1A1AA] px-2 py-0.5 rounded">
                {complaint.category || 'GENERAL'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#18181B] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-[#FAFAFA] leading-snug">
                {complaint.title}
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed whitespace-pre-wrap bg-[#18181B] p-3.5 rounded-xl border border-[#27272A]">
                {complaint.description}
              </p>
            </div>

            {/* Quick Status Action Controls */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider block">
                Update Ticket Status
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={updating || complaint.status === 'OPEN'}
                  onClick={() => handleUpdateStatus('OPEN')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    complaint.status === 'OPEN'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
                  }`}
                >
                  Open
                </button>

                <button
                  disabled={updating || complaint.status === 'IN_PROGRESS'}
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    complaint.status === 'IN_PROGRESS'
                      ? 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30'
                      : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
                  }`}
                >
                  In Progress
                </button>

                <button
                  disabled={updating || complaint.status === 'RESOLVED'}
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    complaint.status === 'RESOLVED' || complaint.status === 'CLOSED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* Microservice Assignment Info Card */}
            <div className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
              <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider block">
                Assignment Microservice Details
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#71717A] block">Department</span>
                  <span className="font-mono text-[#FAFAFA] font-medium">
                    {complaint.assignment?.department || 'GENERAL_SUPPORT'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717A] block">Assigned Agent</span>
                  <span className="font-mono text-[#8B5CF6] font-medium">
                    {complaint.assignment?.assignedTo || 'Auto-Allocated'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717A] block">Priority</span>
                  <span className="font-mono text-[#FAFAFA] font-medium">
                    {complaint.priority || 'MEDIUM'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717A] block">Created By</span>
                  <span className="font-mono text-[#FAFAFA] font-medium">
                    {complaint.user?.username || 'Customer'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Microservices Architecture Trace */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider block">
                Microservices Dispatch Flow
              </span>
              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center space-x-2 text-[#A1A1AA] bg-[#18181B] p-2 rounded-lg border border-[#27272A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[#FAFAFA]">Spring Cloud Gateway</span>
                  <span className="text-[#71717A] ml-auto">Ingress 200</span>
                </div>
                <div className="flex items-center space-x-2 text-[#A1A1AA] bg-[#18181B] p-2 rounded-lg border border-[#27272A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[#FAFAFA]">Auth Service</span>
                  <span className="text-[#71717A] ml-auto">JWT Verified</span>
                </div>
                <div className="flex items-center space-x-2 text-[#A1A1AA] bg-[#18181B] p-2 rounded-lg border border-[#27272A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[#FAFAFA]">Complaint Service</span>
                  <span className="text-[#71717A] ml-auto">PostgreSQL</span>
                </div>
                <div className="flex items-center space-x-2 text-[#A1A1AA] bg-[#18181B] p-2 rounded-lg border border-[#27272A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></span>
                  <span className="text-[#FAFAFA]">Assignment Service</span>
                  <span className="text-[#71717A] ml-auto">
                    {complaint.assignment?.department || 'GENERAL'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-[#27272A] flex items-center justify-between">
            <button
              onClick={copyPayload}
              className="text-xs text-[#71717A] hover:text-[#FAFAFA] flex items-center space-x-1.5 py-1.5 px-2.5 rounded-lg hover:bg-[#18181B] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] border border-[#27272A] rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
