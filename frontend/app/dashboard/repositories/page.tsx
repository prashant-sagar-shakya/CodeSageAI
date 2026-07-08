'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, Star, GitFork, AlertCircle, Lock, Globe, ArrowRight,
  GitBranch, GitPullRequest, Filter, SortDesc, ChevronDown, Clock,
  CheckCircle2, XCircle, GitMerge, Plus, ArrowUpRight
} from 'lucide-react';
import { mockRepositories, mockBranches, mockPullRequests } from '@/lib/mock-data';
import { formatDate, getLanguageColor, formatNumber, getScoreColor } from '@/lib/utils';

export default function RepositoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [showBranches, setShowBranches] = useState(false);
  const [filterLang, setFilterLang] = useState('all');

  const filteredRepos = mockRepositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = filterLang === 'all' || repo.language === filterLang;
    return matchesSearch && matchesLang;
  });

  const languages = [...new Set(mockRepositories.map(r => r.language))];

  const statusIcons: Record<string, React.ElementType> = {
    open: CheckCircle2, closed: XCircle, merged: GitMerge,
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Repositories</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Select a repository to analyze or start a new code review.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={16} style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)',
          }} />
          <input
            type="text" placeholder="Search repositories..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)', background: 'var(--bg-input)',
              color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
              fontFamily: 'var(--font-sans)', transition: 'border-color var(--transition-fast)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', ...languages].map(lang => (
            <button key={lang} onClick={() => setFilterLang(lang)} style={{
              padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 600,
              border: '1px solid', cursor: 'pointer', transition: 'all var(--transition-fast)',
              background: filterLang === lang ? 'var(--primary-500)' : 'var(--bg-card)',
              color: filterLang === lang ? 'white' : 'var(--text-secondary)',
              borderColor: filterLang === lang ? 'var(--primary-500)' : 'var(--border-primary)',
            }}>
              {lang === 'all' ? 'All' : lang}
            </button>
          ))}
        </div>
      </div>

      {/* Repository Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px',
        marginBottom: '32px',
      }}>
        {filteredRepos.map((repo, i) => (
          <div
            key={repo.id}
            onClick={() => { setSelectedRepo(repo.id); setSelectedBranch(null); }}
            className="animate-fade-up"
            style={{
              background: selectedRepo === repo.id ? 'var(--bg-card-hover)' : 'var(--bg-card)',
              border: `1px solid ${selectedRepo === repo.id ? 'var(--primary-500)' : 'var(--border-primary)'}`,
              borderRadius: 'var(--radius-lg)', padding: '20px', cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              animationDelay: `${i * 0.05}s`, animationFillMode: 'backwards',
              boxShadow: selectedRepo === repo.id ? '0 0 0 1px var(--primary-500)' : 'none',
            }}
            onMouseEnter={e => {
              if (selectedRepo !== repo.id) {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }
            }}
            onMouseLeave={e => {
              if (selectedRepo !== repo.id) {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {/* Repo header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                  background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700,
                }}>
                  {repo.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{repo.name}</h3>
                    {repo.isPrivate ? (
                      <Lock size={12} style={{ color: 'var(--text-tertiary)' }} />
                    ) : (
                      <Globe size={12} style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{repo.fullName}</span>
                </div>
              </div>
              {/* Health score */}
              <div style={{
                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                fontSize: '12px', fontWeight: 700,
                background: `${getScoreColor(repo.healthScore)}15`,
                color: getScoreColor(repo.healthScore),
              }}>
                {repo.healthScore}
              </div>
            </div>

            {/* Description */}
            <p style={{
              fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6,
              marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {repo.description}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: getLanguageColor(repo.language),
                }} />
                {repo.language}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <Star size={12} /> {formatNumber(repo.stars)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <GitFork size={12} /> {formatNumber(repo.forks)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <AlertCircle size={12} /> {repo.openIssues}
              </div>
            </div>

            {/* Tech stack */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {repo.techStack.slice(0, 4).map(tech => (
                <span key={tech} style={{
                  padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '10px',
                  fontWeight: 600, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                }}>
                  {tech}
                </span>
              ))}
              {repo.techStack.length > 4 && (
                <span style={{
                  padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '10px',
                  fontWeight: 600, color: 'var(--text-tertiary)',
                }}>
                  +{repo.techStack.length - 4}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Repo: Branch & PR selection */}
      {selectedRepo && (
        <div className="animate-fade-up" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)', padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <GitBranch size={18} style={{ color: 'var(--primary-500)' }} />
            <h2 style={{ fontSize: '17px', fontWeight: 700 }}>
              Select Branch & Pull Request
            </h2>
          </div>

          {/* Branch selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Branch
            </label>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowBranches(!showBranches)} style={{
                width: '100%', maxWidth: '400px', padding: '10px 14px',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)', color: 'var(--text-primary)',
                fontSize: '13px', fontWeight: 500, textAlign: 'left',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', transition: 'all var(--transition-fast)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitBranch size={14} />
                  {selectedBranch || 'Select a branch...'}
                </span>
                <ChevronDown size={16} style={{
                  transform: showBranches ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform var(--transition-fast)',
                }} />
              </button>
              {showBranches && (
                <div className="animate-scale-in" style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0,
                  width: '100%', maxWidth: '400px',
                  background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xl)',
                  zIndex: 20, maxHeight: '200px', overflow: 'auto',
                }}>
                  {mockBranches.map(branch => (
                    <button key={branch.name}
                      onClick={() => { setSelectedBranch(branch.name); setShowBranches(false); }}
                      style={{
                        width: '100%', padding: '10px 14px', textAlign: 'left',
                        background: selectedBranch === branch.name ? 'var(--bg-tertiary)' : 'transparent',
                        border: 'none', cursor: 'pointer', fontSize: '13px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        color: 'var(--text-primary)', transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                      onMouseLeave={e => { if (selectedBranch !== branch.name) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GitBranch size={14} style={{ color: 'var(--primary-500)' }} />
                        {branch.name}
                        {branch.isDefault && (
                          <span style={{
                            padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: '10px',
                            fontWeight: 600, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-500)',
                          }}>default</span>
                        )}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{formatDate(branch.lastCommitDate)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pull Requests */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pull Requests
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mockPullRequests.map((pr, i) => {
                const StatusIcon = statusIcons[pr.status];
                return (
                  <Link href={`/dashboard/review/${pr.id}`} key={pr.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-secondary)',
                    transition: 'all var(--transition-fast)', cursor: 'pointer',
                    textDecoration: 'none', color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                  >
                    <div style={{ flexShrink: 0 }}>
                      <GitPullRequest size={18} style={{
                        color: pr.status === 'open' ? '#10b981' : pr.status === 'merged' ? '#8b5cf6' : '#ef4444',
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{pr.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        <span>#{pr.number}</span>
                        <span>{pr.author}</span>
                        <span>{formatDate(pr.createdAt)}</span>
                        <span style={{ color: '#10b981' }}>+{pr.additions}</span>
                        <span style={{ color: '#ef4444' }}>-{pr.deletions}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {pr.labels.slice(0, 2).map(label => (
                        <span key={label} style={{
                          padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '10px',
                          fontWeight: 600, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                          border: '1px solid var(--border-primary)',
                        }}>{label}</span>
                      ))}
                      <span className={`badge badge-${pr.status}`}>
                        {pr.status.charAt(0).toUpperCase() + pr.status.slice(1)}
                      </span>
                      <ArrowRight size={16} style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
