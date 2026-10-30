import React, { useState } from 'react';
import {
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Activity,
  User,
  SlidersHorizontal
} from 'lucide-react';

export default function ComplaintsTable({
  complaints = [],
  searchQuery = '',
  statusFilter = 'ALL',
  setStatusFilter,
  onSelectComplaint,
  selectedComplaintId
}) {
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.assignment?.department?.toLowerCase().includes(q) ||
      c.assignment?.assignedTo?.toLowerCase().includes(q) ||
      String(c.id).includes(q);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'RESOLVED'
        ? c.status === 'RESOLVED' || c.status === 'CLOSED'
        : c.status === statusFilter);

    const matchesPriority =
      priorityFilter === 'ALL' || c.priority === priorityFilter;

    const matchesDept =
      departmentFilter === 'ALL' ||
      c.assignment?.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDept;
  });

  const getSmallStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Open</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse"></span>
            <span>In Progress</span>
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Resolved</span>
          </span>
        );
      case 'CLOSED':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            <span>{status || 'Closed'}</span>
          </span>
        );
    }
  };

  const getSmallPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs text-rose-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>High</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Medium</span>
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs text-[#71717A] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#71717A]"></span>
            <span>Low</span>
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden shadow-sm">
      {/* Table Filter Header */}
      <div className="p-3.5 border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#27272A] text-[#FAFAFA]'
                    : 'text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#27272A]/50'
                }`}
              >
                {status === 'ALL' ? 'All' : status.replace('_', ' ')}
              </button>
            );
          })}
        </div>

        {/* Priority & Department Filters */}
        <div className="flex items-center space-x-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#111113] border border-[#27272A] text-[#A1A1AA] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#8B5CF6]"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <span className="text-[11px] text-[#71717A] font-mono">
            {filtered.length} {filtered.length === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#27272A] text-[11px] font-medium text-[#71717A] bg-[#111113]/50">
              <th className="py-2.5 px-4 w-16">ID</th>
              <th className="py-2.5 px-4">Title & Category</th>
              <th className="py-2.5 px-4 w-28">Priority</th>
              <th className="py-2.5 px-4 w-44">Department & Agent</th>
              <th className="py-2.5 px-4 w-32">Status</th>
              <th className="py-2.5 px-4 w-36">Logged</th>
              <th className="py-2.5 px-3 w-10 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A]">
            {filtered.length > 0 ? (
              filtered.map((ticket) => {
                const isSelected = selectedComplaintId === ticket.id;
                return (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectComplaint(ticket)}
                    className={`transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/15'
                        : 'hover:bg-[#1f1f23]'
                    }`}
                  >
                    {/* Ticket ID */}
                    <td className="py-3 px-4 font-mono text-[11px] text-[#71717A]">
                      #{ticket.id}
                    </td>

                    {/* Title & Category */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#FAFAFA] truncate max-w-sm">
                        {ticket.title}
                      </div>
                      <div className="mt-0.5 flex items-center space-x-2">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-[#111113] border border-[#27272A] text-[#A1A1AA]">
                          {ticket.category || 'GENERAL'}
                        </span>
                        <span className="text-[10px] text-[#71717A] truncate max-w-[200px]">
                          {ticket.description}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      {getSmallPriorityBadge(ticket.priority)}
                    </td>

                    {/* Department & Agent */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-[#FAFAFA]">
                        {ticket.assignment?.department || 'GENERAL_SUPPORT'}
                      </div>
                      <div className="text-[10px] text-[#71717A] flex items-center space-x-1">
                        <User className="w-3 h-3 text-[#71717A]" />
                        <span>{ticket.assignment?.assignedTo || 'Auto-Queue'}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {getSmallStatusBadge(ticket.status)}
                    </td>

                    {/* Logged Date */}
                    <td className="py-3 px-4 text-[11px] text-[#71717A] font-mono">
                      {formatDate(ticket.createdAt)}
                    </td>

                    {/* Chevron */}
                    <td className="py-3 px-3 text-right">
                      <ChevronRight className="w-4 h-4 text-[#71717A] inline-block" />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-12 text-center text-[#71717A] text-xs">
                  No tickets found matching your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
