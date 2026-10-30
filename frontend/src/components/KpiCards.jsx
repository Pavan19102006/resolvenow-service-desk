import React from 'react';
import {
  Inbox,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Layers
} from 'lucide-react';

export default function KpiCards({ complaints = [], currentUser, onFilterStatus }) {
  const role = currentUser?.role || 'USER';
  const isCustomer = role === 'USER';
  const isStaff = role === 'STAFF';
  const isAdmin = role === 'ADMIN';

  const total = complaints.length;
  const openCount = complaints.filter((c) => c.status === 'OPEN').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
  ).length;

  const staffDept = currentUser?.department || 'TECHNICAL';

  let cards = [];

  if (isCustomer) {
    cards = [
      {
        title: `My Requests (${currentUser?.username || 'Customer'})`,
        value: total,
        subtext: `Submitted by user #${currentUser?.id || 1}`,
        statusKey: 'ALL',
        icon: Inbox,
        iconColor: 'text-[#8B5CF6]',
        iconBg: 'bg-[#8B5CF6]/10 border border-[#8B5CF6]/20'
      },
      {
        title: 'Awaiting Response',
        value: openCount,
        subtext: 'In queue for staff review',
        statusKey: 'OPEN',
        icon: Clock,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-400/10 border border-amber-400/20'
      },
      {
        title: 'Support in Action',
        value: inProgressCount,
        subtext: 'Currently being investigated',
        statusKey: 'IN_PROGRESS',
        icon: Activity,
        iconColor: 'text-[#8B5CF6]',
        iconBg: 'bg-[#8B5CF6]/10 border border-[#8B5CF6]/20'
      },
      {
        title: 'Resolved for Me',
        value: resolvedCount,
        subtext: 'Satisfied and closed',
        statusKey: 'RESOLVED',
        icon: CheckCircle2,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-400/10 border border-emerald-400/20'
      }
    ];
  } else if (isStaff) {
    cards = [
      {
        title: `${staffDept.replace('_', ' ')} Queue`,
        value: total,
        subtext: `All tickets in ${staffDept}`,
        statusKey: 'ALL',
        icon: UserCheck,
        iconColor: 'text-[#8B5CF6]',
        iconBg: 'bg-[#8B5CF6]/10 border border-[#8B5CF6]/20'
      },
      {
        title: `${staffDept.replace('_', ' ')} Open`,
        value: openCount,
        subtext: `Pending pickup in ${staffDept}`,
        statusKey: 'OPEN',
        icon: Clock,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-400/10 border border-amber-400/20'
      },
      {
        title: 'In Active Resolution',
        value: inProgressCount,
        subtext: `Work in progress in ${staffDept}`,
        statusKey: 'IN_PROGRESS',
        icon: Activity,
        iconColor: 'text-[#8B5CF6]',
        iconBg: 'bg-[#8B5CF6]/10 border border-[#8B5CF6]/20'
      },
      {
        title: 'Resolved in Department',
        value: resolvedCount,
        subtext: `Completed by ${staffDept} staff`,
        statusKey: 'RESOLVED',
        icon: CheckCircle2,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-400/10 border border-emerald-400/20'
      }
    ];
  } else {
    // Admin Perspective
    const escalatedCount = complaints.filter(
      (c) => c.assignment?.department === 'ESCALATION' || c.priority === 'HIGH' || c.priority === 'CRITICAL'
    ).length;

    cards = [
      {
        title: 'Platform Total Volume',
        value: total,
        subtext: 'All complaints across all departments',
        statusKey: 'ALL',
        icon: Inbox,
        iconColor: 'text-[#8B5CF6]',
        iconBg: 'bg-[#8B5CF6]/10 border border-[#8B5CF6]/20'
      },
      {
        title: 'Escalations & SLA Risk',
        value: escalatedCount,
        subtext: 'High-priority or Tier 2 escalated',
        statusKey: 'ESCALATION',
        icon: ShieldAlert,
        iconColor: 'text-rose-400',
        iconBg: 'bg-rose-400/10 border border-rose-400/20'
      },
      {
        title: 'Fleetwide In Progress',
        value: inProgressCount,
        subtext: 'Tickets actively handled by staff',
        statusKey: 'IN_PROGRESS',
        icon: Activity,
        iconColor: 'text-[#8B5CF6]',
        iconBg: 'bg-[#8B5CF6]/10 border border-[#8B5CF6]/20'
      },
      {
        title: 'Platform Resolution Rate',
        value: total > 0 ? `${Math.round((resolvedCount / total) * 100)}%` : '100%',
        subtext: `${resolvedCount} of ${total} tickets completed`,
        statusKey: 'RESOLVED',
        icon: CheckCircle2,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-400/10 border border-emerald-400/20'
      }
    ];
  }

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
              {typeof card.value === 'number' && total > 0 && (
                <span className="text-[11px] text-[#71717A] font-mono">
                  {Math.round((card.value / total) * 100)}%
                </span>
              )}
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
