import { Repository } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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

export async function importRepo(repoFullName: string, ownerId: number): Promise<Repository> {
  const res = await fetch(`${API_BASE_URL}/repos/import?repo_full_name=${encodeURIComponent(repoFullName)}&owner_id=${ownerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to import repository from GitHub');
  }
  return res.json();
}

export async function exchangeOAuthCode(code: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/auth/callback?code=${code}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'OAuth authentication failed');
  }
  return res.json();
}

export async function fetchDashboardStats(ownerId: number, repoId?: number): Promise<any> {
  const url = repoId 
    ? `${API_BASE_URL}/repos/dashboard/stats?owner_id=${ownerId}&repo_id=${repoId}`
    : `${API_BASE_URL}/repos/dashboard/stats?owner_id=${ownerId}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch dashboard stats');
  }
  return res.json();
}

export async function fetchRepoReviews(repoId: number): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/repos/${repoId}/reviews`);
  if (!res.ok) {
    throw new Error('Failed to fetch repository reviews');
  }
  return res.json();
}

export async function syncRepos(ownerId: number): Promise<Repository[]> {
  const res = await fetch(`${API_BASE_URL}/repos/sync?owner_id=${ownerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to auto-sync repositories');
  }
  return res.json();
}

export async function rescanAllRepos(ownerId: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/repos/rescan-all?owner_id=${ownerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to trigger rescan');
  }
  return res.json();
}

export async function rescanRepo(repoId: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/repos/${repoId}/rescan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to trigger rescan');
  }
  return res.json();
}

export async function updateProfile(userId: number, profileData: { name: string; email: string; username: string }): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update profile');
  }
  return res.json();
}

export async function createOrder(userId: number, plan: string): Promise<{ order_id: string; amount: number; currency: string }> {
  const res = await fetch(`${API_BASE_URL}/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, plan }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create payment order');
  }
  return res.json();
}

export async function verifyPayment(paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  user_id: number;
  plan: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Payment verification failed');
  }
  return res.json();
}

// Chat API Wrappers
export async function createChatSession(userId: number, title?: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, title }),
  });
  if (!res.ok) throw new Error('Failed to create chat session');
  return res.json();
}

export async function fetchChatSessions(userId: number): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/chat/sessions?user_id=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch chat sessions');
  return res.json();
}

export async function fetchChatMessages(sessionId: number): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch chat messages');
  return res.json();
}

export async function sendChatMessage(sessionId: number, message: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Failed to send chat message');
  return res.json();
}

export async function deleteChatSession(sessionId: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete chat session');
  return res.json();
}

