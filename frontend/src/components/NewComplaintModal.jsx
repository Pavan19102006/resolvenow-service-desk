import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Send,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function NewComplaintModal({ isOpen, onClose, onSuccess, user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('HIGH');
  const [category, setCategory] = useState('TECHNICAL');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'customer@example.com');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdResponse, setCreatedResponse] = useState(null);

  if (!isOpen) return null;

  // Predict department based on backend routing rules
  const getPredictedDepartment = (prio) => {
    switch (prio) {
      case 'HIGH':
      case 'CRITICAL':
        return 'ESCALATION';
      case 'MEDIUM':
        return 'GENERAL_SUPPORT';
      case 'LOW':
      default:
        return 'SELF_SERVICE';
    }
  };

  const predictedDept = getPredictedDepartment(priority);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        priority,
        userId: user?.id || 1,
        customerEmail: customerEmail || 'customer@example.com',
        category
      };

      const res = await api.complaints.create(payload);
      setCreatedResponse(res);
      onSuccess && onSuccess(res);
    } catch (err) {
      setError(err.message || 'Failed to lodge complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setTitle('');
    setDescription('');
    setCreatedResponse(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Lodge Customer Grievance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Auto-assigned to departments via Microservices
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {createdResponse ? (
            /* Success confirmation card */
            <div className="text-center py-4 space-y-4">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div>
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
                  Grievance Lodged Successfully!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Complaint #{createdResponse.id} registered and auto-routed by the microservices mesh.
                </p>
              </div>

              {/* Assignment Details Card */}
              {createdResponse.assignment && (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-left text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300 font-bold">
                    <Sparkles className="h-4 w-4" />
                    <span>Microservice Assignment Result:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Department</span>
                      <strong className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                        {createdResponse.assignment.department}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Assigned Agent</span>
                      <strong className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                        {createdResponse.assignment.assignedTo}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                View on Dashboard
              </button>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cannot complete invoice checkout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Priority & Category in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="HIGH">HIGH (Escalation)</option>
                    <option value="MEDIUM">MEDIUM (General Support)</option>
                    <option value="LOW">LOW (Self-Service)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="TECHNICAL">TECHNICAL</option>
                    <option value="BILLING">BILLING</option>
                    <option value="GENERAL">GENERAL</option>
                    <option value="HARDWARE">HARDWARE</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Auto-Routing Helper Pill */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  Auto-routing target:
                </span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                  {predictedDept}
                </span>
              </div>

              {/* Customer Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Email (for tracking alerts)
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide details about the issue, error codes, or context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !title || !description}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Lodge & Assigning...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Lodge Complaint & Auto-Assign</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
