import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  RefreshCw,
  Users,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { InnovationGig, GigApplication, UserProfile, LeadershipMetrics } from './types';
import { INITIAL_GIGS, INITIAL_APPLICATIONS, CURRENT_USER } from './data/mockData';
import { Navbar } from './components/Navbar';
import { GigCard } from './components/GigCard';
import { GigDetailModal } from './components/GigDetailModal';
import { CreateGigModal } from './components/CreateGigModal';
import { ApplicationModal } from './components/ApplicationModal';
import { OwnerApplicationsView } from './components/OwnerApplicationsView';
import { LeadershipDashboard } from './components/LeadershipDashboard';

export default function App() {
  // Persistence state in localStorage or initial data
  const [gigs, setGigs] = useState<InnovationGig[]>(() => {
    const saved = localStorage.getItem('innovation_gigs_v1');
    return saved ? JSON.parse(saved) : INITIAL_GIGS;
  });

  const [applications, setApplications] = useState<GigApplication[]>(() => {
    const saved = localStorage.getItem('innovation_apps_v1');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-gigs' | 'leadership' | 'owner-apps'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Progress' | 'Backlog' | 'Completed'>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Modal States
  const [selectedGig, setSelectedGig] = useState<InnovationGig | null>(null);
  const [applyGig, setApplyGig] = useState<InnovationGig | null>(null);
  const [applyRoleId, setApplyRoleId] = useState<string | undefined>(undefined);
  const [isCreateGigOpen, setIsCreateGigOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('innovation_gigs_v1', JSON.stringify(gigs));
  }, [gigs]);

  useEffect(() => {
    localStorage.setItem('innovation_apps_v1', JSON.stringify(applications));
  }, [applications]);

  // Handle Role Switching
  const handleSetUserRole = (role: 'contributor' | 'owner' | 'leadership') => {
    setCurrentUser((prev) => ({
      ...prev,
      currentRole: role,
      name: role === 'owner' ? 'Sarah Chen' : role === 'leadership' ? 'Michael Chang (VP)' : 'Sunil Ravva',
      title: role === 'owner' ? 'Director of Innovation' : role === 'leadership' ? 'VP of Technology & Strategy' : 'Senior AI & Cloud Architect',
      department: role === 'owner' ? 'Supply Chain & Legal Ops' : role === 'leadership' ? 'Executive Strategy' : 'Enterprise AI Lab',
    }));

    if (role === 'leadership') setActiveTab('leadership');
    if (role === 'owner') setActiveTab('owner-apps');
  };

  // Handler: Create new Gig
  const handleCreateGig = (newGig: InnovationGig) => {
    setGigs([newGig, ...gigs]);
  };

  // Handler: Submit Application
  const handleSubmitApplication = (newApp: GigApplication) => {
    setApplications([newApp, ...applications]);
    alert(`Application submitted successfully for ${newApp.roleTitle}!`);
  };

  // Handler: Accept Application
  const handleAcceptApplication = (appId: string) => {
    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp) return;

    // Update Application status
    setApplications(
      applications.map((a) => (a.id === appId ? { ...a, status: 'Accepted' } : a))
    );

    // Update target Gig role spot and add contributor
    setGigs((prevGigs) =>
      prevGigs.map((g) => {
        if (g.id !== targetApp.gigId) return g;

        const updatedRoles = g.requiredRoles.map((r) => {
          if (r.id === targetApp.roleId) {
            const nextFilled = Math.min(r.spotsCount, r.filledCount + 1);
            return {
              ...r,
              filledCount: nextFilled,
              status: (nextFilled >= r.spotsCount ? 'Filled' : 'Open') as any,
            };
          }
          return r;
        });

        // Add a system status update
        const updatedStatusUpdates = [
          {
            id: `upd-${Date.now()}`,
            authorName: g.ownerName,
            authorRole: 'Project Owner',
            authorAvatar: g.ownerAvatar,
            date: new Date().toISOString().split('T')[0],
            message: `🎉 Welcomed ${targetApp.applicantName} to the team as ${targetApp.roleTitle}!`,
            type: 'general' as const,
          },
          ...g.statusUpdates,
        ];

        return {
          ...g,
          requiredRoles: updatedRoles,
          activeContributorsCount: g.activeContributorsCount + 1,
          statusUpdates: updatedStatusUpdates,
        };
      })
    );
  };

  // Handler: Decline Application
  const handleDeclineApplication = (appId: string) => {
    setApplications(
      applications.map((a) => (a.id === appId ? { ...a, status: 'Declined' } : a))
    );
  };

  // Handler: Update Deliverable Status
  const handleUpdateDeliverableStatus = (
    gigId: string,
    deliverableId: string,
    newStatus: 'Pending' | 'In Progress' | 'Under Review' | 'Completed'
  ) => {
    setGigs((prevGigs) =>
      prevGigs.map((g) => {
        if (g.id !== gigId) return g;
        const updatedDeliverables = g.deliverables.map((d) =>
          d.id === deliverableId ? { ...d, status: newStatus } : d
        );

        // Check if all completed
        const allDone = updatedDeliverables.every((d) => d.status === 'Completed');
        const overallStatus = allDone ? 'Completed' : g.status === 'Backlog' ? 'In Progress' : g.status;

        return {
          ...g,
          deliverables: updatedDeliverables,
          status: overallStatus,
        };
      })
    );

    if (selectedGig && selectedGig.id === gigId) {
      setSelectedGig((prev) => {
        if (!prev) return null;
        const updatedDeliverables = prev.deliverables.map((d) =>
          d.id === deliverableId ? { ...d, status: newStatus } : d
        );
        return { ...prev, deliverables: updatedDeliverables };
      });
    }
  };

  // Handler: Add Status Update Note
  const handleAddStatusUpdate = (
    gigId: string,
    message: string,
    type: 'general' | 'milestone' | 'blocker' | 'release'
  ) => {
    const newUpdate = {
      id: `upd-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.title,
      authorAvatar: currentUser.avatar,
      date: new Date().toISOString().split('T')[0],
      message,
      type,
    };

    setGigs((prevGigs) =>
      prevGigs.map((g) => {
        if (g.id !== gigId) return g;
        return {
          ...g,
          statusUpdates: [newUpdate, ...g.statusUpdates],
        };
      })
    );

    if (selectedGig && selectedGig.id === gigId) {
      setSelectedGig((prev) => (prev ? { ...prev, statusUpdates: [newUpdate, ...prev.statusUpdates] } : null));
    }
  };

  // Handler: Add Deliverable
  const handleAddDeliverable = (
    gigId: string,
    del: { phaseNumber: number; phaseTitle: string; title: string; description: string; dueDate: string; assignedRoleTitle?: string }
  ) => {
    const newDel = {
      id: `del-${Date.now()}`,
      ...del,
      status: 'Pending' as const,
    };

    setGigs((prevGigs) =>
      prevGigs.map((g) => {
        if (g.id !== gigId) return g;
        return { ...g, deliverables: [...g.deliverables, newDel] };
      })
    );

    if (selectedGig && selectedGig.id === gigId) {
      setSelectedGig((prev) => (prev ? { ...prev, deliverables: [...prev.deliverables, newDel] } : null));
    }
  };

  // Filtered Gigs Calculation
  const filteredGigs = gigs.filter((gig) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      gig.title.toLowerCase().includes(query) ||
      gig.innovationId.toLowerCase().includes(query) ||
      gig.tagline.toLowerCase().includes(query) ||
      gig.department.toLowerCase().includes(query) ||
      gig.requiredRoles.some((r) => r.skills.some((s) => s.toLowerCase().includes(query)));

    const matchesStatus = statusFilter === 'All' || gig.status === statusFilter;
    const matchesDept = departmentFilter === 'All' || gig.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  // Calculate Leadership Metrics
  const leadershipMetrics: LeadershipMetrics = {
    totalGigs: gigs.length,
    inProgress: gigs.filter((g) => g.status === 'In Progress').length,
    backlog: gigs.filter((g) => g.status === 'Backlog').length,
    completed: gigs.filter((g) => g.status === 'Completed').length,
    onHold: gigs.filter((g) => g.status === 'On Hold').length,
    totalHoursContributed: 284,
    totalValueGenerated: 630000,
    topSkillsDemand: [
      { skill: 'Gemini API', count: 8 },
      { skill: 'React / TypeScript', count: 7 },
      { skill: 'Node.js', count: 5 },
      { skill: 'Recharts / D3', count: 4 },
      { skill: 'Python / Data', count: 3 },
    ],
    departmentParticipation: [
      { department: 'AI Lab', hours: 120, gigsCount: 3 },
      { department: 'Supply Chain', hours: 85, gigsCount: 2 },
      { department: 'Customer Success', hours: 55, gigsCount: 2 },
      { department: 'ESG & Facilities', hours: 24, gigsCount: 1 },
    ],
    monthlyCompletions: [
      { month: 'Apr', completed: 1, started: 2 },
      { month: 'May', completed: 2, started: 3 },
      { month: 'Jun', completed: 3, started: 4 },
      { month: 'Jul', completed: 4, started: 5 },
    ],
  };

  const pendingAppsCount = applications.filter((a) => a.status === 'Pending').length;
  const myApplications = applications.filter((a) => a.applicantId === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        setCurrentUserRole={handleSetUserRole}
        onOpenCreateGig={() => setIsCreateGigOpen(true)}
        pendingAppsCount={pendingAppsCount}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: BROWSE GIGS */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            
            {/* Hero / Portal Sync Banner */}
            <div id="hero-banner" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 border border-indigo-100/80 p-6 sm:p-8 shadow-sm">
              <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  Synced with Idea Box Portal
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Contribute Your Skills to Approved Innovation Projects
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Turn approved innovation portal concepts into production breakthroughs. Explore open gig positions, check your AI skill match, and log contribution hours towards recognition awards.
                </p>

                {/* Quick Filter Controls */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-xs font-medium shadow-xs">
                    <span className="text-slate-500 px-2 font-semibold">Status:</span>
                    {(['All', 'In Progress', 'Backlog', 'Completed'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1 rounded-md transition-all ${
                          statusFilter === st
                            ? 'bg-indigo-600 text-white font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500 shadow-xs"
                  >
                    <option value="All">All Departments</option>
                    <option value="Supply Chain & Legal Operations">Supply Chain & Legal</option>
                    <option value="Customer Experience & Product Strategy">Customer Experience</option>
                    <option value="ESG & Facilities Management">ESG & Facilities</option>
                    <option value="Engineering Enablement">Engineering Enablement</option>
                  </select>

                  <span className="text-xs text-slate-500 font-mono ml-auto font-semibold">
                    Showing {filteredGigs.length} Gigs
                  </span>
                </div>
              </div>
            </div>

            {/* Gigs Cards Grid */}
            {filteredGigs.length === 0 ? (
              <div id="no-gigs-found" className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3 shadow-xs">
                <Briefcase className="w-10 h-10 mx-auto text-slate-400" />
                <h3 className="text-base font-bold text-slate-800">No innovation gigs match your filter criteria</h3>
                <p className="text-xs max-w-sm mx-auto">Try resetting your search query or selecting "All" status filter to explore open positions.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setDepartmentFilter('All');
                  }}
                  className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div id="gigs-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredGigs.map((gig) => (
                  <GigCard
                    key={gig.id}
                    gig={gig}
                    onSelectGig={(g) => setSelectedGig(g)}
                    onApplyForGig={(g) => {
                      setApplyGig(g);
                      setApplyRoleId(undefined);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY CONTRIBUTIONS & APPLICATIONS */}
        {activeTab === 'my-gigs' && (
          <div className="space-y-6">
            
            {/* Profile Overview Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600 shadow-md" />
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{currentUser.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">{currentUser.title} • {currentUser.department}</p>
                  <p className="text-xs text-slate-600 mt-1">{currentUser.bio}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-center px-3 border-r border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Hours Contributed</span>
                  <span className="text-lg font-mono font-bold text-indigo-600">{currentUser.hoursContributedTotal} hrs</span>
                </div>
                <div className="text-center px-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Reward Points</span>
                  <span className="text-lg font-mono font-bold text-amber-600">{currentUser.pointsEarned} Pts</span>
                </div>
              </div>
            </div>

            {/* Applications Status List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                My Skill Contribution Applications ({myApplications.length})
              </h3>

              {myApplications.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">You haven't applied to any gigs yet. Explore open positions in the marketplace!</p>
              ) : (
                <div className="space-y-3">
                  {myApplications.map((app) => (
                    <div key={app.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{app.roleTitle}</span>
                        <span className="text-indigo-600 font-medium">Project: {app.gigTitle}</span>
                        <p className="text-slate-500 mt-1">Offered: {app.hoursPerWeekOffered} hrs/wk • Applied on {app.appliedDate}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {app.matchScore}% Match
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full font-bold text-xs ${
                            app.status === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : app.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: APPLICANT REVIEWS (OWNER VIEW) */}
        {activeTab === 'owner-apps' && (
          <OwnerApplicationsView
            applications={applications}
            onAcceptApplication={handleAcceptApplication}
            onDeclineApplication={handleDeclineApplication}
          />
        )}

        {/* TAB 4: LEADERSHIP ANALYTICS */}
        {activeTab === 'leadership' && (
          <LeadershipDashboard gigs={gigs} metrics={leadershipMetrics} />
        )}

      </main>

      {/* MODALS */}
      <GigDetailModal
        gig={selectedGig}
        onClose={() => setSelectedGig(null)}
        onApplyForGig={(g, rId) => {
          setSelectedGig(null);
          setApplyGig(g);
          setApplyRoleId(rId);
        }}
        onUpdateDeliverableStatus={handleUpdateDeliverableStatus}
        onAddStatusUpdate={handleAddStatusUpdate}
        onAddDeliverable={handleAddDeliverable}
        currentUser={currentUser}
      />

      <CreateGigModal
        isOpen={isCreateGigOpen}
        onClose={() => setIsCreateGigOpen(false)}
        onCreateGig={handleCreateGig}
        ownerName={currentUser.name}
        ownerTitle={currentUser.title}
        ownerAvatar={currentUser.avatar}
        ownerEmail="sarah.chen@enterprise.com"
      />

      <ApplicationModal
        gig={applyGig}
        preselectedRoleId={applyRoleId}
        isOpen={!!applyGig}
        onClose={() => setApplyGig(null)}
        onSubmitApplication={handleSubmitApplication}
        currentUser={currentUser}
      />

      {/* App Footer */}
      <footer id="app-footer" className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>Google AI Studio • Idea Box Innovation Portal • Approved Innovation Ideas Skill Marketplace</p>
      </footer>
    </div>
  );
}
