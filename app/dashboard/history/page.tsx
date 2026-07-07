'use client';

import Link from 'next/link';
import { GitBranch, ArrowUpRight, CheckCircle2, Clock, Eye, Search } from 'lucide-react';
import { mockReviewHistory } from '@/lib/mock-data';
import { getScoreColor, formatDate } from '@/lib/utils';
import { useState } from 'react';

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockReviewHistory.filter(r =>
    r.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.pr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Review History</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>All past code reviews and their results.</p>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)' }}>
              {['Repository', 'PR', 'Score', 'Issues', 'Date', 'Status', 'Action'].map(h => (
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
                    {review.repo}
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{review.pr}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontWeight: 700, color: getScoreColor(review.score) }}>{review.score}</span>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{review.issues}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {formatDate(review.date)}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                    fontSize: '11px', fontWeight: 600,
                    background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                  }}>
                    <CheckCircle2 size={11} /> Complete
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Link href="/dashboard/review/pr-001" style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    color: 'var(--primary-500)', fontSize: '12px', fontWeight: 600,
                  }}>
                    <Eye size={14} /> View <ArrowUpRight size={10} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
