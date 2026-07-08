// ============================================================
// CodeSageAI — TypeScript Type Definitions
// ============================================================

// ---- User & Auth ----
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  githubUsername: string;
  subscription_tier?: string;
  subscription_expires_at?: string;
}

// ---- Repository ----
export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  lastUpdated: string;
  isPrivate: boolean;
  techStack: string[];
  healthScore: number;
  avatar: string;
  url: string;
}

export interface Branch {
  name: string;
  isDefault: boolean;
  lastCommit: string;
  lastCommitDate: string;
}

// ---- Pull Request ----
export type PRStatus = 'open' | 'closed' | 'merged';

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  status: PRStatus;
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  baseBranch: string;
  headBranch: string;
  labels: string[];
}

// ---- AI Agents ----
export type AgentName =
  | 'Repository Analyzer'
  | 'Code Quality'
  | 'Bug Detection'
  | 'Security'
  | 'Performance'
  | 'Documentation'
  | 'Testing'
  | 'Refactoring';

export type AgentStatus = 'idle' | 'running' | 'complete' | 'error';

export interface Agent {
  name: AgentName;
  status: AgentStatus;
  progress: number;
  findings: number;
  icon: string;
  color: string;
  description: string;
}

// ---- Review Issues ----
export type Severity = 'critical' | 'warning' | 'info' | 'suggestion';

export interface ReviewIssue {
  id: string;
  agent: AgentName;
  severity: Severity;
  title: string;
  description: string;
  file: string;
  line: number;
  endLine?: number;
  explanation: string;
  howToFix: string;
  codeBefore: string;
  codeAfter: string;
  confidence: number;
  category: string;
  rule?: string;
}

// ---- Review Scores ----
export interface ReviewScores {
  security: number;
  performance: number;
  readability: number;
  testing: number;
  documentation: number;
  maintainability: number;
  overall: number;
}

// ---- Review Report ----
export interface ReviewReport {
  id: string;
  repositoryName: string;
  prNumber: number;
  prTitle: string;
  scores: ReviewScores;
  issues: ReviewIssue[];
  agents: Agent[];
  createdAt: string;
  duration: string;
  totalFiles: number;
  totalLines: number;
}

// ---- File Tree ----
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  issueCount?: number;
  language?: string;
}

// ---- Code Diff ----
export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
  hasIssue?: boolean;
  issueId?: string;
}

export interface FileDiff {
  path: string;
  additions: number;
  deletions: number;
  lines: DiffLine[];
  language: string;
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  totalReviews: number;
  bugsFound: number;
  securityIssues: number;
  avgScore: number;
  reviewsTrend: number;
  bugsTrend: number;
  securityTrend: number;
  scoreTrend: number;
}

export interface ChartDataPoint {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}

// ---- Activity Feed ----
export interface ActivityItem {
  id: string;
  type: 'review_complete' | 'issue_found' | 'pr_merged' | 'repo_added';
  message: string;
  timestamp: string;
  icon: string;
  color: string;
}

// ---- Common Issues ----
export interface CommonIssue {
  name: string;
  count: number;
  percentage: number;
  severity: Severity;
}
