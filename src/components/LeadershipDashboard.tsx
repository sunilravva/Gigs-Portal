import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Award,
  Clock,
  CheckCircle2,
  Sparkles,
  FileText,
  Loader2,
  DollarSign
} from 'lucide-react';
import { InnovationGig, LeadershipMetrics } from '../types';
import { generateExecutiveDigest } from '../services/api';

interface LeadershipDashboardProps {
  gigs: InnovationGig[];
  metrics: LeadershipMetrics;
}

export const LeadershipDashboard: React.FC<LeadershipDashboardProps> = ({ gigs, metrics }) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Status Distribution Data for Pie Chart
  const statusData = [
    { name: 'In Progress', value: metrics.inProgress, color: '#10B981' }, // Emerald
    { name: 'Completed', value: metrics.completed, color: '#4F46E5' },   // Indigo
    { name: 'Backlog / Open', value: metrics.backlog, color: '#F59E0B' }, // Amber
    { name: 'On Hold', value: metrics.onHold, color: '#64748B' },        // Slate
  ];

  // Top Skills Demand vs Supply
  const skillData = metrics.topSkillsDemand;

  // Monthly Completion Trend Data
  const trendData = metrics.monthlyCompletions;

  // Departmental Participation Data
  const deptData = metrics.departmentParticipation;

  // AI Executive Digest Handler
  const handleGenerateAIReport = async () => {
    setIsGeneratingReport(true);
    try {
      const summaryPayload = gigs.map((g) => ({
        title: g.title,
        status: g.status,
        department: g.department,
        impact: g.targetImpact,
        completedDeliverables: g.deliverables.filter((d) => d.status === 'Completed').length,
        totalDeliverables: g.deliverables.length,
      }));

      const report = await generateExecutiveDigest({
        gigsSummary: summaryPayload,
        metrics,
      });

      setAiReport(report);
    } catch (err) {
      console.error('Failed to generate AI executive report:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div id="leadership-dashboard-container" className="space-y-8">
      
      {/* Title & Action Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            Leadership & Executive Talent Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time telemetry on innovation gig throughput, cross-functional skill contribution hours, and ROI value creation.
          </p>
        </div>

        <button
          id="generate-csuite-report-btn"
          onClick={handleGenerateAIReport}
          disabled={isGeneratingReport}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 shrink-0 transition-all cursor-pointer"
        >
          {isGeneratingReport ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating AI Executive Briefing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Executive Report</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Tiles Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Total Gigs</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{metrics.totalGigs}</span>
          <span className="text-[10px] text-indigo-600 block mt-1 font-bold">Innovation Portal</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">In Progress</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">{metrics.inProgress}</span>
          <span className="text-[10px] text-emerald-700 block mt-1 font-bold">Active Sprints</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Open Backlog</span>
          <span className="text-2xl font-black text-amber-600 font-mono">{metrics.backlog}</span>
          <span className="text-[10px] text-amber-700 block mt-1 font-bold">Recruiting Talent</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-indigo-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Completed</span>
          <span className="text-2xl font-black text-indigo-600 font-mono">{metrics.completed}</span>
          <span className="text-[10px] text-indigo-700 block mt-1 font-bold">Shipped to Prod</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Skill Hours</span>
          <span className="text-2xl font-black text-purple-600 font-mono">{metrics.totalHoursContributed} h</span>
          <span className="text-[10px] text-purple-700 block mt-1 font-bold">Internal Mobility</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-teal-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Est. ROI Value</span>
          <span className="text-2xl font-black text-teal-700 font-mono">${(metrics.totalValueGenerated / 1000).toFixed(0)}K</span>
          <span className="text-[10px] text-teal-800 block mt-1 font-bold">Value Created</span>
        </div>
      </div>

      {/* AI Generated Executive Report Banner */}
      {aiReport && (
        <div className="p-6 bg-indigo-50/80 rounded-2xl border border-indigo-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-200">
            <h3 className="text-sm font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Gemini C-Suite Executive Briefing Report
            </h3>
            <button onClick={() => setAiReport(null)} className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer">
              Dismiss
            </button>
          </div>
          <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line space-y-2 font-medium">
            {aiReport}
          </div>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Gig Portfolio Status Distribution */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Portfolio Status Breakdown
            </h3>
            <span className="text-xs text-slate-500 font-mono font-bold">Total {metrics.totalGigs} Gigs</span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            {statusData.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.name}: <strong className="text-slate-900">{s.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Top Skills Demand */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top Skill Demands across Innovation Projects
            </h3>
            <span className="text-xs text-slate-500 font-medium">Required Skillsets</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="skill" type="category" stroke="#475569" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monthly Completion Trend */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Monthly Gig Completion & Onboarding Trend
            </h3>
            <span className="text-xs text-slate-500 font-medium">2026 Telemetry</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStarted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="completed" stroke="#10B981" fillOpacity={1} fill="url(#colorCompleted)" name="Completed Gigs" />
                <Area type="monotone" dataKey="started" stroke="#6366F1" fillOpacity={1} fill="url(#colorStarted)" name="New Gigs Launched" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Departmental Skill Hours Contribution */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Departmental Skill Contribution Hours
            </h3>
            <span className="text-xs text-slate-500 font-medium">Cross-Unit Mobility</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="department" stroke="#64748B" fontSize={10} interval={0} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="hours" fill="#10B981" radius={[4, 4, 0, 0]} name="Skill Hours Contributed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Contributor Leaderboard */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Top Internal Skill Contributors
            </h3>
            <p className="text-xs text-slate-500 font-medium">Recognizing employees contributing their expertise to innovation portal projects</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
            Q3 Leadership Leaderboard
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-black flex items-center justify-center shrink-0 shadow-xs">1</span>
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="Sunil Ravva" className="w-10 h-10 rounded-full object-cover border-2 border-amber-400" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Sunil Ravva</h4>
              <p className="text-xs text-slate-500 font-medium">Senior AI & Cloud Architect</p>
              <div className="text-xs text-amber-700 font-mono mt-1 font-bold">1,850 Pts • 48 hrs</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-800 font-black flex items-center justify-center shrink-0">2</span>
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" alt="Anita Patel" className="w-10 h-10 rounded-full object-cover border-2 border-slate-300" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Anita Patel</h4>
              <p className="text-xs text-slate-500 font-medium">Data Analyst & Modeler</p>
              <div className="text-xs text-slate-700 font-mono mt-1 font-bold">1,400 Pts • 36 hrs</div>
            </div>
          </div>

          <div className="p-4 bg-amber-50/30 rounded-xl border border-amber-200/80 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-amber-700 text-amber-50 font-black flex items-center justify-center shrink-0">3</span>
            <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150" alt="Carlos Mendez" className="w-10 h-10 rounded-full object-cover border-2 border-amber-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Carlos Mendez</h4>
              <p className="text-xs text-slate-500 font-medium">Lead UX Engineer</p>
              <div className="text-xs text-amber-800 font-mono mt-1 font-bold">1,150 Pts • 28 hrs</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
