import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Shield,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Send,
  Calendar,
  Sparkles,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';

export default function IssueDetailsModal({
  complaint,
  isOpen,
  onClose,
  currentUser,
  onStatusUpdated,
  onAssignmentUpdated
}) {
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'workflow', 'trace'
  const [internalNote, setInternalNote] = useState('');
  const [notes, setNotes] = useState([
    {
      id: 1,
      author: 'System Auto-Triage',
      time: 'At ticket ingestion',
      text: 'Auto-routed to department based on category and SLA priority heuristics.'
    }
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !complaint) return null;

  const role = currentUser?.role || 'USER';
  const isCustomer = role === 'USER';
  const isStaff = role === 'STAFF';
  const isAdmin = role === 'ADMIN';

  // Handle status transition
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

  // Staff Claim Ticket
  const handleClaimTicket = () => {
    const staffName = currentUser?.username || 'Staff-Agent';
    // Add internal log note
    setNotes((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: staffName,
        time: 'Just now',
        text: `Claimed ticket and transitioned to IN_PROGRESS for investigation.`
      }
    ]);
    handleUpdateStatus('IN_PROGRESS');
  };

  // Staff/Admin escalate
  const handleEscalate = () => {
    setNotes((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: currentUser?.username || 'Staff-Agent',
        time: 'Just now',
        text: `Escalated ticket to ESCALATION team for priority handling.`
      }
    ]);
    handleUpdateStatus('IN_PROGRESS');
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    setNotes((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: currentUser?.username || 'Support Staff',
        time: 'Just now',
        text: internalNote.trim()
      }
    ]);
    setInternalNote('');
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(complaint, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Lifecycle steps for Customer view
  const getLifecycleSteps = () => {
    const steps = [
      { id: 'OPEN', label: '1. Ticket Submitted', desc: 'Received & Queued' },
      { id: 'ROUTED', label: '2. Auto-Assigned', desc: complaint.assignment?.department || 'Triage' },
      { id: 'IN_PROGRESS', label: '3. Investigation', desc: 'Staff Actively Working' },
      { id: 'RESOLVED', label: '4. Resolution', desc: 'Completed & Closed' }
    ];

    let currentStepIndex = 1;
    if (complaint.status === 'OPEN') currentStepIndex = 1;
    if (complaint.assignment?.department) currentStepIndex = 2;
    if (complaint.status === 'IN_PROGRESS') currentStepIndex = 3;
    if (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') currentStepIndex = 4;

    return { steps, currentStepIndex };
  };

  const { steps, currentStepIndex } = getLifecycleSteps();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-[#18181B] border border-[#27272A] shadow-2xl text-[#FAFAFA] animate-fade-in flex flex-col overflow-hidden max-h-[92vh]">
          {/* Top Modal Header */}
          <div className="p-5 border-b border-[#27272A] flex items-center justify-between bg-[#111113]">
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xs font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2 py-0.5 rounded">
                #{complaint.id}
              </span>
              <span className="text-[11px] font-mono uppercase bg-[#18181B] border border-[#27272A] text-[#A1A1AA] px-2 py-0.5 rounded">
                {complaint.category || 'GENERAL'}
              </span>

              {/* Status Pill */}
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#18181B] border border-[#27272A]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    complaint.status === 'OPEN'
                      ? 'bg-amber-400'
                      : complaint.status === 'IN_PROGRESS'
                      ? 'bg-[#8B5CF6] animate-pulse'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="capitalize text-xs text-[#FAFAFA]">
                  {complaint.status ? complaint.status.toLowerCase().replace('_', ' ') : 'Open'}
                </span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#27272A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation inside Popup */}
          <div className="px-5 pt-3 border-b border-[#27272A] flex items-center space-x-4 bg-[#111113]">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-[#8B5CF6] text-[#FAFAFA]'
                  : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              Issue Overview
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'workflow'
                  ? 'border-[#8B5CF6] text-[#FAFAFA]'
                  : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              {isCustomer ? 'Ticket Progress' : 'Resolution & Notes'}
            </button>
            <button
              onClick={() => setActiveTab('trace')}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'trace'
                  ? 'border-[#8B5CF6] text-[#FAFAFA]'
                  : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              Microservice Flow
            </button>
          </div>

          {/* Scrollable Modal Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* TAB 1: DETAILS */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-[#FAFAFA] leading-snug">
                    {complaint.title}
                  </h3>
                  <div className="p-3.5 rounded-xl bg-[#111113] border border-[#27272A] text-xs text-[#A1A1AA] leading-relaxed whitespace-pre-wrap">
                    {complaint.description}
                  </div>
                </div>

                {/* Key Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#111113] border border-[#27272A]">
                    <span className="text-[10px] text-[#71717A] block">Assigned Dept</span>
                    <span className="font-mono text-[#8B5CF6] font-medium text-xs truncate block">
                      {complaint.assignment?.department || 'GENERAL_SUPPORT'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#111113] border border-[#27272A]">
                    <span className="text-[10px] text-[#71717A] block">Assigned Agent</span>
                    <span className="font-mono text-[#FAFAFA] text-xs truncate block">
                      {complaint.assignment?.assignedTo || 'Auto-Allocated'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#111113] border border-[#27272A]">
                    <span className="text-[10px] text-[#71717A] block">Priority</span>
                    <span
                      className={`font-mono text-xs font-medium ${
                        complaint.priority === 'HIGH' || complaint.priority === 'CRITICAL'
                          ? 'text-rose-400'
                          : complaint.priority === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-[#A1A1AA]'
                      }`}
                    >
                      {complaint.priority || 'MEDIUM'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#111113] border border-[#27272A]">
                    <span className="text-[10px] text-[#71717A] block">Logged At</span>
                    <span className="font-mono text-[#A1A1AA] text-[11px] truncate block">
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Quick Role Actions Banner */}
                <div className="p-4 rounded-xl bg-[#111113] border border-[#27272A] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#FAFAFA] flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      <span>
                        {isCustomer
                          ? 'Customer Action Bar'
                          : isStaff
                          ? 'Staff Triage Actions'
                          : 'Admin Platform Controls'}
                      </span>
                    </span>
                    <span className="text-[10px] text-[#71717A] font-mono uppercase">
                      Role: {role}
                    </span>
                  </div>

                  {/* Customer Actions */}
                  {isCustomer && (
                    <div className="flex flex-wrap items-center gap-2">
                      {complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' ? (
                        <button
                          disabled={updating}
                          onClick={() => handleUpdateStatus('RESOLVED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved & Satisfied</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>This ticket has been marked resolved. Thank you!</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Staff Actions */}
                  {isStaff && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        disabled={updating || complaint.status === 'IN_PROGRESS'}
                        onClick={handleClaimTicket}
                        className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Claim & Start Working</span>
                      </button>

                      <button
                        disabled={updating || complaint.status === 'RESOLVED'}
                        onClick={() => handleUpdateStatus('RESOLVED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve Ticket</span>
                      </button>

                      <button
                        disabled={updating}
                        onClick={handleEscalate}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Escalate to Tier 2</span>
                      </button>
                    </div>
                  )}

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        disabled={updating}
                        onClick={() => handleUpdateStatus('OPEN')}
                        className="px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-amber-400 hover:bg-[#27272A] text-xs font-medium transition-colors"
                      >
                        Reset to Open
                      </button>
                      <button
                        disabled={updating}
                        onClick={() => handleUpdateStatus('IN_PROGRESS')}
                        className="px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#8B5CF6] hover:bg-[#27272A] text-xs font-medium transition-colors"
                      >
                        Force In Progress
                      </button>
                      <button
                        disabled={updating}
                        onClick={() => handleUpdateStatus('RESOLVED')}
                        className="px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-emerald-400 hover:bg-[#27272A] text-xs font-medium transition-colors"
                      >
                        Force Resolved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: WORKFLOW & NOTES */}
            {activeTab === 'workflow' && (
              <div className="space-y-4">
                {/* Visual Stepper for Customer */}
                {isCustomer ? (
                  <div className="p-4 rounded-xl bg-[#111113] border border-[#27272A] space-y-4">
                    <span className="text-xs font-semibold text-[#FAFAFA] block">
                      Ticket Resolution Milestones
                    </span>
                    <div className="space-y-3">
                      {steps.map((step, idx) => {
                        const stepNum = idx + 1;
                        const isDone = currentStepIndex >= stepNum;
                        const isCurrent = currentStepIndex === stepNum;
                        return (
                          <div key={step.id} className="flex items-start space-x-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                isDone
                                  ? 'bg-[#8B5CF6] text-white'
                                  : 'bg-[#18181B] border border-[#27272A] text-[#71717A]'
                              }`}
                            >
                              {isDone ? '✓' : stepNum}
                            </div>
                            <div>
                              <span
                                className={`text-xs font-medium block ${
                                  isDone ? 'text-[#FAFAFA]' : 'text-[#71717A]'
                                }`}
                              >
                                {step.label}
                              </span>
                              <span className="text-[11px] text-[#71717A] block">
                                {step.desc}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Staff & Admin Internal Work Notes */
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-[#FAFAFA] block">
                        Internal Staff Resolution Log
                      </span>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {notes.map((n) => (
                          <div
                            key={n.id}
                            className="p-3 rounded-xl bg-[#111113] border border-[#27272A] text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-[10px] text-[#71717A]">
                              <span className="font-semibold text-[#8B5CF6]">{n.author}</span>
                              <span>{n.time}</span>
                            </div>
                            <p className="text-[#A1A1AA] leading-relaxed">{n.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleAddNote} className="space-y-2">
                      <textarea
                        rows={2}
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        placeholder="Add resolution note or internal handover update..."
                        className="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#8B5CF6] resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium transition-colors"
                        >
                          Post Update
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MICROSERVICE FLOW */}
            {activeTab === 'trace' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-[#FAFAFA] block">
                  Distributed Microservices Audit Trace
                </span>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-[#111113] border border-[#27272A] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-[#FAFAFA]">Spring Cloud Gateway Ingress</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">HTTP 200 OK</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#111113] border border-[#27272A] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-[#FAFAFA]">Auth Service (Port 8081)</span>
                    </div>
                    <span className="text-[10px] text-[#A1A1AA]">JWT Bearer Verified</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#111113] border border-[#27272A] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-[#FAFAFA]">Complaint Service (Port 8082)</span>
                    </div>
                    <span className="text-[10px] text-[#A1A1AA]">PostgreSQL Committed</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#111113] border border-[#27272A] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
                      <span className="text-[#FAFAFA]">Assignment Service (Port 8083)</span>
                    </div>
                    <span className="text-[10px] text-[#8B5CF6]">
                      {complaint.assignment?.department || 'GENERAL'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#111113] border border-[#27272A] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-[#FAFAFA]">Notification Service (Port 8084)</span>
                    </div>
                    <span className="text-[10px] text-[#A1A1AA]">Dispatched</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-[#27272A] bg-[#111113] flex items-center justify-between">
            <button
              onClick={copyPayload}
              className="text-xs text-[#71717A] hover:text-[#FAFAFA] flex items-center space-x-1.5 py-1.5 px-2.5 rounded-lg hover:bg-[#18181B] transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
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

