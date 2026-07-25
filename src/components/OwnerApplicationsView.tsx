import React from 'react';
import { Check, X, Sparkles, User, Briefcase, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { GigApplication } from '../types';

interface OwnerApplicationsViewProps {
  applications: GigApplication[];
  onAcceptApplication: (appId: string) => void;
  onDeclineApplication: (appId: string) => void;
}

export const OwnerApplicationsView: React.FC<OwnerApplicationsViewProps> = ({
  applications,
  onAcceptApplication,
  onDeclineApplication,
}) => {
  const pendingApps = applications.filter((a) => a.status === 'Pending' || a.status === 'Shortlisted');
  const processedApps = applications.filter((a) => a.status === 'Accepted' || a.status === 'Declined');

  return (
    <div id="owner-applications-container" className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Applicant Skill Review & Team Selection
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review employee applications for your posted innovation gigs. Gemini AI evaluates skill alignment for optimal team composition.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs font-bold">
          {pendingApps.length} Pending Reviews
        </div>
      </div>

      {/* Pending Applications Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Pending Reviews ({pendingApps.length})
        </h3>

        {pendingApps.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs shadow-xs">
            No pending applications to review right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingApps.map((app) => (
              <div
                key={app.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
                  
                  {/* Applicant Profile */}
                  <div className="flex items-center gap-3">
                    <img
                      src={app.applicantAvatar}
                      alt={app.applicantName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600 shadow-xs"
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{app.applicantName}</h4>
                      <p className="text-xs text-slate-500 font-medium">{app.applicantTitle} • {app.applicantDepartment}</p>
                      <span className="text-xs text-indigo-600 font-semibold">
                        Applying for: <strong>{app.roleTitle}</strong> in <em>{app.gigTitle}</em>
                      </span>
                    </div>
                  </div>

                  {/* AI Match Pill & Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Gemini Match Score</span>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        {app.matchScore}%
                      </span>
                    </div>

                    <button
                      id={`accept-app-btn-${app.id}`}
                      onClick={() => onAcceptApplication(app.id)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Accept Contributor
                    </button>

                    <button
                      id={`decline-app-btn-${app.id}`}
                      onClick={() => onDeclineApplication(app.id)}
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pitch & Rationale */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">💬 Applicant Pitch:</span>
                    <p className="text-slate-700 leading-relaxed">{app.pitch}</p>
                    <div className="mt-2 text-indigo-700 font-mono text-[11px] font-bold">
                      Hours Offered: <strong>{app.hoursPerWeekOffered} hrs/week</strong>
                    </div>
                  </div>

                  <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200">
                    <span className="font-bold text-indigo-900 block mb-1">✨ AI Match Rationale:</span>
                    <p className="text-indigo-950 leading-relaxed font-medium">{app.matchRationale}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {app.skills.map((s, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 rounded text-[10px] bg-white text-slate-700 border border-slate-200 font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed History */}
      {processedApps.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Processed Reviews ({processedApps.length})
          </h3>
          <div className="space-y-2">
            {processedApps.map((app) => (
              <div
                key={app.id}
                className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <img src={app.applicantAvatar} alt={app.applicantName} className="w-7 h-7 rounded-full object-cover" />
                  <div>
                    <span className="font-bold text-slate-900">{app.applicantName}</span>
                    <span className="text-slate-500 ml-2">for {app.roleTitle} in {app.gigTitle}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    app.status === 'Accepted'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
