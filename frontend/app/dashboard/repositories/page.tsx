'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search, Star, GitFork, AlertCircle, Lock, Globe, ArrowRight,
  GitBranch, GitPullRequest, Filter, ChevronDown, Clock,
  CheckCircle2, XCircle, GitMerge, Plus, Play, Sparkles, Loader2, RefreshCw
} from 'lucide-react';
import { formatDate, getLanguageColor, formatNumber, getScoreColor } from '@/lib/utils';
import { fetchRepos, importRepo, triggerReview, fetchRepoReviews, syncRepos, rescanRepo, fetchScanProgress } from '@/lib/api';

export default function RepositoriesPage() {
  const searchParams = useSearchParams();
  const [repos, setRepos] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 12;
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null);
  const [repoReviews, setRepoReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [filterLang, setFilterLang] = useState('all');
  const [scanningRepoId, setScanningRepoId] = useState<number | null>(null);
  const [scanProgress, setScanProgress] = useState<string>('Scanning...');

  const loadRepositories = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        try {
          // Try auto-sync from GitHub App first
          const data = await syncRepos(user.id);
          setRepos(data);
        } catch {
          // Fallback to just fetching existing repos from DB
          console.warn('Sync failed, falling back to fetchRepos');
          const data = await fetchRepos(user.id);
          setRepos(data);
        }
      } else {
        setRepos([]);
      }
    } catch (err) {
      console.error('Failed to load repositories:', err);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepositories();
  }, []);

  useEffect(() => {
    if (!selectedRepo) return;
    const loadReviews = async () => {
      try {
        setLoadingReviews(true);
        const data = await fetchRepoReviews(selectedRepo);
        setRepoReviews(data);
      } catch (err) {
        console.error('Failed to load repo reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    loadReviews();
  }, [selectedRepo]);

  const filteredRepos = repos.filter(repo => {
    const nameMatch = (repo.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (repo.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || descMatch;
    const matchesLang = filterLang === 'all' || repo.language === filterLang;
    return matchesSearch && matchesLang;
  });

  // Reset to page 1 when search/filter changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterLang]);

  const totalPages = Math.ceil(filteredRepos.length / reposPerPage);
  const paginatedRepos = filteredRepos.slice((currentPage - 1) * reposPerPage, currentPage * reposPerPage);

  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];

  const statusIcons: Record<string, React.ElementType> = {
    open: CheckCircle2, closed: XCircle, merged: GitMerge,
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Repositories</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Select a repository to view its automated code reviews. New repositories are synced automatically from your GitHub App.
          </p>
        </div>
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
            type="text" placeholder="Search tracked repositories..."
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
        {languages.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setFilterLang('all')} style={{
              padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 600,
              border: '1px solid', cursor: 'pointer', transition: 'all var(--transition-fast)',
              background: filterLang === 'all' ? 'var(--primary-500)' : 'var(--bg-card)',
              color: filterLang === 'all' ? 'white' : 'var(--text-secondary)',
              borderColor: filterLang === 'all' ? 'var(--primary-500)' : 'var(--border-primary)',
            }}>
              All
            </button>
            {languages.map(lang => (
              <button key={lang} onClick={() => setFilterLang(lang)} style={{
                padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 600,
                border: '1px solid', cursor: 'pointer', transition: 'all var(--transition-fast)',
                background: filterLang === lang ? 'var(--primary-500)' : 'var(--bg-card)',
                color: filterLang === lang ? 'white' : 'var(--text-secondary)',
                borderColor: filterLang === lang ? 'var(--primary-500)' : 'var(--border-primary)',
              }}>
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Repository Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px',
        marginBottom: '32px',
      }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', gap: '16px' }}>
            <Loader2 size={32} style={{ color: 'var(--primary-500)', animation: 'spin-slow 1s linear infinite' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Syncing repositories from GitHub...</p>
          </div>
        ) : repos.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px',
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-primary)',
          }}>
            <AlertCircle size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '16px', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>No Tracked Repositories</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              Ensure your GitHub App has access to your repositories. They will sync automatically.
            </p>
          </div>
        ) : (
          paginatedRepos.map((repo, i) => {
            const isSelected = selectedRepo === repo.id;
            const techStack = repo.tech_stack ? repo.tech_stack.split(',').map((t: string) => t.trim()) : [];
            return (
              <div
                key={repo.id}
                onClick={() => { setSelectedRepo(repo.id); }}
                className="animate-fade-up"
                style={{
                  background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  border: `1px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-primary)'}`,
                  borderRadius: 'var(--radius-lg)', padding: '20px', cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  animationDelay: `${i * 0.05}s`, animationFillMode: 'backwards',
                  boxShadow: isSelected ? '0 0 0 1px var(--primary-500)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
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
                        {repo.is_private ? (
                          <Lock size={12} style={{ color: 'var(--text-tertiary)' }} />
                        ) : (
                          <Globe size={12} style={{ color: 'var(--text-tertiary)' }} />
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{repo.full_name}</span>
                    </div>
                  </div>
                  {/* Health score */}
                  <div style={{
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    fontSize: '12px', fontWeight: 700,
                    background: repo.health_score > 0 ? `${getScoreColor(repo.health_score)}15` : 'var(--bg-tertiary)',
                    color: repo.health_score > 0 ? getScoreColor(repo.health_score) : 'var(--text-tertiary)',
                  }}>
                    {repo.health_score > 0 ? repo.health_score : 'N/A'}
                  </div>
                </div>

                {/* Description */}
                {repo.description && (
                  <p style={{
                    fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6,
                    marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {repo.description}
                  </p>
                )}

                {/* Stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  {repo.language && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: getLanguageColor(repo.language),
                      }} />
                      {repo.language}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <Star size={12} /> {formatNumber(repo.stars)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <GitFork size={12} /> {formatNumber(repo.forks)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <AlertCircle size={12} /> {repo.open_issues}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {techStack.length > 0 && techStack.slice(0, 3).map((tech: string) => (
                      <span key={tech} style={{
                        padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '10px',
                        fontWeight: 600, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                        border: '1px solid var(--border-primary)',
                      }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <button
                    disabled={scanningRepoId === repo.id}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (scanningRepoId) return;
                      setScanningRepoId(repo.id);
                      setScanProgress('Starting scan...');
                      try {
                        await rescanRepo(repo.id);
                        // Poll progress every 3 seconds
                        const pollInterval = setInterval(async () => {
                          try {
                            const progress = await fetchScanProgress(repo.id);
                            if (progress) {
                              const pct = progress.progress_pct || 0;
                              const agent = progress.current_agent || 'Processing';
                              let progressStr = `${agent} (${pct}%)`;
                              if (progress.eta_seconds !== null && progress.eta_seconds !== undefined && progress.eta_seconds > 0) {
                                const mins = Math.floor(progress.eta_seconds / 60);
                                const secs = progress.eta_seconds % 60;
                                const etaStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                                progressStr += ` | ~${etaStr} left`;
                              }
                              setScanProgress(progressStr);
                              if (progress.status === 'completed' || progress.status === 'failed' || pct >= 100) {
                                clearInterval(pollInterval);
                                setScanningRepoId(null);
                                setScanProgress('Scanning...');
                                // Refresh repos and reviews
                                loadRepositories();
                                if (selectedRepo === repo.id) {
                                  const data = await fetchRepoReviews(repo.id);
                                  setRepoReviews(data);
                                }
                              }
                            }
                          } catch {
                            clearInterval(pollInterval);
                            setScanningRepoId(null);
                            setScanProgress('Scanning...');
                          }
                        }, 3000);
                      } catch (err) {
                        console.error('Scan failed', err);
                        setScanningRepoId(null);
                        setScanProgress('Scanning...');
                      }
                    }}
                    style={{
                      padding: '6px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)', border: '1px solid var(--border-primary)', 
                      cursor: scanningRepoId === repo.id ? 'not-allowed' : 'pointer',
                      fontWeight: 600, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'all 0.2s', opacity: scanningRepoId === repo.id ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (scanningRepoId !== repo.id) e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      if (scanningRepoId !== repo.id) e.currentTarget.style.background = 'var(--bg-secondary)';
                    }}
                  >
                    {scanningRepoId === repo.id ? (
                      <><Loader2 size={12} style={{ animation: 'spin-slow 1s linear infinite' }} /> {scanProgress}</>
                    ) : (
                      <><RefreshCw size={12} /> {repo.health_score > 0 ? 'Rescan' : 'Scan Now'}</>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
          marginBottom: '32px',
        }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600,
              border: '1px solid var(--border-primary)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              background: 'var(--bg-card)', color: currentPage === 1 ? 'var(--text-tertiary)' : 'var(--text-primary)',
              opacity: currentPage === 1 ? 0.5 : 1, transition: 'all var(--transition-fast)',
            }}
          >
            ← Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                fontSize: '13px', fontWeight: 700, border: '1px solid',
                cursor: 'pointer', transition: 'all var(--transition-fast)',
                background: currentPage === page ? 'var(--primary-500)' : 'var(--bg-card)',
                color: currentPage === page ? 'white' : 'var(--text-secondary)',
                borderColor: currentPage === page ? 'var(--primary-500)' : 'var(--border-primary)',
              }}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600,
              border: '1px solid var(--border-primary)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              background: 'var(--bg-card)', color: currentPage === totalPages ? 'var(--text-tertiary)' : 'var(--text-primary)',
              opacity: currentPage === totalPages ? 0.5 : 1, transition: 'all var(--transition-fast)',
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Selected Repo: Side Panel (Production Grade UI) */}
      {selectedRepo && (
        <>
          {/* Backdrop */}
          <div 
            className="animate-fade-in"
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(2px)', zIndex: 90,
            }}
            onClick={() => setSelectedRepo(null)}
          />
          
          {/* Side Panel */}
          <div 
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '450px',
              background: 'var(--bg-card)', borderLeft: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-2xl)', zIndex: 100, display: 'flex', flexDirection: 'column',
              animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}
          >
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
            
            <div style={{
              padding: '24px', borderBottom: '1px solid var(--border-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                  background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700,
                }}>
                  {repos.find(r => r.id === selectedRepo)?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{repos.find(r => r.id === selectedRepo)?.name}</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{repos.find(r => r.id === selectedRepo)?.full_name}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRepo(null)}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s'
                }}
              >
                <XCircle size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <GitPullRequest size={18} style={{ color: 'var(--primary-500)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                  Recent AI Reviews
                </h3>
              </div>
              
              {loadingReviews ? (
                <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Loader2 size={24} style={{ color: 'var(--primary-500)', animation: 'spin-slow 1s linear infinite' }} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Loading past reviews...</span>
                </div>
              ) : repoReviews.length === 0 ? (
                <div style={{ padding: '40px 20px', color: 'var(--text-tertiary)', fontSize: '13px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-primary)' }}>
                  No reviews recorded yet for this repository.<br/><br/>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>Reviews will appear here automatically when the CodeSageAI daemon scans new Pull Requests.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {repoReviews.slice(0, 10).map((r) => {
                    return (
                      <Link key={r.id} href={`/dashboard/review/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '16px', borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-primary)',
                          background: 'var(--bg-secondary)',
                          transition: 'all var(--transition-fast)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--primary-500)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                        >
                          <div style={{
                            width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                            background: `${getScoreColor(r.overall_score)}15`, color: getScoreColor(r.overall_score),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 800, flexShrink: 0,
                          }}>
                            {r.overall_score}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {r.pr_title}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                                {r.review_type === 'commit' ? `Commit ${r.commit_hash?.slice(0, 7)}` : `#${r.pr_number}`}
                              </span> 
                              <span>•</span>
                              <Clock size={10} /> {formatDate(r.created_at)}
                            </div>
                          </div>
                          <span className={`badge badge-${r.status.toLowerCase() === 'failed' ? 'critical' : r.status.toLowerCase() === 'completed' ? 'success' : 'warning'}`} style={{ fontSize: '10px' }}>
                            {r.status}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
              <Link href="/dashboard" style={{
                display: 'block', width: '100%', padding: '12px', textAlign: 'center',
                background: 'var(--gradient-primary)', color: 'white', borderRadius: 'var(--radius-md)',
                textDecoration: 'none', fontWeight: 700, fontSize: '13px', boxShadow: 'var(--shadow-md)'
              }}>
                View Full Analytics
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
