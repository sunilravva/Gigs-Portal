export type GigStatus = 'Backlog' | 'In Progress' | 'In Review' | 'Completed' | 'On Hold';

export type RoleStatus = 'Open' | 'Filled' | 'In Progress';

export interface RequiredRole {
  id: string;
  title: string; // e.g. Frontend Engineer, GenAI Specialist
  skills: string[]; // e.g. React, Tailwind, Gemini API
  spotsCount: number; // e.g. 2
  filledCount: number;
  hoursPerWeek: number; // e.g. 5
  valuePoints: number; // e.g. 350 pts / badge
  status: RoleStatus;
}

export interface PhaseDeliverable {
  id: string;
  phaseNumber: number; // 1, 2, 3...
  phaseTitle: string; // e.g. Phase 1: Tech Specs & PoC Architecture
  title: string; // e.g. Draft Gemini Prompt Matrix & Architecture Diagram
  description: string;
  dueDate: string;
  assignedRoleTitle?: string;
  assignedContributorName?: string;
  status: 'Pending' | 'In Progress' | 'Under Review' | 'Completed';
  evidenceLink?: string;
  completionNotes?: string;
}

export interface StatusUpdate {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  message: string;
  phaseTag?: string;
  type: 'general' | 'milestone' | 'blocker' | 'release';
}

export interface GigApplication {
  id: string;
  gigId: string;
  gigTitle: string;
  roleId: string;
  roleTitle: string;
  applicantId: string;
  applicantName: string;
  applicantTitle: string;
  applicantDepartment: string;
  applicantAvatar: string;
  skills: string[];
  hoursPerWeekOffered: number;
  pitch: string;
  matchScore: number; // 0 - 100
  matchRationale: string;
  status: 'Pending' | 'Accepted' | 'Shortlisted' | 'Declined';
  appliedDate: string;
}

export interface InnovationGig {
  id: string;
  innovationId: string; // e.g. INN-2026-104
  title: string;
  tagline: string;
  department: string;
  ownerName: string;
  ownerTitle: string;
  ownerAvatar: string;
  ownerEmail: string;
  useCase: string; // Detailed business use case and objectives
  targetImpact: string; // ROI / value expected
  durationWeeks: number; // total duration e.g. 6
  weeklyHoursExpected: number; // average hrs/week e.g. 4
  status: GigStatus;
  createdAt: string;
  tags: string[];
  requiredRoles: RequiredRole[];
  deliverables: PhaseDeliverable[];
  statusUpdates: StatusUpdate[];
  activeContributorsCount: number;
  totalValuePoints: number;
}

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
  skills: string[];
  bio: string;
  hoursContributedTotal: number;
  pointsEarned: number;
  badges: string[];
  currentRole: 'contributor' | 'owner' | 'leadership';
}

export interface LeadershipMetrics {
  totalGigs: number;
  inProgress: number;
  backlog: number;
  completed: number;
  onHold: number;
  totalHoursContributed: number;
  totalValueGenerated: number; // in $ or points
  topSkillsDemand: { skill: string; count: number }[];
  departmentParticipation: { department: string; hours: number; gigsCount: number }[];
  monthlyCompletions: { month: string; completed: number; started: number }[];
}
