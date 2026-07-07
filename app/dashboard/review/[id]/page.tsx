'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChevronDown, ChevronRight, FileCode2, FolderOpen, Folder, Eye,
  Shield, Bug, Zap, Code2, FileText, TestTube2, RefreshCw, FolderSearch,
  CheckCircle2, AlertTriangle, Info, Lightbulb, Clock, GitPullRequest,
  Copy, Check, ArrowUpRight, Sparkles, ChevronUp, ExternalLink,
  BarChart3, Filter, Layers
} from 'lucide-react';
import {
  mockReport, mockIssues, mockAgents, mockScores, mockFileTree,
  mockFileDiff, mockPullRequests
} from '@/lib/mock-data';
import { getScoreColor, formatDate } from '@/lib/utils';

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
function FileTreeNode({ node, depth = 0 }: { node: typeof mockFileTree[0]; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);

  return (
    <div>
      <div
        onClick={() => node.type === 'directory' && setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 8px', paddingLeft: `${8 + depth * 16}px`,
          fontSize: '12px', cursor: node.type === 'directory' ? 'pointer' : 'default',
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
        <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{node.name}</span>
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
      {node.type === 'directory' && open && node.children?.map((child, i) => (
        <FileTreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

// ---- Issue Card Component ----
function IssueCard({ issue, index }: { issue: typeof mockIssues[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const severityConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
    critical: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: AlertTriangle },
    warning: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: AlertTriangle },
    info: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: Info },
    suggestion: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: Lightbulb },
  };

  const config = severityConfig[issue.severity];
  const SeverityIcon = config.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(issue.codeAfter);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{issue.title}</h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: '10px',
              fontWeight: 600, background: config.bg, color: config.color,
            }}>
              {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {issue.file}:{issue.line}
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
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
            <h5 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              How to Fix
            </h5>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {issue.howToFix}
            </p>
          </div>

          {/* Before / After */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Before */}
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
                  {issue.codeBefore}
                </pre>
              </div>
              {/* After */}
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
                    transition: 'all var(--transition-fast)',
                  }}>
                    {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                  </button>
                </div>
                <pre className="code-block" style={{
                  padding: '12px', fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap',
                  background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)',
                }}>
                  {issue.codeAfter}
                </pre>
              </div>
            </div>
          </div>

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

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [agentFilter, setAgentFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const pr = mockPullRequests[0];
  const report = mockReport;

  const filteredIssues = mockIssues.filter(issue => {
    const matchesAgent = agentFilter === 'all' || issue.agent === agentFilter;
    const matchesSev = severityFilter === 'all' || issue.severity === severityFilter;
    return matchesAgent && matchesSev;
  });

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Eye },
    { key: 'issues', label: `Issues (${mockIssues.length})`, icon: AlertTriangle },
    { key: 'code', label: 'Code Diff', icon: Code2 },
    { key: 'agents', label: 'Agents', icon: Layers },
  ];

  const scoreCategories = [
    { key: 'security', label: 'Security', score: mockScores.security, color: '#f59e0b' },
    { key: 'performance', label: 'Performance', score: mockScores.performance, color: '#10b981' },
    { key: 'readability', label: 'Readability', score: mockScores.readability, color: '#6366f1' },
    { key: 'testing', label: 'Testing', score: mockScores.testing, color: '#ec4899' },
    { key: 'documentation', label: 'Docs', score: mockScores.documentation, color: '#06b6d4' },
    { key: 'maintainability', label: 'Maintain.', score: mockScores.maintainability, color: '#8b5cf6' },
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
              <GitPullRequest size={18} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>#{pr.number}</span>
              <span className="badge badge-open">Open</span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>{pr.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Reviewed in {report.duration}
              </span>
              <span style={{ color: '#10b981' }}>+{pr.additions} additions</span>
              <span style={{ color: '#ef4444' }}>-{pr.deletions} deletions</span>
              <span>{pr.changedFiles} files changed</span>
            </div>
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '12px 20px', background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{
              fontSize: '36px', fontWeight: 900,
              color: getScoreColor(mockScores.overall),
              lineHeight: 1,
            }}>
              {mockScores.overall}
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
              {mockAgents.map((agent, i) => {
                const Icon = agentIconMap[agent.icon] || Code2;
                return (
                  <div key={i} style={{
                    padding: '14px 16px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = agent.color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                      background: `${agent.color}15`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={18} style={{ color: agent.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{agent.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <div style={{
                          flex: 1, height: '3px', borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-tertiary)', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', width: `${agent.progress}%`,
                            background: agent.color, borderRadius: 'var(--radius-full)',
                            transition: 'width 1s ease-out',
                          }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: agent.color }}>
                          {agent.findings} found
                        </span>
                      </div>
                    </div>
                    <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Issues Preview */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)', padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Top Issues</h3>
              <button onClick={() => setActiveTab('issues')} style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
                color: 'var(--primary-500)', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', transition: 'all var(--transition-fast)',
              }}>
                View All <ArrowUpRight size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mockIssues.slice(0, 3).map((issue, i) => (
                <IssueCard key={issue.id} issue={issue} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === TAB: ISSUES === */}
      {activeTab === 'issues' && (
        <div>
          {/* Filters */}
          <div style={{
            display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Filter size={14} style={{ color: 'var(--text-tertiary)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)' }}>Severity:</span>
              {['all', 'critical', 'warning', 'info', 'suggestion'].map(sev => (
                <button key={sev} onClick={() => setSeverityFilter(sev)} style={{
                  padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px',
                  fontWeight: 600, border: '1px solid', cursor: 'pointer',
                  background: severityFilter === sev ? (sev === 'all' ? 'var(--primary-500)' : sev === 'critical' ? '#ef4444' : sev === 'warning' ? '#f59e0b' : sev === 'info' ? '#3b82f6' : '#10b981') : 'var(--bg-card)',
                  color: severityFilter === sev ? 'white' : 'var(--text-secondary)',
                  borderColor: severityFilter === sev ? 'transparent' : 'var(--border-primary)',
                  transition: 'all var(--transition-fast)',
                }}>
                  {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Layers size={14} style={{ color: 'var(--text-tertiary)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)' }}>Agent:</span>
              <select
                value={agentFilter}
                onChange={e => setAgentFilter(e.target.value)}
                style={{
                  padding: '4px 8px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)', background: 'var(--bg-input)',
                  color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <option value="all">All Agents</option>
                {['Security', 'Bug Detection', 'Performance', 'Code Quality', 'Testing', 'Documentation', 'Refactoring'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Issues List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredIssues.map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} index={i} />
            ))}
            {filteredIssues.length === 0 && (
              <div style={{
                padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)',
                background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-primary)',
              }}>
                <CheckCircle2 size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ fontSize: '14px', fontWeight: 600 }}>No issues match your filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === TAB: CODE DIFF === */}
      {activeTab === 'code' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '16px' }}>
          {/* File Tree */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)', padding: '12px', height: 'fit-content',
            position: 'sticky', top: '88px',
          }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', padding: '4px 8px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Changed Files
            </h3>
            {mockFileTree.map((node, i) => (
              <FileTreeNode key={i} node={node} />
            ))}
          </div>

          {/* Diff Viewer */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            {/* File header */}
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid var(--border-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-tertiary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode2 size={14} style={{ color: 'var(--primary-500)' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {mockFileDiff.path}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span style={{ color: '#10b981', fontWeight: 600 }}>+{mockFileDiff.additions}</span>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>-{mockFileDiff.deletions}</span>
              </div>
            </div>

            {/* Diff lines */}
            <div style={{ overflowX: 'auto' }}>
              {mockFileDiff.lines.map((line, i) => (
                <div key={i} className={`diff-line diff-line-${line.type === 'add' ? 'add' : line.type === 'remove' ? 'remove' : 'context'}`}
                  style={{ position: 'relative' }}>
                  <span className="diff-line-number">{line.oldLineNumber || ''}</span>
                  <span className="diff-line-number">{line.newLineNumber || ''}</span>
                  <span style={{ marginRight: '8px', fontWeight: 700, width: '12px', display: 'inline-block' }}>
                    {line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ' '}
                  </span>
                  {line.content}
                  {line.hasIssue && (
                    <span style={{
                      marginLeft: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: '10px',
                      fontWeight: 700, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444',
                    }}>
                      <AlertTriangle size={10} /> Issue
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Inline AI Comment */}
            <div style={{
              margin: '0', padding: '16px 20px',
              borderTop: '1px solid var(--border-primary)',
              background: 'rgba(99, 102, 241, 0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: 'var(--radius-full)',
                  background: 'var(--gradient-primary)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={12} color="white" />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>CodeSageAI</span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>• Security Agent</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Line 4: The Stripe secret key should come from environment variables, not hardcoded.
                This prevents accidental exposure through version control. Use <code style={{
                  padding: '1px 4px', borderRadius: '3px', background: 'var(--bg-tertiary)',
                  fontFamily: 'var(--font-mono)', fontSize: '12px',
                }}>process.env.STRIPE_SECRET_KEY</code> instead.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* === TAB: AGENTS === */}
      {activeTab === 'agents' && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px',
        }}>
          {mockAgents.map((agent, i) => {
            const Icon = agentIconMap[agent.icon] || Code2;
            const agentIssues = mockIssues.filter(iss => iss.agent === agent.name);
            return (
              <div key={i} className="animate-fade-up" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)', padding: '24px',
                transition: 'all var(--transition-normal)',
                animationDelay: `${i * 0.08}s`, animationFillMode: 'backwards',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = agent.color; e.currentTarget.style.boxShadow = `0 4px 20px ${agent.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: 'var(--radius-lg)',
                    background: `${agent.color}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={22} style={{ color: agent.color }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{agent.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#10b981' }}>
                      <CheckCircle2 size={12} /> Complete
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: agent.color }}>{agent.findings}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>FINDINGS</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{
                  height: '4px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)',
                  overflow: 'hidden', marginBottom: '16px',
                }}>
                  <div style={{
                    height: '100%', width: '100%', background: agent.color,
                    borderRadius: 'var(--radius-full)',
                  }} />
                </div>

                {/* Issues by this agent */}
                {agentIssues.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {agentIssues.map((issue, j) => (
                      <div key={j} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-secondary)', fontSize: '12px',
                      }}>
                        <span className={`badge badge-${issue.severity}`} style={{ fontSize: '9px', padding: '0px 5px' }}>
                          {issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟠' : issue.severity === 'info' ? '🟡' : '🟢'}
                        </span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {issue.title}
                        </span>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>{issue.confidence}%</span>
                      </div>
                    ))}
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
