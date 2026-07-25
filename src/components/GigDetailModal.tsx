import React, { useState } from 'react';
import {
  X,
  Clock,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Zap,
  Target,
  FileText,
  MessageSquare,
  Plus,
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { InnovationGig, UserProfile } from '../types';

interface GigDetailModalProps {
  gig: InnovationGig | null;
  onClose: () => void;
  onApplyForGig: (gig: InnovationGig, roleId?: string) => void;
  onUpdateDeliverableStatus: (gigId: string, deliverableId: string, status: 'Pending' | 'In Progress' | 'Under Review' | 'Completed') => void;
  onAddStatusUpdate: (gigId: string, message: string, type: 'general' | 'milestone' | 'blocker' | 'release') => void;
  onAddDeliverable: (gigId: string, deliverable: { phaseNumber: number; phaseTitle: string; title: string; description: string; dueDate: string; assignedRoleTitle?: string }) => void;
  currentUser: UserProfile;
}

export const GigDetailModal: React.FC<GigDetailModalProps> = ({
  gig,
  onClose,
  onApplyForGig,
  onUpdateDeliverableStatus,
  onAddStatusUpdate,
  onAddDeliverable,
  currentUser,
}) => {
  if (!gig) return null;

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'roles' | 'milestones' | 'updates'>('overview');
  const [newUpdateText, setNewUpdateText] = useState('');
  const [updateType, setUpdateType] = useState<'general' | 'milestone' | 'blocker' | 'release'>('general');
  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [newPhaseNum, setNewPhaseNum] = useState(1);
  const [newPhaseTitle, setNewPhaseTitle] = useState('Phase 1: Foundation');
  const [newDelTitle, setNewDelTitle] = useState('');
  const [newDelDesc, setNewDelDesc] = useState('');
  const [newDelDueDate, setNewDelDueDate] = useState('');

  // Calculations
  const totalDeliverables = gig.deliverables.length;
  const completedDeliverables = gig.deliverables.filter((d) => d.status === 'Completed').length;
  const progressPercent = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateText.trim()) return;
    onAddStatusUpdate(gig.id, newUpdateText.trim(), updateType);
    setNewUpdateText('');
  };

  const handleCreateDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelTitle.trim()) return;
    onAddDeliverable(gig.id, {
      phaseNumber: newPhaseNum,
      phaseTitle: newPhaseTitle,
      title: newDelTitle.trim(),
      description: newDelDesc.trim() || 'Key phase deliverable.',
      dueDate: newDelDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });
    setNewDelTitle('');
    setNewDelDesc('');
    setShowAddDeliverable(false);
  };

  return (
    <div id="gig-detail-modal-overlay" className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div id="gig-detail-modal-content" className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div id="modal-header-section" className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {gig.innovationId}
              </span>
              <span className="text-xs text-slate-500 font-medium">{gig.department}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {gig.status}
              </span>
            </div>
            <button
              id="close-gig-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{gig.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{gig.tagline}</p>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 pt-2 border-t border-slate-200 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Duration: <strong>{gig.durationWeeks} Weeks</strong> ({gig.weeklyHoursExpected} hrs/week)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Reward Value: <strong>{gig.totalValuePoints} Skill Points</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Contributors: <strong>{gig.activeContributorsCount} Active</strong></span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-slate-500">Phase Completion:</span>
              <span className="font-mono font-bold text-indigo-600">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div id="modal-tab-bar" className="flex items-center gap-1 px-6 bg-white border-b border-slate-200 text-sm font-medium overflow-x-auto">
          <button
            id="tab-btn-overview"
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-3 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeSubTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1.5" />
            Use Case & Overview
          </button>

          <button
            id="tab-btn-roles"
            onClick={() => setActiveSubTab('roles')}
            className={`px-4 py-3 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeSubTab === 'roles'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1.5" />
            Team & Required Skillsets
          </button>

          <button
            id="tab-btn-milestones"
            onClick={() => setActiveSubTab('milestones')}
            className={`px-4 py-3 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeSubTab === 'milestones'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
            Phase Deliverables ({completedDeliverables}/{totalDeliverables})
          </button>

          <button
            id="tab-btn-updates"
            onClick={() => setActiveSubTab('updates')}
            className={`px-4 py-3 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeSubTab === 'updates'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-1.5" />
            Project Updates ({gig.statusUpdates.length})
          </button>
        </div>

        {/* Modal Body Content Area */}
        <div id="modal-body-container" className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Business Use Case & Problem */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Business Use Case & Solution Objectives
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{gig.useCase}</p>
              </div>

              {/* Target Impact & ROI */}
              <div className="bg-indigo-50/60 p-5 rounded-xl border border-indigo-200">
                <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  Target Business Impact & Measurable Outcome
                </h3>
                <p className="text-sm text-indigo-950 font-semibold">{gig.targetImpact}</p>
              </div>

              {/* Tags & Metadata */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-2">Category & Technology Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {gig.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Owner Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={gig.ownerAvatar} alt={gig.ownerName} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{gig.ownerName}</h4>
                    <p className="text-xs text-slate-500">{gig.ownerTitle} • {gig.department}</p>
                    <p className="text-xs text-indigo-600 font-medium mt-0.5">{gig.ownerEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block font-medium">Gig Owner</span>
                  <button
                    onClick={() => onApplyForGig(gig)}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Apply to Team
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEAM ROLES NEEDED */}
          {activeSubTab === 'roles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Required Team Roles & Skillsets</h3>
                  <p className="text-xs text-slate-500">Select an open position to apply your skills</p>
                </div>
                <button
                  onClick={() => onApplyForGig(gig)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  General Application
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gig.requiredRoles.map((role) => (
                  <div
                    key={role.id}
                    className={`p-4 rounded-xl border transition-all ${
                      role.status === 'Open'
                        ? 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                        : 'bg-slate-100/60 border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-900">{role.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          role.status === 'Open'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {role.status} ({role.filledCount}/{role.spotsCount})
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1 mb-3">
                      <p>• Expected Commitment: <strong>{role.hoursPerWeek} hrs/week</strong></p>
                      <p>• Recognition Value: <strong>{role.valuePoints} Skill Points</strong></p>
                    </div>

                    <div className="mb-3">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">Required Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {role.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {role.status === 'Open' ? (
                      <button
                        id={`apply-role-btn-${role.id}`}
                        onClick={() => onApplyForGig(gig, role.id)}
                        className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Apply for {role.title}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="text-xs text-slate-500 italic text-center py-1 bg-slate-200 rounded font-medium">
                        Position Filled
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MILESTONES & PHASE DELIVERABLES */}
          {activeSubTab === 'milestones' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Project Milestones & Deliverables</h3>
                  <p className="text-xs text-slate-500">Track phase completions, due dates, and evidence attachments</p>
                </div>
                <button
                  id="add-deliverable-modal-btn"
                  onClick={() => setShowAddDeliverable(!showAddDeliverable)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-indigo-700 text-xs font-semibold border border-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Milestone
                </button>
              </div>

              {/* Add Deliverable Form */}
              {showAddDeliverable && (
                <form onSubmit={handleCreateDeliverable} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase">New Milestone Deliverable</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-600 block mb-1 font-semibold">Phase Title</label>
                      <input
                        type="text"
                        value={newPhaseTitle}
                        onChange={(e) => setNewPhaseTitle(e.target.value)}
                        placeholder="e.g. Phase 2: MVP Development"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 block mb-1 font-semibold">Deliverable Title</label>
                      <input
                        type="text"
                        value={newDelTitle}
                        onChange={(e) => setNewDelTitle(e.target.value)}
                        placeholder="e.g. System Prompt Spec & Tests"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-semibold">Description / Acceptance Criteria</label>
                    <textarea
                      value={newDelDesc}
                      onChange={(e) => setNewDelDesc(e.target.value)}
                      rows={2}
                      placeholder="Specify deliverables expected in this phase..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDeliverable(false)}
                      className="px-3 py-1 rounded text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white cursor-pointer"
                    >
                      Save Deliverable
                    </button>
                  </div>
                </form>
              )}

              {/* Deliverables Checklist List */}
              <div className="space-y-4">
                {gig.deliverables.map((del) => (
                  <div
                    key={del.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => {
                            const nextStatus =
                              del.status === 'Completed'
                                ? 'Pending'
                                : del.status === 'In Progress'
                                ? 'Completed'
                                : 'In Progress';
                            onUpdateDeliverableStatus(gig.id, del.id, nextStatus);
                          }}
                          className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                            del.status === 'Completed'
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-400 hover:border-indigo-600 bg-white'
                          }`}
                          title="Click to toggle status"
                        >
                          {del.status === 'Completed' && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div>
                          <span className="text-[10px] font-bold font-mono text-indigo-700 uppercase tracking-wider block">
                            {del.phaseTitle}
                          </span>
                          <h4 className={`text-sm font-bold ${del.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {del.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1">{del.description}</p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                          del.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : del.status === 'In Progress'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {del.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 font-medium">
                      <div className="flex items-center gap-3">
                        <span>Due: <strong className="text-slate-800">{del.dueDate}</strong></span>
                        {del.assignedContributorName && (
                          <span>Assignee: <strong className="text-indigo-700">{del.assignedContributorName}</strong></span>
                        )}
                      </div>

                      {del.evidenceLink && (
                        <a
                          href={del.evidenceLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Artifact Evidence
                        </a>
                      )}
                    </div>

                    {del.completionNotes && (
                      <p className="text-xs bg-white p-2 rounded text-slate-700 border border-slate-200">
                        💬 <strong>Note:</strong> {del.completionNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROJECT STATUS UPDATES */}
          {activeSubTab === 'updates' && (
            <div className="space-y-6">
              {/* Post New Update Box */}
              <form onSubmit={handlePostUpdate} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase">Post Project Status Update</h4>
                
                <textarea
                  value={newUpdateText}
                  onChange={(e) => setNewUpdateText(e.target.value)}
                  placeholder="Share a milestone progress report, blocker notice, or release update with the team and stakeholders..."
                  rows={2}
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-semibold">Type:</span>
                    <select
                      value={updateType}
                      onChange={(e: any) => setUpdateType(e.target.value)}
                      className="bg-white border border-slate-300 text-xs text-slate-800 rounded px-2 py-1 font-medium"
                    >
                      <option value="general">General Progress</option>
                      <option value="milestone">Milestone Achieved</option>
                      <option value="blocker">Blocker / Help Needed</option>
                      <option value="release">Production Release</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post Update
                  </button>
                </div>
              </form>

              {/* Updates Feed */}
              <div className="space-y-4">
                {gig.statusUpdates.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No status updates posted yet. Be the first to share progress!</p>
                ) : (
                  gig.statusUpdates.map((upd) => (
                    <div key={upd.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={upd.authorAvatar} alt={upd.authorName} className="w-7 h-7 rounded-full object-cover border border-slate-300" />
                          <div>
                            <span className="text-xs font-bold text-slate-900">{upd.authorName}</span>
                            <span className="text-[11px] text-slate-500 ml-2">({upd.authorRole})</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{upd.date}</span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed pl-9">{upd.message}</p>

                      {upd.phaseTag && (
                        <div className="pl-9">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {upd.phaseTag}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div id="modal-footer-section" className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Selected from Idea Box Portal • <span className="text-indigo-600">{gig.ownerEmail}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => onApplyForGig(gig)}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Apply to Contribute Skills
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
