'use client';

import { useState, useEffect, useRef } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Bug, Shield, Activity,
  CheckCircle2, AlertTriangle, GitMerge, Plus, Eye, ArrowUpRight,
  FileBarChart, Sparkles, GitBranch, Clock, FolderOpen, Loader2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatNumber, getScoreColor } from '@/lib/utils';
import { fetchDashboardStats, fetchRepos } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// ---- Animated Counter ----
function AnimCounter({ end, duration = 1200 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return <div ref={ref}>{formatNumber(count)}</div>;
}

// ---- Custom Tooltip ----
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-md)', padding: '12px 16px',
      boxShadow: 'var(--shadow-xl)', fontSize: '12px',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---- Custom Downward Dropdown with Search ----
function CustomRepoDropdown({ 
  value, 
  onChange, 
  repos, 
  placeholder = "All Repositories",
  width = "220px",
  align = "left"
}: { 
  value: number | null, 
  onChange: (id: number | null) => void, 
  repos: any[], 
  placeholder?: string,
  width?: string,
  align?: "left" | "right"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = repos.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedRepo = repos.find(r => r.id === value);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width, zIndex: isOpen ? 50 : 10 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: '13px',
          fontWeight: 500, cursor: 'pointer', outline: 'none', transition: 'border-color var(--transition-fast)'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedRepo ? selectedRepo.name : placeholder}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: '8px' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="animate-fade-up" style={{
          position: 'absolute', top: 'calc(100% + 4px)', 
          ...(align === 'right' ? { right: 0, minWidth: '220px' } : { left: 0, right: 0 }),
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xl)',
          maxHeight: '260px', display: 'flex', flexDirection: 'column',
          animationDuration: '0.15s', transformOrigin: 'top center'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border-primary)' }}>
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{
                width: '100%', padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-primary)', background: 'var(--bg-input)',
                color: 'var(--text-primary)', fontSize: '12px', outline: 'none'
              }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            <div 
              onClick={() => { onChange(null); setIsOpen(false); setSearch(''); }}
              style={{
                padding: '8px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                fontSize: '13px', color: !value ? 'var(--primary-500)' : 'var(--text-secondary)',
                fontWeight: !value ? 600 : 500, background: !value ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
              }}
              onMouseEnter={e => { if (value) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
              onMouseLeave={e => { if (value) e.currentTarget.style.background = 'transparent'; }}
            >
              {placeholder}
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: '8px 10px', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                No results
              </div>
            ) : (
              filtered.map(r => (
                <div 
                  key={r.id}
                  onClick={() => { onChange(r.id); setIsOpen(false); setSearch(''); }}
                  style={{
                    padding: '8px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    fontSize: '13px', color: value === r.id ? 'var(--primary-500)' : 'var(--text-primary)',
                    fontWeight: value === r.id ? 600 : 500, background: value === r.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (value !== r.id) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { if (value !== r.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadInitData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const ownerId = user?.id || 1;
        const userRepos = await fetchRepos(ownerId);
        setRepos(userRepos);
      } catch (err) {
        console.error('Failed to load repos:', err);
      }
    };
    loadInitData();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const ownerId = user?.id || 1;
        const data = await fetchDashboardStats(ownerId, selectedRepo || undefined);
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [selectedRepo, refreshKey]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
        <Loader2 size={40} style={{ color: 'var(--primary-500)', animation: 'spin-slow 1s linear infinite' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Loading Dashboard...</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Fetching data from your repositories.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px', textAlign: 'center', padding: '20px' }}>
        <Activity size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Backend Connection Failed</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px' }}>
          Could not connect to the CodeSageAI backend. Please ensure the backend is running and you have no network issues.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '10px 20px', background: 'var(--gradient-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '16px' }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Reviews', value: stats.totalReviews, trend: stats.reviewsTrend,
      icon: FileBarChart, color: '#6366f1',
    },
    {
      label: 'Bugs Detected', value: stats.bugsFound, trend: stats.bugsTrend,
      icon: Bug, color: '#ef4444',
    },
    {
      label: 'Security Issues', value: stats.securityIssues, trend: stats.securityTrend,
      icon: Shield, color: '#f59e0b',
    },
    {
      label: 'Average Score', value: stats.avgScore, trend: stats.scoreTrend,
      icon: Activity, color: '#10b981',
    },
  ];

  // Radar breakdown
  const activeRadarScores = stats.scores || { security: 0, performance: 0, readability: 0, testing: 0, documentation: 0, maintainability: 0 };
  const radarData = [
    { subject: 'Security', score: activeRadarScores.security, fullMark: 100 },
    { subject: 'Performance', score: activeRadarScores.performance, fullMark: 100 },
    { subject: 'Readability', score: activeRadarScores.readability, fullMark: 100 },
    { subject: 'Testing', score: activeRadarScores.testing, fullMark: 100 },
    { subject: 'Docs', score: activeRadarScores.documentation, fullMark: 100 },
    { subject: 'Maintain.', score: activeRadarScores.maintainability, fullMark: 100 },
  ];

  // Trend data mapped from history
  const trendData = stats.reviewHistory.length > 0 
    ? stats.reviewHistory.slice().reverse().map((r: any) => ({
        name: r.review_type === 'commit' ? `Commit ${r.commit_hash?.slice(0, 7)}` : `PR #${r.pr_number}`,
        overall: r.overall_score,
      }))
    : [{ name: 'No reviews', overall: 0 }];

  // Common issues list mapped from activity/issues
  const commonIssues = stats.commonIssues || [];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Dashboard</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Overview of your active code reviews and repository health metrics.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CustomRepoDropdown 
            value={selectedRepo} 
            onChange={setSelectedRepo} 
            repos={repos} 
            placeholder="All Repositories" 
          />
          <Link href="/dashboard/repositories" style={{
            padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)',
            color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '13px', display: 'flex',
            alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-md)',
          }}>
            <Plus size={16} /> Track New Repository
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px', marginBottom: '24px',
      }}>
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card animate-fade-up" style={{
            animationDelay: `${i * 0.1}s`, animationFillMode: 'backwards',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '8px' }}>
                  {stat.label}
                </p>
                <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>
                  <AnimCounter end={stat.value} />
                </div>
              </div>
              <div style={{
                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                background: `${stat.color}15`, display: 'flex', alignItems: 'center',
                justifyContent: 'center',
              }}>
                <stat.icon size={22} style={{ color: stat.color }} />
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px',
              fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500,
            }}>
              <CheckCircle2 size={13} style={{ color: 'var(--color-success)' }} />
              Real-time PostgreSQL sync
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '16px', marginBottom: '24px',
      }}>
        {/* Trend Chart */}
        <div className="stat-card animate-fade-up stagger-5" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Score Trends</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>PR scores history log</p>
            </div>
            <BarChart3 size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="overall" stroke="#6366f1" fill="url(#gradOverall)" strokeWidth={2} name="Overall Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="stat-card animate-fade-up stagger-6" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{selectedRepo ? 'Repository Health' : 'System Overall Health'}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {selectedRepo ? 'Average agent score breakdowns for this repository' : 'Average agent score breakdowns across all tracked repositories'}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border-primary)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
              <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '16px' }}>
        {/* Common Issues */}
        <div className="stat-card animate-fade-up stagger-7" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Diagnostics Summary</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Active security & bug counts</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {commonIssues.map((issue: any, i: number) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge badge-${issue.severity}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                      {issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟠' : '🟢'}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{issue.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{issue.count} occurrences</span>
                </div>
                <div style={{
                  height: '4px', borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-tertiary)', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 'var(--radius-full)',
                    background: issue.severity === 'critical' ? '#ef4444' : issue.severity === 'warning' ? '#f59e0b' : '#10b981',
                    width: `${issue.percentage}%`,
                    transition: 'width 1s ease-out',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="stat-card animate-fade-up stagger-8" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Diagnostics Log</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Latest issues registered in database</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {stats.recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                No active issues recorded yet.
              </div>
            ) : (
              stats.recentActivity.map((item: any, i: number) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '12px 0',
                  borderBottom: i < stats.recentActivity.length - 1 ? '1px solid var(--border-primary)' : 'none',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
                    background: item.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Bug size={14} style={{ color: item.severity === 'critical' ? '#ef4444' : '#f59e0b' }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 600 }}>{item.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>File: {item.file}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)', padding: '1px 5px', borderRadius: 'var(--radius-sm)' }}>
                        {item.agent}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Reviews Table */}
      <div className="stat-card animate-fade-up" style={{ padding: '20px', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Recent Reviews</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Latest code reviews registered in PostgreSQL</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {stats.reviewHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              <FolderOpen size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '12px', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '13px', fontWeight: 600 }}>No review runs created yet</p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Track a repository and trigger a manual PR review to start gathering stats.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  {['Repository', 'Review Target', 'Overall Score', 'Status', 'Date'].map(h => (
                    <th key={h} style={{
                      padding: '10px 12px', textAlign: 'left', fontWeight: 600,
                      color: 'var(--text-tertiary)', fontSize: '12px', textTransform: 'uppercase',
                      letterSpacing: '0.05em', minWidth: h === 'Date' ? '140px' : 'auto',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.reviewHistory.map((review: any) => (
                  <tr key={review.id} style={{
                    borderBottom: '1px solid var(--border-primary)',
                    transition: 'background var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                  onClick={() => { window.location.href = `/dashboard/review/${review.id}`; }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '12px', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GitBranch size={14} style={{ color: 'var(--primary-500)' }} />
                        {review.repo_name}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{review.pr_title}</span>
                        <div style={{ display: 'flex', gap: '8px', color: 'var(--text-tertiary)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {review.review_type === 'commit' ? `Commit ${review.commit_hash?.slice(0, 7)}` : `PR #${review.pr_number}`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontWeight: 700, color: getScoreColor(review.overall_score),
                      }}>{review.overall_score}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${review.status.toLowerCase() === 'completed' ? 'success' : review.status.toLowerCase() === 'failed' ? 'critical' : 'warning'}`}>
                        {review.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                      {formatDate(review.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
