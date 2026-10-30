import React from 'react';
import {
  Inbox,
  Clock,
  CheckCircle,
  AlertOctagon,
  Building2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export default function DashboardStats({ complaints, onFilterStatus }) {
  const total = complaints.length;
  const openCount = complaints.filter((c) => c.status === 'OPEN').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const assignedCount = complaints.filter((c) => c.assignment && c.assignment.department).length;

  const stats = [
    {
      label: 'Total Lodged',
      value: total,
      status: 'ALL',
      icon: Inbox,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-100 dark:border-indigo-900/50'
    },
    {
      label: 'Open / Pending',
      value: openCount,
      status: 'OPEN',
      icon: AlertOctagon,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/50'
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      status: 'IN_PROGRESS',
      icon: Clock,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      border: 'border-sky-100 dark:border-sky-900/50'
    },
    {
      label: 'Resolved',
      value: resolvedCount,
      status: 'RESOLVED',
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/50'
    }
  ];

  // Group departments
  const departmentCounts = complaints.reduce((acc, c) => {
    const dept = c.assignment?.department || 'UNASSIGNED';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              onClick={() => onFilterStatus && onFilterStatus(s.status)}
              className={`p-4 rounded-2xl border ${s.border} ${s.bg} cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {s.label}
                </span>
                <div className={`p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm ${s.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                  {s.value}
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3 text-indigo-500" />
                  {total > 0 ? Math.round((s.value / total) * 100) : 0}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Microservice Auto-Assignment Department Summary Banner */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
          <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">Active Microservice Assignments:</span>
          <span className="text-slate-500 dark:text-slate-400">
            {assignedCount} of {total} complaints auto-routed to departments
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(departmentCounts).map(([dept, count]) => {
            let color = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            if (dept === 'ESCALATION')
              color = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900';
            if (dept === 'GENERAL_SUPPORT')
              color = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900';
            if (dept === 'SELF_SERVICE')
              color = 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-200 dark:border-teal-900';
            if (dept === 'TECHNICAL')
              color = 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-900';
            if (dept === 'BILLING')
              color = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900';

            return (
              <span
                key={dept}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${color}`}
              >
                <span>{dept}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/60 dark:bg-black/30 text-[10px] font-bold">
                  {count}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
