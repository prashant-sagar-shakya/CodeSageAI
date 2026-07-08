'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileBarChart, Download, FileText, Code2, Globe, Eye,
  ArrowUpRight, Calendar, Clock, GitBranch, FolderOpen,
  Printer, Share2, AlertTriangle
} from 'lucide-react';
import { getScoreColor, formatDate } from '@/lib/utils';
import { fetchDashboardStats, fetchReview, getReportDownloadUrl } from '@/lib/api';

export default function ReportsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const loadList = async () => {
      try {
        setLoadingList(true);
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const ownerId = user?.id || 1;
        const stats = await fetchDashboardStats(ownerId);
        const reviewList = stats.reviewHistory || [];
        setHistory(reviewList);
        if (reviewList.length > 0) {
          setSelectedReportId(reviewList[0].id);
        }
      } catch (err) {
        console.error('Failed to load review history:', err);
      } finally {
        setLoadingList(false);
      }
    };
    loadList();
  }, []);

  useEffect(() => {
    if (!selectedReportId) return;

    const loadReviewDetails = async () => {
      try {
        setLoadingDetail(true);
        const data = await fetchReview(selectedReportId);
        setSelectedReview(data);
      } catch (err) {
        console.error('Failed to load review details:', err);
      } finally {
        setLoadingDetail(false);
      }
    };

    loadReviewDetails();
  }, [selectedReportId]);

  const handleExport = (format: 'html' | 'pdf' | 'markdown') => {
    if (!selectedReportId) return;
    const url = getReportDownloadUrl(selectedReportId, format);
    window.open(url, '_blank');
  };

  const scores = selectedReview?.scores || {};
  const issues = selectedReview?.issues || [];

  const scoreEntries = [
    { label: 'Security', score: scores.security || 100, color: '#f59e0b' },
    { label: 'Performance', score: scores.performance || 100, color: '#10b981' },
    { label: 'Readability', score: scores.readability || 100, color: '#6366f1' },
    { label: 'Testing', score: scores.testing || 100, color: '#ec4899' },
    { label: 'Documentation', score: scores.documentation || 100, color: '#06b6d4' },
    { label: 'Maintainability', score: scores.maintainability || 100, color: '#8b5cf6' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Reports</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            View detailed review reports and export them in your preferred format.
          </p>
        </div>
        {selectedReportId && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleExport('pdf')} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
              color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Download size={14} /> Export PDF
            </button>
            <button onClick={() => handleExport('markdown')} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
              color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Code2 size={14} /> Export Markdown
            </button>
            <button onClick={() => handleExport('html')} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
              color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Globe size={14} /> Export HTML
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Report List */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)', padding: '16px', height: 'fit-content',
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-tertiary)', padding: '4px 8px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Review History
          </h3>
          {loadingList ? (
            <div style={{ padding: '20px 8px', color: 'var(--text-secondary)', fontSize: '12px' }}>Loading reviews...</div>
          ) : history.length === 0 ? (
            <div style={{ padding: '20px 8px', color: 'var(--text-tertiary)', fontSize: '12px', textAlign: 'center' }}>
              No completed reviews.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {history.map(review => (
                <button key={review.id} onClick={() => setSelectedReportId(review.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  border: 'none', textAlign: 'left', cursor: 'pointer',
                  background: selectedReportId === review.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  transition: 'all var(--transition-fast)', width: '100%',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={e => { if (selectedReportId !== review.id) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={e => { if (selectedReportId !== review.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                    background: `${getScoreColor(review.overall_score)}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontSize: '13px', fontWeight: 800, color: getScoreColor(review.overall_score),
                  }}>
                    {review.overall_score}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{review.repo_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      #{review.pr_number} · {formatDate(review.created_at)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Report Detail */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)', padding: '28px', flex: 2,
        }}>
          {loadingDetail ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px', gap: '12px' }}>
              <div style={{
                width: '30px', height: '30px', border: '2px solid var(--border-primary)',
                borderTopColor: 'var(--primary-500)', borderRadius: '50%',
                animation: 'spin-slow 0.8s linear infinite',
              }} />
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loading report summary...</div>
            </div>
          ) : !selectedReview ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-secondary)' }}>
              <FolderOpen size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '16px', margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>No Report Selected</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Track a repository and trigger a manual PR review to generate reports.</p>
            </div>
          ) : (
            <div>
              {/* Report Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <FileBarChart size={18} style={{ color: 'var(--primary-500)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>REVIEW SUMMARY REPORT</span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
                    {selectedReview.repo_name || 'Repository'} — PR #{selectedReview.pr_number}
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{selectedReview.pr_title}</p>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {formatDate(selectedReview.created_at)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> Duration: {selectedReview.duration}
                    </span>
                    <span>{selectedReview.total_files} files · {selectedReview.total_lines} lines</span>
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div style={{
                padding: '24px', borderRadius: 'var(--radius-lg)',
                background: 'var(--gradient-card)', border: '1px solid var(--border-primary)',
                textAlign: 'center', marginBottom: '24px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  Overall Health Score
                </div>
                <div style={{
                  fontSize: '64px', fontWeight: 900, lineHeight: 1,
                  color: getScoreColor(scores.overall || 100),
                  marginBottom: '4px',
                }}>
                  {scores.overall || 100}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {(scores.overall || 100) >= 90 ? 'Excellent' : (scores.overall || 100) >= 70 ? 'Good' : (scores.overall || 100) >= 50 ? 'Fair' : 'Needs Work'}
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'Critical', count: issues.filter((i: any) => (i.severity || '').toLowerCase() === 'critical').length, color: '#ef4444' },
                    { label: 'Warning', count: issues.filter((i: any) => (i.severity || '').toLowerCase() === 'warning').length, color: '#f59e0b' },
                    { label: 'Info', count: issues.filter((i: any) => (i.severity || '').toLowerCase() === 'info').length, color: '#3b82f6' },
                    { label: 'Suggestion', count: issues.filter((i: any) => (i.severity || '').toLowerCase() === 'suggestion').length, color: '#10b981' },
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
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link href={`/dashboard/review/${selectedReportId}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 24px', borderRadius: 'var(--radius-md)',
                  background: 'var(--gradient-primary)', color: 'white',
                  fontSize: '14px', fontWeight: 600, transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <Eye size={16} /> View Full Code review <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
