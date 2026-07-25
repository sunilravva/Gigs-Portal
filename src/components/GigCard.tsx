import React from 'react';
import { Clock, Award, Users, CheckCircle2, ChevronRight, Zap, Target } from 'lucide-react';
import { InnovationGig } from '../types';

interface GigCardProps {
  gig: InnovationGig;
  onSelectGig: (gig: InnovationGig) => void;
  onApplyForGig: (gig: InnovationGig) => void;
}

export const GigCard: React.FC<GigCardProps> = ({ gig, onSelectGig, onApplyForGig }) => {
  // Calculate milestone completion percentage
  const totalDeliverables = gig.deliverables.length;
  const completedDeliverables = gig.deliverables.filter((d) => d.status === 'Completed').length;
  const progressPercent = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

  // Open roles count
  const openRoles = gig.requiredRoles.filter((r) => r.status === 'Open');
  const totalSpots = gig.requiredRoles.reduce((sum, r) => sum + r.spotsCount, 0);
  const filledSpots = gig.requiredRoles.reduce((sum, r) => sum + r.filledCount, 0);

  // Status badge styling
  const getStatusBadge = () => {
    switch (gig.status) {
      case 'In Progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>In Progress</span>;
      case 'Completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"><CheckCircle2 className="w-3 h-3 text-indigo-600" /> Completed</span>;
      case 'Backlog':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Open / Backlog</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">{gig.status}</span>;
    }
  };

  return (
    <div
      id={`gig-card-${gig.id}`}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      <div className="p-5">
        
        {/* Header: Innovation ID + Department + Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {gig.innovationId}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {gig.department}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Gig Title & Tagline */}
        <h3
          onClick={() => onSelectGig(gig)}
          className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2 mb-1.5"
        >
          {gig.title}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {gig.tagline}
        </p>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-4">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span><strong>{gig.durationWeeks} wks</strong> ({gig.weeklyHoursExpected}h/wk)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span><strong>{gig.totalValuePoints}</strong> Skill Points</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 col-span-2">
            <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate"><strong>Impact:</strong> {gig.targetImpact}</span>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Phase Progress</span>
            <span className="font-mono text-indigo-600 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Roles Needed Summary */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-500 font-medium">Team Skill Roles:</span>
            <span className="text-slate-700 font-semibold">
              {filledSpots}/{totalSpots} Spots Filled
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gig.requiredRoles.map((role) => (
              <span
                key={role.id}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                  role.status === 'Open'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-70'
                }`}
              >
                {role.title} {role.status === 'Open' && `(${role.hoursPerWeek}h)`}
              </span>
            ))}
          </div>
        </div>

        {/* Tag pills */}
        <div className="flex flex-wrap gap-1 mb-2">
          {gig.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Owner Info + Actions */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={gig.ownerAvatar}
            alt={gig.ownerName}
            className="w-7 h-7 rounded-full object-cover border border-slate-200"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{gig.ownerName}</p>
            <p className="text-[10px] text-slate-500 truncate">{gig.ownerTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {openRoles.length > 0 && gig.status !== 'Completed' && (
            <button
              id={`apply-gig-btn-${gig.id}`}
              onClick={() => onApplyForGig(gig)}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              <span>Apply</span>
            </button>
          )}

          <button
            id={`view-gig-btn-${gig.id}`}
            onClick={() => onSelectGig(gig)}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
          >
            <span>Details</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
