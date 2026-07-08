'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileBarChart, Download, FileText, Code2, Globe, Eye,
  ArrowUpRight, Calendar, Clock, GitBranch, CheckCircle2,
  Printer, Share2
} from 'lucide-react';
import { mockReport, mockScores, mockReviewHistory } from '@/lib/mock-data';
import { getScoreColor, formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>('rh-001');

  const scoreEntries = [
    { label: 'Security', score: mockScores.security, color: '#f59e0b' },
    { label: 'Performance', score: mockScores.performance, color: '#10b981' },
    { label: 'Readability', score: mockScores.readability, color: '#6366f1' },
    { label: 'Testing', score: mockScores.testing, color: '#ec4899' },
    { label: 'Documentation', score: mockScores.documentation, color: '#06b6d4' },
    { label: 'Maintainability', score: mockScores.maintainability, color: '#8b5cf6' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Reports</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            View detailed review reports and export them in your preferred format.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { icon: Download, label: 'PDF', color: '#ef4444' },
            { icon: Code2, label: 'Markdown', color: '#6366f1' },
            { icon: Globe, label: 'HTML', color: '#10b981' },
          ].map((format, i) => (
            <button key={i} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
              color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = format.color; e.currentTarget.style.color = format.color; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <format.icon size={14} /> Export {format.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Report List */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)', padding: '16px', height: 'fit-content',
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-tertiary)', padding: '4px 8px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Review History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {mockReviewHistory.map(review => (
              <button key={review.id} onClick={() => setSelectedReport(review.id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: 'none', textAlign: 'left', cursor: 'pointer',
                background: selectedReport === review.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                transition: 'all var(--transition-fast)', width: '100%',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={e => { if (selectedReport !== review.id) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
              onMouseLeave={e => { if (selectedReport !== review.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                  background: `${getScoreColor(review.score)}15`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: '13px', fontWeight: 800, color: getScoreColor(review.score),
                }}>
                  {review.score}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{review.repo}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {review.pr} · {review.issues} issues · {formatDate(review.date)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Report Detail */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)', padding: '28px',
        }}>
          {/* Report Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <FileBarChart size={18} style={{ color: 'var(--primary-500)' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>REVIEW REPORT</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
                {mockReport.repositoryName} — PR #{mockReport.prNumber}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{mockReport.prTitle}</p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {formatDate(mockReport.createdAt)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> Duration: {mockReport.duration}
                </span>
                <span>{mockReport.totalFiles} files · {mockReport.totalLines} lines</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                padding: '6px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
                color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600,
              }}>
                <Share2 size={14} /> Share
              </button>
              <button style={{
                padding: '6px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
                color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600,
              }}>
                <Printer size={14} /> Print
              </button>
            </div>
          </div>

          {/* Overall Score */}
          <div style={{
            padding: '24px', borderRadius: 'var(--radius-lg)',
            background: 'var(--gradient-card)', border: '1px solid var(--border-primary)',
            textAlign: 'center', marginBottom: '24px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Overall Score
            </div>
            <div style={{
              fontSize: '64px', fontWeight: 900, lineHeight: 1,
              color: getScoreColor(mockScores.overall),
              marginBottom: '4px',
            }}>
              {mockScores.overall}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {mockScores.overall >= 90 ? 'Excellent' : mockScores.overall >= 70 ? 'Good' : mockScores.overall >= 50 ? 'Fair' : 'Needs Work'}
            </div>
          </div>

          {/* Score Breakdown */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Score Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {scoreEntries.map((entry, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{entry.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: entry.color }}>{entry.score}/100</span>
                  </div>
                  <div style={{
                    height: '8px', borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-tertiary)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${entry.score}%`,
                      background: entry.color, borderRadius: 'var(--radius-full)',
                      transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Summary */}
          <div style={{
            padding: '16px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Issue Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'Critical', count: mockReport.issues.filter(i => i.severity === 'critical').length, color: '#ef4444' },
                { label: 'Warning', count: mockReport.issues.filter(i => i.severity === 'warning').length, color: '#f59e0b' },
                { label: 'Info', count: mockReport.issues.filter(i => i.severity === 'info').length, color: '#3b82f6' },
                { label: 'Suggestion', count: mockReport.issues.filter(i => i.severity === 'suggestion').length, color: '#10b981' },
              ].map((item, i) => (
                <div key={i} style={{
                  textAlign: 'center', padding: '12px', borderRadius: 'var(--radius-md)',
                  background: `${item.color}10`, border: `1px solid ${item.color}20`,
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: item.color }}>{item.count}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* View Full Review Link */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/dashboard/review/pr-001" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 24px', borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)', color: 'white',
              fontSize: '14px', fontWeight: 600, transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <Eye size={16} /> View Full Review <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
