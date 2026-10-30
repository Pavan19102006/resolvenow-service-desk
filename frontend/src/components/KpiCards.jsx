import React from 'react';
import {
  Inbox,
  Clock,
  Activity,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function KpiCards({ complaints = [], onFilterStatus }) {
  const total = complaints.length;
  const openCount = complaints.filter((c) => c.status === 'OPEN').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
  ).length;

  const cards = [
    {
      title: 'Total Lodged',
      value: total,
      subtext: 'Across all microservices',
      statusKey: 'ALL',
      icon: Inbox,
      iconColor: 'text-[#8B5CF6]',
      iconBg: 'bg-[#8B5CF6]/10 border border-[#8B5CF6]/20'
    },
    {
      title: 'Open Tickets',
      value: openCount,
      subtext: 'Pending team triage',
      statusKey: 'OPEN',
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-400/10 border border-amber-400/20'
    },
    {
      title: 'In Progress',
      value: inProgressCount,
      subtext: 'Active agent resolution',
      statusKey: 'IN_PROGRESS',
      icon: Activity,
      iconColor: 'text-[#8B5CF6]',
      iconBg: 'bg-[#8B5CF6]/10 border border-[#8B5CF6]/20'
    },
    {
      title: 'Resolved',
      value: resolvedCount,
      subtext: 'Completed & closed',
      statusKey: 'RESOLVED',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-400/10 border border-emerald-400/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            onClick={() => onFilterStatus && onFilterStatus(card.statusKey)}
            className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#8B5CF6]/40 transition-all duration-200 cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A1A1AA] group-hover:text-[#FAFAFA] transition-colors">
                {card.title}
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tracking-tight text-[#FAFAFA]">
                {card.value}
              </span>
              <span className="text-[11px] text-[#71717A] font-mono">
                {total > 0 ? `${Math.round((card.value / total) * 100)}%` : '0%'}
              </span>
            </div>

            <div className="mt-1 text-[11px] text-[#71717A] truncate">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
