import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  Sparkles,
  CheckCircle2,
  Building2,
  User,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function NewComplaintModal({
  isOpen,
  onClose,
  onSuccess,
  user
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('BILLING');
  const [priority, setPriority] = useState('HIGH');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  // Predict routing based on backend AssignmentService rules
  const getPredictedDepartment = () => {
    if (priority === 'HIGH' || priority === 'CRITICAL') {
      return { dept: 'ESCALATION', badge: 'High Priority Escalation' };
    }
    if (category === 'INQUIRY' || category === 'FAQ') {
      return { dept: 'SELF_SERVICE', badge: 'Knowledge Base & Self-Service' };
    }
    if (category === 'BILLING') {
      return { dept: 'BILLING', badge: 'Finance & Payments Team' };
    }
    if (category === 'TECHNICAL') {
      return { dept: 'TECHNICAL', badge: 'Engineering & DevOps' };
    }
    return { dept: 'GENERAL_SUPPORT', badge: 'Standard Support Triage' };
  };

  const predicted = getPredictedDepartment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please fill in both the title and description.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        userId: user?.id || 1
      };

      const res = await api.complaints.create(payload);
      setResult(res);

      if (onSuccess) onSuccess(res);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setTitle('');
    setDescription('');
    setCategory('BILLING');
    setPriority('HIGH');
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={handleResetAndClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-xl bg-[#18181B] border border-[#27272A] p-6 shadow-2xl text-[#FAFAFA] animate-fade-in space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
            <div>
              <h3 className="text-base font-semibold text-[#FAFAFA]">
                Lodge Service Complaint
              </h3>
              <p className="text-xs text-[#71717A]">
                Submitted tickets are automatically routed by the Assignment microservice
              </p>
            </div>
            <button
              onClick={handleResetAndClose}
              className="p-1 rounded-lg text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#27272A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Success Screen after submission */}
          {result ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complaint #{result.id} successfully lodged!</span>
                </div>
                <p className="text-[#A1A1AA]">
                  Your complaint was saved in PostgreSQL and auto-assigned by the Assignment microservice.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111113] border border-[#27272A] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Assigned Department</span>
                  <span className="font-mono text-[#8B5CF6] font-medium">
                    {result.assignment?.department || predicted.dept}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Assigned Agent</span>
                  <span className="font-mono text-[#FAFAFA]">
                    {result.assignment?.assignedTo || 'Auto-Allocated'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Initial Status</span>
                  <span className="font-mono text-amber-400">
                    {result.status || 'OPEN'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Ticket Subject / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Payment gateway timeout during invoice renewal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#111113] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#111113] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="BILLING">Billing & Invoicing</option>
                    <option value="TECHNICAL">Technical & API</option>
                    <option value="INQUIRY">General Inquiry</option>
                    <option value="FEEDBACK">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#111113] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the issue, error codes, and steps to reproduce..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#111113] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
                />
              </div>

              {/* Auto-Routing Prediction Card */}
              <div className="p-3 rounded-lg bg-[#111113] border border-[#27272A] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                  <div>
                    <span className="text-[#71717A] text-[10px] block">Auto-Assignment Prediction</span>
                    <span className="font-mono text-[#FAFAFA] text-xs font-medium">
                      {predicted.dept}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-[#A1A1AA]">
                  {predicted.badge}
                </span>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-3.5 py-2 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white flex items-center space-x-1.5 transition-all shadow-sm shadow-[#8B5CF6]/20 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Dispatch Ticket'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
