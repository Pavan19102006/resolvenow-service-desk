import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  User,
  Calendar,
  ChevronRight,
  MoreVertical,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function ComplaintList({
  complaints,
  onRefresh,
  selectedComplaintId,
  onSelectComplaint
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  // Filtering
  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.assignment?.department &&
        c.assignment.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = async (id, newStatus, e) => {
    e.stopPropagation();
    try {
      setUpdatingId(id);
      await api.complaints.updateStatus(id, newStatus);
      onRefresh();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            High Priority
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Medium Priority
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Low Priority
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse"></span> In Progress
          </span>
        );
      case 'RESOLVED':
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle className="h-3 w-3 text-emerald-500" /> Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search complaints, descriptions, or departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {status === 'ALL' ? 'All Complaints' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List Grid */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((complaint) => {
            const isSelected = selectedComplaintId === complaint.id;
            return (
              <div
                key={complaint.id}
                onClick={() => onSelectComplaint && onSelectComplaint(complaint.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 border-indigo-400 dark:border-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      #{complaint.id}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {complaint.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(complaint.priority)}
                    {getStatusBadge(complaint.status)}
                  </div>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {complaint.description}
                </p>

                {/* Bottom Row: Assignment & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {/* Microservice Auto-Assignment Tag */}
                  <div className="flex flex-wrap items-center gap-2">
                    {complaint.assignment ? (
                      <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                        <span>Assigned to:</span>
                        <strong className="font-bold text-indigo-900 dark:text-indigo-200">
                          {complaint.assignment.department}
                        </strong>
                        <span className="text-[10px] text-slate-400">
                          ({complaint.assignment.assignedTo})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500 text-xs">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Awaiting Assignment</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Quick Status Action Buttons */}
                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    {complaint.status === 'OPEN' && (
                      <button
                        disabled={updatingId === complaint.id}
                        onClick={(e) => handleStatusChange(complaint.id, 'IN_PROGRESS', e)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-colors"
                      >
                        Start Progress
                      </button>
                    )}

                    {complaint.status !== 'RESOLVED' && (
                      <button
                        disabled={updatingId === complaint.id}
                        onClick={(e) => handleStatusChange(complaint.id, 'RESOLVED', e)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              No complaints found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search filters or lodge a new complaint.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
