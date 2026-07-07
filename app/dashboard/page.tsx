'use client';

import { useState, useEffect, useRef } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Bug, Shield, Activity,
  CheckCircle2, AlertTriangle, GitMerge, Plus, Eye, ArrowUpRight,
  FileBarChart, Sparkles, GitBranch, Clock
} from 'lucide-react';
import Link from 'next/link';
import {
  mockDashboardStats, mockTrendData, mockRadarData,
  mockCommonIssues, mockActivity, mockReviewHistory
} from '@/lib/mock-data';
import { formatDate, formatNumber, getScoreColor } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell
} from 'recharts';

// ---- Animated Counter ----
function AnimCounter({ end, duration = 1500 }: { end: number; duration?: number }) {
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

// ---- Score Ring ----
function ScoreRing({ score, size = 120, strokeWidth = 8, label }: { score: number; size?: number; strokeWidth?: number; label: string }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGSVGElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated ? (score / 100) * circumference : 0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(() => setAnimated(true), 200); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg ref={ref} width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} className="score-ring-bg" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          className="score-ring-fill"
          strokeWidth={strokeWidth}
          stroke={getScoreColor(score)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div style={{ position: 'relative', marginTop: -size / 2 - 14, fontSize: '24px', fontWeight: 800, height: '28px' }}>
        {animated ? score : 0}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500, marginTop: '4px' }}>{label}</div>
    </div>
  );
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

// ---- Activity Icon Map ----
const activityIcons: Record<string, React.ElementType> = {
  CheckCircle2, AlertTriangle, GitMerge, Plus, Shield
};

export default function DashboardPage() {
  const stats = mockDashboardStats;

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

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Overview of your code review activity and repository health.
        </p>
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
              fontSize: '12px', fontWeight: 600,
              color: stat.trend > 0 ? (stat.label === 'Bugs Detected' || stat.label === 'Security Issues' ? 'var(--color-danger)' : 'var(--color-success)') : (stat.label === 'Bugs Detected' || stat.label === 'Security Issues' ? 'var(--color-success)' : 'var(--color-danger)'),
            }}>
              {stat.trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(stat.trend)}% from last month
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px',
      }}>
        {/* Trend Chart */}
        <div className="stat-card animate-fade-up stagger-5" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Score Trends</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Monthly score progression</p>
            </div>
            <BarChart3 size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockTrendData}>
              <defs>
                <linearGradient id="gradSecurity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPerformance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} domain={[40, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="security" stroke="#f59e0b" fill="url(#gradSecurity)" strokeWidth={2} name="Security" />
              <Area type="monotone" dataKey="performance" stroke="#10b981" fill="url(#gradPerformance)" strokeWidth={2} name="Performance" />
              <Area type="monotone" dataKey="overall" stroke="#6366f1" fill="url(#gradOverall)" strokeWidth={2} name="Overall" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="stat-card animate-fade-up stagger-6" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Repository Health</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Overall score breakdown</p>
            </div>
            <Activity size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={mockRadarData}>
              <PolarGrid stroke="var(--border-primary)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
              <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Common Issues */}
        <div className="stat-card animate-fade-up stagger-7" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Most Common Issues</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Top issues across all reviews</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockCommonIssues.slice(0, 6).map((issue, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge badge-${issue.severity}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                      {issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟠' : issue.severity === 'info' ? '🟡' : '🟢'}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{issue.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{issue.count}</span>
                </div>
                <div style={{
                  height: '4px', borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-tertiary)', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 'var(--radius-full)',
                    background: issue.severity === 'critical' ? '#ef4444' : issue.severity === 'warning' ? '#f59e0b' : issue.severity === 'info' ? '#3b82f6' : '#10b981',
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
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Recent Activity</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Latest review events</p>
            </div>
            <Link href="/dashboard/history" style={{
              fontSize: '12px', fontWeight: 600, color: 'var(--primary-500)',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              View All <ArrowUpRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {mockActivity.map((item, i) => {
              const Icon = activityIcons[item.icon] || CheckCircle2;
              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '12px 0',
                  borderBottom: i < mockActivity.length - 1 ? '1px solid var(--border-primary)' : 'none',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
                    background: `${item.color}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={14} style={{ color: item.color }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{item.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Clock size={11} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{formatDate(item.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Reviews Table */}
      <div className="stat-card animate-fade-up" style={{ padding: '20px', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Recent Reviews</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Latest code review results</p>
          </div>
          <Link href="/dashboard/history" style={{
            padding: '6px 14px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)', fontSize: '12px', fontWeight: 600,
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.color = 'var(--primary-500)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            View All <ArrowUpRight size={12} />
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                {['Repository', 'PR', 'Score', 'Issues', 'Date', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '10px 12px', textAlign: 'left', fontWeight: 600,
                    color: 'var(--text-tertiary)', fontSize: '12px', textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockReviewHistory.map((review, i) => (
                <tr key={review.id} style={{
                  borderBottom: '1px solid var(--border-primary)',
                  transition: 'background var(--transition-fast)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '12px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GitBranch size={14} style={{ color: 'var(--primary-500)' }} />
                      {review.repo}
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{review.pr}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontWeight: 700, color: getScoreColor(review.score),
                    }}>{review.score}</span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{review.issues}</td>
                  <td style={{ padding: '12px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    {formatDate(review.date)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: 'var(--radius-full)',
                      fontSize: '11px', fontWeight: 600,
                      background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                    }}>
                      <CheckCircle2 size={11} /> Complete
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
