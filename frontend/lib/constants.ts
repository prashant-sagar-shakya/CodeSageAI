// ============================================================
// CodeSageAI — Application Constants
// ============================================================

export const APP_NAME = 'CodeSageAI';
export const APP_DESCRIPTION = 'AI-Powered Code Review & Pull Request Analysis Platform';
export const APP_VERSION = '1.0.0';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Repositories', href: '/dashboard/repositories', icon: 'GitBranch' },
  { label: 'Reviews', href: '/dashboard/review', icon: 'SearchCode' },
  { label: 'Reports', href: '/dashboard/reports', icon: 'FileBarChart' },
  { label: 'History', href: '/dashboard/history', icon: 'History' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
] as const;

export const AGENT_CONFIGS = [
  {
    name: 'Repository Analyzer' as const,
    icon: 'FolderSearch',
    color: '#6366f1',
    description: 'Analyzes repository structure, tech stack, frameworks, dependencies, and important files.',
  },
  {
    name: 'Code Quality' as const,
    icon: 'Code2',
    color: '#8b5cf6',
    description: 'Checks naming conventions, SOLID principles, duplicate code, dead code, and complexity.',
  },
  {
    name: 'Bug Detection' as const,
    icon: 'Bug',
    color: '#ef4444',
    description: 'Detects null pointers, index errors, infinite loops, async mistakes, and memory leaks.',
  },
  {
    name: 'Security' as const,
    icon: 'Shield',
    color: '#f59e0b',
    description: 'OWASP checks: SQL injection, XSS, CSRF, SSRF, hardcoded secrets, and JWT mistakes.',
  },
  {
    name: 'Performance' as const,
    icon: 'Zap',
    color: '#10b981',
    description: 'Analyzes slow loops, N+1 queries, unnecessary API calls, and algorithm efficiency.',
  },
  {
    name: 'Documentation' as const,
    icon: 'FileText',
    color: '#06b6d4',
    description: 'Generates README improvements, missing comments, function docs, and API documentation.',
  },
  {
    name: 'Testing' as const,
    icon: 'TestTube2',
    color: '#ec4899',
    description: 'Generates unit tests, integration tests, edge cases, and mock test suggestions.',
  },
  {
    name: 'Refactoring' as const,
    icon: 'RefreshCw',
    color: '#f97316',
    description: 'Suggests design patterns, smaller methods, better naming, and clean architecture.',
  },
] as const;

export const SCORE_CATEGORIES = [
  { key: 'security', label: 'Security', icon: 'Shield', color: '#f59e0b' },
  { key: 'performance', label: 'Performance', icon: 'Zap', color: '#10b981' },
  { key: 'readability', label: 'Readability', icon: 'Eye', color: '#6366f1' },
  { key: 'testing', label: 'Testing', icon: 'TestTube2', color: '#ec4899' },
  { key: 'documentation', label: 'Documentation', icon: 'FileText', color: '#06b6d4' },
  { key: 'maintainability', label: 'Maintainability', icon: 'Settings', color: '#8b5cf6' },
] as const;

export const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  warning: { label: 'Warning', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  info: { label: 'Info', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  suggestion: { label: 'Suggestion', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
} as const;
