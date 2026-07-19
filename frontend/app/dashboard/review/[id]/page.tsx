'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  ChevronDown, ChevronRight, FileCode2, FolderOpen, Folder, Eye,
  Shield, Bug, Zap, Code2, FileText, TestTube2, RefreshCw, FolderSearch,
  CheckCircle2, AlertTriangle, Info, Lightbulb, Clock, GitPullRequest, GitBranch,
  Copy, Check, Sparkles, Layers
} from 'lucide-react';
import { getScoreColor, formatDate } from '@/lib/utils';
import { fetchReview } from '@/lib/api';

// ---- Icon Map ----
const agentIconMap: Record<string, React.ElementType> = {
  FolderSearch, Code2, Bug, Shield, Zap, FileText, TestTube2, RefreshCw,
};

// ---- Score Ring Component ----
function ScoreRing({ score, size = 100, strokeWidth = 7, label, color }: {
  score: number; size?: number; strokeWidth?: number; label: string; color?: string
}) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGSVGElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated ? (score / 100) * circumference : 0);
  const ringColor = color || getScoreColor(score);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(() => setAnimated(true), 300); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg ref={ref} width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} className="score-ring-bg" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} className="score-ring-fill"
            strokeWidth={strokeWidth} stroke={ringColor}
            strokeDasharray={circumference} strokeDashoffset={offset}
          />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          fontSize: size > 80 ? '22px' : '16px', fontWeight: 800, color: ringColor,
        }}>
          {animated ? score : 0}
        </div>
      </div>
      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>{label}</span>
    </div>
  );
}

// ---- File Tree Component ----
function FileTreeNode({ node, depth = 0, onSelectFile }: { node: any; depth?: number; onSelectFile: (path: string) => void }) {
  const [open, setOpen] = useState(depth < 2);

  return (
    <div>
      <div
        onClick={() => {
          if (node.type === 'directory') {
            setOpen(!open);
          } else {
            onSelectFile(node.path);
          }
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 8px', paddingLeft: `${8 + depth * 16}px`,
          fontSize: '12px', cursor: 'pointer',
          borderRadius: 'var(--radius-sm)',
          transition: 'background var(--transition-fast)',
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        {node.type === 'directory' ? (
          <>
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {open ? <FolderOpen size={14} style={{ color: 'var(--primary-400)' }} /> : <Folder size={14} style={{ color: 'var(--primary-400)' }} />}
          </>
        ) : (
          <>
            <span style={{ width: '12px' }} />
            <FileCode2 size={14} style={{ color: 'var(--text-tertiary)' }} />
          </>
        )}
        <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
        {node.issueCount !== undefined && node.issueCount > 0 && (
          <span style={{
            padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: '10px',
            fontWeight: 700, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
            minWidth: '18px', textAlign: 'center',
          }}>
            {node.issueCount}
          </span>
        )}
      </div>
      {node.type === 'directory' && open && node.children?.map((child: any, i: number) => (
        <FileTreeNode key={i} node={child} depth={depth + 1} onSelectFile={onSelectFile} />
      ))}
    </div>
  );
}

// ---- Issue Card Component ----
function IssueCard({ issue, index }: { issue: any; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [copied, setCopied] = useState(false);

  const severityConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
    critical: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: AlertTriangle },
    warning: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: AlertTriangle },
    info: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: Info },
    suggestion: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: Lightbulb },
  };

  const severity = (issue.severity || 'info').toLowerCase();
  const config = severityConfig[severity] || severityConfig.info;
  const SeverityIcon = config.icon;

  const codeAfter = issue.code_after || issue.codeAfter || '';
  const codeBefore = issue.code_before || issue.codeBefore || '';
  const filePath = issue.file_path || issue.file || 'unknown_file';
  const lineNumber = issue.line_number || issue.line || 1;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeAfter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-up" style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      borderLeft: `3px solid ${config.color}`,
      transition: 'all var(--transition-normal)',
      animationDelay: `${index * 0.05}s`, animationFillMode: 'backwards',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '16px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '12px',
          transition: 'background var(--transition-fast)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{
          width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
          background: config.bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <SeverityIcon size={16} style={{ color: config.color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{issue.title}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: '10px',
              fontWeight: 600, background: config.bg, color: config.color,
            }}>
              {severity.toUpperCase()}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {filePath}:{lineNumber}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Confidence: {issue.confidence}%
            </span>
            <span style={{
              padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: '10px',
              fontWeight: 600, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
            }}>
              {issue.agent}
            </span>
          </div>
        </div>
        <div style={{
          transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform var(--transition-fast)',
        }}>
          <ChevronDown size={18} style={{ color: 'var(--text-tertiary)' }} />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border-primary)',
          animation: 'fade-up 0.3s ease-out',
        }}>
          {/* Explanation */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
            <h5 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Why This Is An Issue
            </h5>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {issue.explanation}
            </p>
          </div>

          {/* How to Fix */}
          {issue.how_to_fix && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
              <h5 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                How to Fix
              </h5>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {issue.how_to_fix}
              </p>
            </div>
          )}

          {/* Before / After */}
          {(codeBefore || codeAfter) && (
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Before */}
                {codeBefore && (
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
                      fontSize: '11px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase',
                    }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444',
                      }} />
                      Before
                    </div>
                    <pre className="code-block" style={{
                      padding: '12px', fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap',
                      background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)',
                    }}>
                      {codeBefore}
                    </pre>
                  </div>
                )}
                {/* After */}
                {codeAfter && (
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase',
                      }}>
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%', background: '#10b981',
                        }} />
                        After (Fixed)
                      </div>
                      <button onClick={handleCopy} style={{
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)',
                        background: 'var(--bg-card)', color: 'var(--text-tertiary)',
                        cursor: 'pointer', fontSize: '10px', fontWeight: 600,
                      }}>
                        {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                      </button>
                    </div>
                    <pre className="code-block" style={{
                      padding: '12px', fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap',
                      background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)',
                    }}>
                      {codeAfter}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid var(--border-primary)',
            display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
          }}>
            {issue.category && (
              <span style={{
                padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '10px',
                fontWeight: 600, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-500)',
              }}>
                {issue.category}
              </span>
            )}
            {issue.rule && (
              <span style={{
                padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '10px',
                fontWeight: 600, background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
              }}>
                {issue.rule}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to build a file tree dynamically from issue files list
function buildFileTree(issues: any[]) {
  const root: any[] = [];
  const files = [...new Set(issues.map(iss => iss.file_path || iss.file).filter(Boolean))];

  for (const filePath of files) {
    const parts = filePath.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const type = isLast ? 'file' : 'directory';

      let existingPath = currentLevel.find(item => item.name === part && item.type === type);

      if (!existingPath) {
        existingPath = {
          name: part,
          type,
          path: filePath,
          issueCount: issues.filter(iss => (iss.file_path || iss.file) === filePath).length,
          children: []
        };
        currentLevel.push(existingPath);
      }
      currentLevel = existingPath.children;
    }
  }

  return root;
}

export default function ReviewPage() {
  const params = useParams();
  const reviewId = Number(params?.id);

  const [activeTab, setActiveTab] = useState('overview');
  const [agentFilter, setAgentFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering select file issues
  const [selectedFileFilter, setSelectedFileFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!reviewId) return;

    let timer: NodeJS.Timeout;

    const getReview = async () => {
      try {
        const data = await fetchReview(reviewId);
        setReview(data);
        setLoading(false);

        // Keep polling if status is queued/processing
        if (data.status === 'pending' || data.status === 'processing') {
          timer = setTimeout(getReview, 3000);
        }
      } catch (err: any) {
        console.error('Failed to load review:', err);
        setError(err.message || 'Failed to fetch review data.');
        setLoading(false);
      }
    };

    getReview();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [reviewId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
        <div style={{
          width: '50px', height: '50px', border: '3px solid var(--border-primary)',
          borderTopColor: 'var(--primary-500)', borderRadius: '50%',
          animation: 'spin-slow 0.8s linear infinite',
        }} />
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Initializing AI Review Orchestrator...</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Polling your code review status from PostgreSQL.</p>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '16px', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Failed to Load Review Details</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>{error || 'No review run record found.'}</p>
        <button onClick={() => window.location.href = "/dashboard/repositories"} style={{
          padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)',
          color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
        }}>
          Back to Repositories
        </button>
      </div>
    );
  }

  // Active status processing panels
  if (review.status === 'pending' || review.status === 'processing') {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '32px', textAlign: 'center' }} className="glass-card animate-scale-in">
        <Sparkles size={48} className="animate-spin-slow" style={{ color: 'var(--primary-500)', marginBottom: '24px', margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
          {review.status === 'pending' ? 'Review Queued' : 'AI Review in Progress'}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
          {review.status === 'pending' 
            ? `Your ${review.review_type === 'commit' ? 'commit' : 'PR'} review is registered. Waiting for the background task runner to dispatch.`
            : `3 consolidated AI agents are scanning your ${review.review_type === 'commit' ? 'commit' : 'PR'} for bugs, security vulnerabilities, performance issues, and code quality.`
          }
        </p>

        {/* Dynamic status messages log console */}
        <div style={{
          background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'left',
          fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--primary-400)',
          marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <div>[INFO] Review run initiated for: "{review.pr_title}"</div>
          <div>[INFO] {review.review_type === 'commit' ? `Commit: ${review.commit_hash?.slice(0, 7)}` : `PR Number: #${review.pr_number}`} | Base: {review.base_branch || 'N/A'} / Head: {review.head_branch || 'N/A'}</div>
          {review.status === 'processing' && (
            <>
              <div>[INFO] Triggering consolidated agent pipeline...</div>
              <div>[RUNNING] Code Health Agent analyzing quality, docs & architecture...</div>
              <div>[RUNNING] Reliability Agent detecting bugs & performance issues...</div>
              <div>[RUNNING] Security Agent auditing OWASP Top 10 & CWE mapping...</div>
              <div>[STANDBY] Smart Scanner (Tree-sitter → Semgrep → AI) on fallback...</div>
            </>
          )}
          <div style={{ color: 'var(--text-tertiary)', animation: 'pulse 1.5s infinite' }}>[POLLING] Waiting for agent aggregation... (auto-refreshing)</div>
        </div>

        {/* Real-time Progress Bar & ETA */}
        {review.progress && review.status === 'processing' && (
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
            padding: '16px', marginTop: '24px', textAlign: 'left',
            border: '1px solid var(--border-primary)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
              <span style={{ color: 'var(--primary-500)' }}>
                {review.progress.current_agent || 'Analyzing...'}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {review.progress.eta_seconds ? `~${Math.floor(review.progress.eta_seconds / 60)}m ${review.progress.eta_seconds % 60}s left` : 'Calculating ETA...'}
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: 'var(--gradient-primary)',
                width: `${review.progress.progress_pct || 0}%`,
                transition: 'width 1s linear',
              }} />
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px', fontWeight: 700 }}>
              {review.progress.progress_pct || 0}%
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-500)', animation: 'bounce 1s infinite' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-500)', animation: 'bounce 1s infinite 0.2s' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-500)', animation: 'bounce 1s infinite 0.4s' }} />
        </div>
      </div>
    );
  }

  // Loaded/completed review resources
  const issues = review.issues || [];
  const fileTree = buildFileTree(issues);
  const scores = review.scores || {};

  const filteredIssues = issues.filter((issue: any) => {
    const matchesAgent = agentFilter === 'all' || issue.agent === agentFilter;
    const severity = (issue.severity || '').toLowerCase();
    const matchesSev = severityFilter === 'all' || severity === severityFilter.toLowerCase();
    const filePath = issue.file_path || issue.file || '';
    const matchesFile = !selectedFileFilter || filePath === selectedFileFilter;
    return matchesAgent && matchesSev && matchesFile;
  });

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Eye },
    { key: 'issues', label: `Issues (${issues.length})`, icon: AlertTriangle },
    { key: 'code', label: 'Code Diff', icon: Code2 },
    { key: 'agents', label: 'Agents', icon: Layers },
  ];

  const scoreCategories = [
    { key: 'security', label: 'Security', score: scores.security || 100, color: '#f59e0b' },
    { key: 'performance', label: 'Performance', score: scores.performance || 100, color: '#10b981' },
    { key: 'readability', label: 'Readability', score: scores.readability || 100, color: '#6366f1' },
    { key: 'testing', label: 'Testing', score: scores.testing || 100, color: '#ec4899' },
    { key: 'documentation', label: 'Docs', score: scores.documentation || 100, color: '#06b6d4' },
    { key: 'maintainability', label: 'Maintain.', score: scores.maintainability || 100, color: '#8b5cf6' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* PR Header */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {review.review_type === 'commit' ? <GitBranch size={18} style={{ color: '#10b981' }} /> : <GitPullRequest size={18} style={{ color: '#10b981' }} />}
              <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                {review.review_type === 'commit' ? `Commit ${review.commit_hash?.slice(0, 7)}` : `#${review.pr_number}`}
              </span>
              <span className="badge badge-open" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>{review.status.toUpperCase()}</span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>{review.pr_title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
              <span>
                <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Reviewed in {review.duration}
              </span>
              <span>{review.total_files} files changed</span>
              <span>{review.total_lines} lines changed</span>
            </div>
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '12px 20px', background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{
              fontSize: '36px', fontWeight: 900,
              color: getScoreColor(scores.overall || 100),
              lineHeight: 1,
            }}>
              {scores.overall || 100}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Overall Score
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '20px',
        borderBottom: '1px solid var(--border-primary)', paddingBottom: '0',
      }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 16px', fontSize: '13px', fontWeight: 600,
            color: activeTab === tab.key ? 'var(--primary-500)' : 'var(--text-secondary)',
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: activeTab === tab.key ? '2px solid var(--primary-500)' : '2px solid transparent',
            transition: 'all var(--transition-fast)',
            marginBottom: '-1px',
          }}>
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* === TAB: OVERVIEW === */}
      {activeTab === 'overview' && (
        <div>
          {/* Score Rings */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '20px',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Score Breakdown</h3>
            <div style={{
              display: 'flex', justifyContent: 'space-around', alignItems: 'center',
              flexWrap: 'wrap', gap: '16px',
            }}>
              {scoreCategories.map(cat => (
                <ScoreRing key={cat.key} score={cat.score} label={cat.label} color={cat.color} size={90} strokeWidth={6} />
              ))}
            </div>
          </div>

          {/* Agent Status Grid */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '20px',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>AI Agent Status</h3>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px',
            }}>
              {Array.from(new Set((review.issues || []).map((i: any) => i.agent))).map((agentName: any, i) => {
                const Icon = agentIconMap[agentName] || Shield;
                const agentFindings = issues.filter((iss: any) => iss.agent === agentName).length;
                return (
                  <div key={i} style={{
                    padding: '14px 16px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'all var(--transition-fast)',
                  }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                      background: `rgba(var(--primary-500-rgb), 0.1)`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={18} style={{ color: 'var(--primary-500)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{agentName || 'Agent'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          Status: Complete
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-500)' }}>{agentFindings}</div>
                      <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: 600 }}>FINDINGS</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* === TAB: ISSUES === */}
      {activeTab === 'issues' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
          {/* File Tree Sidebar */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)', padding: '20px', height: 'fit-content',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Files
              {selectedFileFilter && (
                <button onClick={() => setSelectedFileFilter(null)} style={{
                  background: 'none', border: 'none', color: 'var(--primary-500)',
                  fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                }}>
                  Clear Filter
                </button>
              )}
            </h3>
            {fileTree.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>
                No files with issues.
              </div>
            ) : (
              fileTree.map((node, i) => (
                <FileTreeNode key={i} node={node} onSelectFile={setSelectedFileFilter} />
              ))
            )}
          </div>

          {/* Issue Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Filter Bar */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)', padding: '12px 20px',
              display: 'flex', gap: '16px', flexWrap: 'wrap',
            }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Agent</label>
                <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} style={{
                  padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)',
                  background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '12px',
                }}>
                  <option value="all">All Agents</option>
                  {Array.from(new Set(issues.map((i: any) => i.agent))).map((agent: any) => (
                    <option key={agent} value={agent}>{agent}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Severity</label>
                <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={{
                  padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)',
                  background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '12px',
                }}>
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                  <option value="suggestion">Suggestion</option>
                </select>
              </div>
            </div>

            {/* List */}
            {filteredIssues.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '64px 24px', background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)',
              }}>
                <CheckCircle2 size={36} style={{ color: 'var(--color-success)', marginBottom: '12px', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>No Issues Found</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedFileFilter 
                    ? 'No issues match your filters for the selected file.'
                    : 'Your code is clean! No issues detected by active AI agents.'
                  }
                </p>
              </div>
            ) : (
              filteredIssues.map((issue: any, i: number) => (
                <IssueCard key={issue.id || i} issue={issue} index={i} />
              ))
            )}
          </div>
        </div>
      )}

      {/* === TAB: CODE DIFF === */}
      {activeTab === 'code' && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)', padding: '24px',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>PR Code Changes Diff</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Below is the full unified diff format mapped from GitHub App payload.
          </p>
          <pre className="code-block" style={{
            padding: '20px', fontSize: '12px', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)',
            maxHeight: '600px', overflow: 'auto',
          }}>
            Full code diff is not currently stored in the database post-scan. 
            (Diffs are streamed directly to the AI and discarded to save storage space.)
          </pre>
        </div>
      )}

      {/* === TAB: AGENTS === */}
      {activeTab === 'agents' && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px',
        }}>
          {Array.from(new Set(issues.map((i: any) => i.agent))).map((agentName: any, i) => {
            const Icon = agentIconMap[agentName] || Shield;
            const agentIssues = issues.filter((iss: any) => iss.agent === agentName);
            return (
              <div key={i} className="animate-fade-up" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)', padding: '24px',
                transition: 'all var(--transition-normal)',
                animationDelay: `${i * 0.08}s`, animationFillMode: 'backwards',
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: 'var(--radius-lg)',
                    background: `rgba(var(--primary-500-rgb), 0.1)`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={22} style={{ color: 'var(--primary-500)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{agentName || 'Agent'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#10b981' }}>
                      <CheckCircle2 size={12} /> Complete
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-500)' }}>{agentIssues.length}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>FINDINGS</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{
                  height: '4px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)',
                  overflow: 'hidden', marginBottom: '16px',
                }}>
                  <div style={{
                    height: '100%', width: '100%', background: 'var(--primary-500)',
                    borderRadius: 'var(--radius-full)',
                  }} />
                </div>

                {/* Issues by this agent */}
                {agentIssues.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {agentIssues.slice(0, 4).map((issue: any, j: number) => (
                      <div key={j} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-secondary)', fontSize: '12px',
                      }}>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {issue.title}
                        </span>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>{issue.confidence}%</span>
                      </div>
                    ))}
                    {agentIssues.length > 4 && (
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'right', marginTop: '2px' }}>
                        +{agentIssues.length - 4} more findings
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
