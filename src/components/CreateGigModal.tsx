import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, ShieldCheck, Clock, Award, Target, Loader2 } from 'lucide-react';
import { InnovationGig, RequiredRole, PhaseDeliverable } from '../types';
import { generateGigWithAI } from '../services/api';

interface CreateGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGig: (gig: InnovationGig) => void;
  ownerName: string;
  ownerTitle: string;
  ownerAvatar: string;
  ownerEmail: string;
}

export const CreateGigModal: React.FC<CreateGigModalProps> = ({
  isOpen,
  onClose,
  onCreateGig,
  ownerName,
  ownerTitle,
  ownerAvatar,
  ownerEmail,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Enterprise AI & Innovation');
  const [useCase, setUseCase] = useState('');
  const [targetImpact, setTargetImpact] = useState('');
  const [tagline, setTagline] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(6);
  const [weeklyHoursExpected, setWeeklyHoursExpected] = useState(4);
  const [totalValuePoints, setTotalValuePoints] = useState(2000);
  const [tagsInput, setTagsInput] = useState('GenAI, Automation, Cloud');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Dynamic roles list
  const [roles, setRoles] = useState<RequiredRole[]>([
    {
      id: 'role-new-1',
      title: 'Full Stack Engineer',
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      spotsCount: 1,
      filledCount: 0,
      hoursPerWeek: 4,
      valuePoints: 600,
      status: 'Open',
    },
    {
      id: 'role-new-2',
      title: 'GenAI / Domain Lead',
      skills: ['Gemini API', 'Node.js', 'Data Specs'],
      spotsCount: 1,
      filledCount: 0,
      hoursPerWeek: 4,
      valuePoints: 800,
      status: 'Open',
    },
  ]);

  // Dynamic deliverables list
  const [deliverables, setDeliverables] = useState<PhaseDeliverable[]>([
    {
      id: 'del-new-1',
      phaseNumber: 1,
      phaseTitle: 'Phase 1: Architecture & Technical Spec',
      title: 'System Requirements & Architecture Document',
      description: 'Define input schemas, system endpoints, and user workflows.',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      assignedRoleTitle: 'Full Stack Engineer',
      status: 'Pending',
    },
    {
      id: 'del-new-2',
      phaseNumber: 2,
      phaseTitle: 'Phase 2: MVP Development',
      title: 'MVP Prototype Build & Integration',
      description: 'Construct core UI and connect server AI endpoints.',
      dueDate: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
      assignedRoleTitle: 'GenAI / Domain Lead',
      status: 'Pending',
    },
  ]);

  // AI Assist auto-generate handler
  const handleAIGenerate = async () => {
    if (!title && !useCase) {
      alert('Please enter at least an Innovation Title or brief Idea Concept first.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const generated = await generateGigWithAI({
        title,
        ideaDescription: useCase,
        department,
      });

      if (generated) {
        if (generated.tagline) setTagline(generated.tagline);
        if (generated.useCase) setUseCase(generated.useCase);
        if (generated.targetImpact) setTargetImpact(generated.targetImpact);
        if (generated.durationWeeks) setDurationWeeks(generated.durationWeeks);
        if (generated.weeklyHoursExpected) setWeeklyHoursExpected(generated.weeklyHoursExpected);
        if (generated.totalValuePoints) setTotalValuePoints(generated.totalValuePoints);
        if (generated.tags && generated.tags.length > 0) setTagsInput(generated.tags.join(', '));

        if (generated.requiredRoles && generated.requiredRoles.length > 0) {
          setRoles(
            generated.requiredRoles.map((r: any, idx: number) => ({
              id: `role-gen-${idx}`,
              title: r.title || 'Team Contributor',
              skills: Array.isArray(r.skills) ? r.skills : ['TypeScript', 'Problem Solving'],
              spotsCount: r.spotsCount || 1,
              filledCount: 0,
              hoursPerWeek: r.hoursPerWeek || 4,
              valuePoints: r.valuePoints || 600,
              status: 'Open',
            }))
          );
        }

        if (generated.deliverables && generated.deliverables.length > 0) {
          setDeliverables(
            generated.deliverables.map((d: any, idx: number) => ({
              id: `del-gen-${idx}`,
              phaseNumber: d.phaseNumber || idx + 1,
              phaseTitle: d.phaseTitle || `Phase ${idx + 1}: Execution`,
              title: d.title || 'Phase Key Deliverable',
              description: d.description || 'Detailed phase requirement.',
              dueDate: new Date(Date.now() + (d.dueDateDaysFromStart || (idx + 1) * 14) * 86400000)
                .toISOString()
                .split('T')[0],
              assignedRoleTitle: d.assignedRoleTitle || 'Team Contributor',
              status: 'Pending',
            }))
          );
        }
      }
    } catch (err) {
      console.error('Error generating gig:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddRole = () => {
    setRoles([
      ...roles,
      {
        id: `role-${Date.now()}`,
        title: 'Specialist Contributor',
        skills: ['Domain Expertise'],
        spotsCount: 1,
        filledCount: 0,
        hoursPerWeek: 3,
        valuePoints: 500,
        status: 'Open',
      },
    ]);
  };

  const handleRemoveRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !useCase.trim()) return;

    const randomNum = Math.floor(100 + Math.random() * 900);
    const newGig: InnovationGig = {
      id: `gig-${Date.now()}`,
      innovationId: `INN-2026-${randomNum}`,
      title: title.trim(),
      tagline: tagline.trim() || title.trim(),
      department,
      ownerName,
      ownerTitle,
      ownerAvatar,
      ownerEmail,
      useCase: useCase.trim(),
      targetImpact: targetImpact.trim() || 'Accelerate enterprise productivity and deliver business value.',
      durationWeeks,
      weeklyHoursExpected,
      status: 'In Progress',
      createdAt: new Date().toISOString().split('T')[0],
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      totalValuePoints,
      activeContributorsCount: 0,
      requiredRoles: roles,
      deliverables,
      statusUpdates: [
        {
          id: `upd-${Date.now()}`,
          authorName: ownerName,
          authorRole: 'Project Owner',
          authorAvatar: ownerAvatar,
          date: new Date().toISOString().split('T')[0],
          message: '🚀 Gig officially published to the Innovation Portal Marketplace! Open for skill contribution applications.',
          type: 'general',
        },
      ],
    };

    onCreateGig(newGig);
    onClose();
  };

  return (
    <div id="create-gig-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div id="create-gig-modal-content" className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Post Innovation Gig
            </h2>
            <p className="text-xs text-slate-400">Import or publish an approved innovation portal idea for employee skill contribution</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Generator Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-indigo-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Gemini AI Gig Generator</h4>
              <p className="text-xs text-slate-300">Type an idea title & description, then let Gemini auto-fill roles and phase deliverables!</p>
            </div>
          </div>
          <button
            id="ai-autofill-btn"
            type="button"
            onClick={handleAIGenerate}
            disabled={isGeneratingAI}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI Auto-Fill</span>
              </>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Title & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Innovation Idea Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Autonomous Supplier Contract Summarizer"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Department / Unit</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Enterprise AI Lab">Enterprise AI Lab</option>
                <option value="Supply Chain & Ops">Supply Chain & Ops</option>
                <option value="Customer Experience">Customer Experience</option>
                <option value="ESG & Facilities">ESG & Facilities</option>
                <option value="Engineering Enablement">Engineering Enablement</option>
                <option value="FinTech Platform">FinTech Platform</option>
              </select>
            </div>
          </div>

          {/* Catchy Tagline */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Catchy Tagline / Summary</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. AI agent to parse legal PDFs and benchmark supplier pricing"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Detailed Use Case */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Business Use Case & Solution Objectives *</label>
            <textarea
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              rows={3}
              placeholder="Describe the operational challenge, background context from Innovation Portal, and target technical solution..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Target Impact */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Target Business Impact / Expected ROI</label>
            <input
              type="text"
              value={targetImpact}
              onChange={(e) => setTargetImpact(e.target.value)}
              placeholder="e.g. Reduce contract auditing time by 75% and save $450K annually"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Duration, Hours, Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Duration (Weeks)</label>
              <input
                type="number"
                min={1}
                max={24}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Expected Hrs / Week</label>
              <input
                type="number"
                min={1}
                max={20}
                value={weeklyHoursExpected}
                onChange={(e) => setWeeklyHoursExpected(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Reward Value Points</label>
              <input
                type="number"
                min={100}
                step={100}
                value={totalValuePoints}
                onChange={(e) => setTotalValuePoints(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>
          </div>

          {/* Required Roles Management */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Required Team Roles ({roles.length})</h4>
              <button
                type="button"
                onClick={handleAddRole}
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Role
              </button>
            </div>

            <div className="space-y-3">
              {roles.map((r, idx) => (
                <div key={r.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                    <input
                      type="text"
                      value={r.title}
                      onChange={(e) => {
                        const updated = [...roles];
                        updated[idx].title = e.target.value;
                        setRoles(updated);
                      }}
                      placeholder="Role Title"
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    />
                    <input
                      type="text"
                      value={r.skills.join(', ')}
                      onChange={(e) => {
                        const updated = [...roles];
                        updated[idx].skills = e.target.value.split(',').map((s) => s.trim());
                        setRoles(updated);
                      }}
                      placeholder="Skills (comma separated)"
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    />
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <label>Hrs/wk:</label>
                      <input
                        type="number"
                        value={r.hoursPerWeek}
                        onChange={(e) => {
                          const updated = [...roles];
                          updated[idx].hoursPerWeek = Number(e.target.value);
                          setRoles(updated);
                        }}
                        className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>

                  {roles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(r.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              id="submit-gig-btn"
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20"
            >
              Publish Innovation Gig
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
