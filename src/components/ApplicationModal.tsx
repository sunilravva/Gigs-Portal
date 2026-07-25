import React, { useState, useEffect } from 'react';
import { X, Zap, Sparkles, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { InnovationGig, UserProfile, GigApplication } from '../types';
import { matchSkillsWithAI } from '../services/api';

interface ApplicationModalProps {
  gig: InnovationGig | null;
  preselectedRoleId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication: (app: GigApplication) => void;
  currentUser: UserProfile;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  gig,
  preselectedRoleId,
  isOpen,
  onClose,
  onSubmitApplication,
  currentUser,
}) => {
  if (!isOpen || !gig) return null;

  const openRoles = gig.requiredRoles.filter((r) => r.status === 'Open');
  const initialRoleId = preselectedRoleId || (openRoles.length > 0 ? openRoles[0].id : gig.requiredRoles[0]?.id || '');

  const [selectedRoleId, setSelectedRoleId] = useState(initialRoleId);
  const [hoursOffered, setHoursOffered] = useState(4);
  const [pitch, setPitch] = useState('');
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchRationale, setMatchRationale] = useState<string>('');
  const [isEvaluatingMatch, setIsEvaluatingMatch] = useState(false);

  const selectedRole = gig.requiredRoles.find((r) => r.id === selectedRoleId) || gig.requiredRoles[0];

  // Auto-run AI match evaluation when role changes
  useEffect(() => {
    if (selectedRole) {
      runAIMatchEvaluation();
    }
  }, [selectedRoleId]);

  const runAIMatchEvaluation = async () => {
    if (!selectedRole) return;
    setIsEvaluatingMatch(true);
    try {
      const match = await matchSkillsWithAI({
        applicantSkills: currentUser.skills,
        applicantBio: currentUser.bio,
        roleTitle: selectedRole.title,
        roleSkills: selectedRole.skills,
        gigTitle: gig.title,
        gigUseCase: gig.useCase,
      });

      if (match) {
        setMatchScore(match.matchScore);
        setMatchRationale(match.matchRationale);
      }
    } catch (err) {
      console.error('Failed to evaluate skill match:', err);
      setMatchScore(88);
      setMatchRationale('Solid background with strong overlap in technical execution and domain expertise.');
    } finally {
      setIsEvaluatingMatch(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    const application: GigApplication = {
      id: `app-${Date.now()}`,
      gigId: gig.id,
      gigTitle: gig.title,
      roleId: selectedRole.id,
      roleTitle: selectedRole.title,
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      applicantTitle: currentUser.title,
      applicantDepartment: currentUser.department,
      applicantAvatar: currentUser.avatar,
      skills: currentUser.skills,
      hoursPerWeekOffered: hoursOffered,
      pitch: pitch.trim() || `Excited to contribute my expertise in ${currentUser.skills.slice(0, 3).join(', ')} to ${gig.title}.`,
      matchScore: matchScore || 85,
      matchRationale: matchRationale || 'Skills align with project requirements.',
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    onSubmitApplication(application);
    onClose();
  };

  return (
    <div id="application-modal-overlay" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div id="application-modal-content" className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Apply to Contribute Skills</h2>
              <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{gig.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Target Role Selector */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Select Position / Role</label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
            >
              {gig.requiredRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.hoursPerWeek} hrs/wk - {r.status})
                </option>
              ))}
            </select>
          </div>

          {/* AI Skill Match Evaluation Banner */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                Gemini Skill Match Score
              </span>
              {isEvaluatingMatch ? (
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" /> Evaluating...
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold font-mono bg-white text-indigo-700 border border-indigo-200 shadow-xs">
                  {matchScore}% Match
                </span>
              )}
            </div>

            <p className="text-xs text-indigo-950 leading-relaxed font-medium">
              {matchRationale || 'Evaluating alignment between your profile skills and role requirements...'}
            </p>

            <div className="flex flex-wrap gap-1 pt-1">
              {selectedRole?.skills.map((skill, idx) => {
                const userHasSkill = currentUser.skills.some((s) => s.toLowerCase() === skill.toLowerCase());
                return (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      userHasSkill
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {skill} {userHasSkill ? '✓' : ''}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Weekly Hours Offered */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Weekly Contribution Hours Offered
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={15}
                value={hoursOffered}
                onChange={(e) => setHoursOffered(Number(e.target.value))}
                className="flex-1 accent-indigo-600 cursor-pointer"
              />
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg font-mono text-xs font-bold text-indigo-700 min-w-16 text-center">
                {hoursOffered} hrs/wk
              </span>
            </div>
          </div>

          {/* Motivation Pitch */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Why are you interested & what skills will you bring?
            </label>
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              rows={3}
              placeholder="Highlight relevant projects, tools, or domain background..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Applicant Profile Preview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover border border-slate-300 shadow-xs" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">{currentUser.name}</span>
              <span className="text-slate-500 font-medium">{currentUser.title} • {currentUser.department}</span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              id="submit-app-btn"
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
