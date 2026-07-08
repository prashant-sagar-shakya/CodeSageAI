'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitBranch, ArrowUpRight, CheckCircle2, Clock, Eye, Search, FolderOpen } from 'lucide-react';
import { getScoreColor, formatDate } from '@/lib/utils';
import { fetchDashboardStats } from '@/lib/api';

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const ownerId = user?.id || 1;
        const stats = await fetchDashboardStats(ownerId);
        setHistory(stats.reviewHistory || []);
      } catch (err) {
        console.error('Failed to load review history:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const filtered = history.filter(r =>
    (r.repo_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.pr_title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Code Reviews</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>All triggered code reviews and their results from your database.</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '20px' }}>
        <Search size={16} style={{
          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-tertiary)',
        }} />
        <input type="text" placeholder="Search reviews..." value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)', background: 'var(--bg-input)',
            color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        />
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading reviews...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
            <FolderOpen size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '12px', margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '14px', fontWeight: 600 }}>No reviews found</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Trigger an AI review run on your tracked repositories to list them here.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)' }}>
                {['Repository', 'PR Details', 'Overall Score', 'Date', 'Status', 'Action'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontWeight: 600,
                    color: 'var(--text-tertiary)', fontSize: '11px', textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.id} style={{
                  borderBottom: '1px solid var(--border-primary)',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GitBranch size={14} style={{ color: 'var(--primary-500)' }} />
                      {review.repo_name}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    #{review.pr_number} - {review.pr_title}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontWeight: 700, color: getScoreColor(review.overall_score) }}>{review.overall_score}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {formatDate(review.created_at)}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 10px', borderRadius: 'var(--radius-full)',
                      fontSize: '11px', fontWeight: 600,
                      background: review.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: review.status === 'completed' ? '#10b981' : '#f59e0b',
                    }}>
                      {review.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={`/dashboard/review/${review.id}`} style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      color: 'var(--primary-500)', fontSize: '12px', fontWeight: 600,
                      textDecoration: 'none',
                    }}>
                      <Eye size={14} /> View <ArrowUpRight size={10} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
