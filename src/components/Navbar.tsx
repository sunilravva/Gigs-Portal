import React from 'react';
import { Lightbulb, Search, PlusCircle, LayoutDashboard, Briefcase, UserCheck, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'browse' | 'my-gigs' | 'leadership' | 'owner-apps';
  setActiveTab: (tab: 'browse' | 'my-gigs' | 'leadership' | 'owner-apps') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentUser: UserProfile;
  setCurrentUserRole: (role: 'contributor' | 'owner' | 'leadership') => void;
  onOpenCreateGig: () => void;
  pendingAppsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  currentUser,
  setCurrentUserRole,
  onOpenCreateGig,
  pendingAppsCount,
}) => {
  return (
    <header id="app-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs transition-all">
      <div id="header-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="header-top-row" className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand Title */}
          <div id="header-logo-group" className="flex items-center gap-3">
            <div id="logo-icon-box" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div>
              <div id="brand-title-row" className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-tight text-slate-900">
                  Innovation Gig Platform
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Idea Box Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Contribute skills to approved enterprise innovation projects</p>
            </div>
          </div>

          {/* Search bar */}
          <div id="header-search-container" className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gigs, skills (React, Gemini), or departments..."
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 text-slate-900 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Role switcher & Primary Action */}
          <div id="header-right-actions" className="flex items-center gap-3">
            
            {/* User perspective selector */}
            <div id="user-role-selector" className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <span className="text-slate-500 px-2 hidden lg:inline">View as:</span>
              <button
                id="role-btn-contributor"
                onClick={() => setCurrentUserRole('contributor')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currentUser.currentRole === 'contributor'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Employee Contributor View"
              >
                Contributor
              </button>
              <button
                id="role-btn-owner"
                onClick={() => setCurrentUserRole('owner')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currentUser.currentRole === 'owner'
                    ? 'bg-purple-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Idea Owner / Project Lead View"
              >
                Idea Owner
              </button>
              <button
                id="role-btn-leadership"
                onClick={() => setCurrentUserRole('leadership')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currentUser.currentRole === 'leadership'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Executive Leadership View"
              >
                Leadership
              </button>
            </div>

            {/* Post Gig CTA */}
            <button
              id="post-gig-btn"
              onClick={onOpenCreateGig}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Post Innovation Gig</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav id="header-nav-tabs" className="flex items-center gap-1 border-t border-slate-200 pt-1 overflow-x-auto no-scrollbar text-sm font-medium">
          <button
            id="nav-tab-browse"
            onClick={() => setActiveTab('browse')}
            className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'browse'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/60 rounded-t-md'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Explore Innovation Gigs</span>
          </button>

          <button
            id="nav-tab-my-gigs"
            onClick={() => setActiveTab('my-gigs')}
            className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'my-gigs'
                ? 'border-purple-600 text-purple-600 bg-purple-50/60 rounded-t-md'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>My Contributions & Gigs</span>
          </button>

          <button
            id="nav-tab-owner-apps"
            onClick={() => setActiveTab('owner-apps')}
            className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap relative ${
              activeTab === 'owner-apps'
                ? 'border-amber-600 text-amber-600 bg-amber-50/60 rounded-t-md'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Applicant Reviews</span>
            {pendingAppsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {pendingAppsCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-leadership"
            onClick={() => setActiveTab('leadership')}
            className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'leadership'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/60 rounded-t-md'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Leadership Analytics</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
