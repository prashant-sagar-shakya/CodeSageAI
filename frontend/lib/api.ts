import { Repository } from './types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function loginUser(userData: {
  github_id: number;
  username: string;
  name: string;
  email: string;
  avatar_url: string;
}) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Authentication failed');
  return res.json();
}

export async function fetchRepos(ownerId?: number): Promise<Repository[]> {
  const url = ownerId 
    ? `${API_BASE_URL}/repos?owner_id=${ownerId}`
    : `${API_BASE_URL}/repos`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch repositories');
  return res.json();
}

export async function registerRepo(repoData: {
  github_id: number;
  name: string;
  full_name: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  open_issues?: number;
  is_private?: boolean;
  tech_stack?: string;
  owner_id: number;
}): Promise<Repository> {
  const res = await fetch(`${API_BASE_URL}/repos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(repoData),
  });
  if (!res.ok) throw new Error('Failed to register repository');
  return res.json();
}

export async function triggerReview(repoId: number, prData: {
  pr_number: number;
  pr_title: string;
  base_branch: string;
  head_branch: string;
  installation_id?: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/repos/${repoId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prData),
  });
  if (!res.ok) throw new Error('Failed to initiate code review run');
  return res.json();
}

export async function fetchReview(reviewId: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`);
  if (!res.ok) throw new Error('Failed to fetch review data');
  return res.json();
}

export function getReportDownloadUrl(reviewId: number, format: 'html' | 'pdf' | 'markdown'): string {
  return `${API_BASE_URL}/reports/${reviewId}?format=${format}`;
}
