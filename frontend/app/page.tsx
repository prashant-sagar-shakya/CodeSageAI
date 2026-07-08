'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/components/layout/theme-provider';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import Link from 'next/link';
import {
  Github, ArrowRight, Star, Shield, Zap, Bug, Code2, FileText, TestTube2, RefreshCw,
  FolderSearch, ChevronRight, CheckCircle2, Play, Sparkles, GitBranch, GitPullRequest,
  BarChart3, FileBarChart, Download, Cpu, Users, TrendingUp, Menu, X
} from 'lucide-react';
import { AGENT_CONFIGS } from '@/lib/constants';

/* ============================================================
   Landing Page — CodeSageAI
   Premium, animated, glassmorphism design
   ============================================================ */

// ---- Icon map for dynamic rendering ----
const iconMap: Record<string, React.ElementType> = {
  FolderSearch, Code2, Bug, Shield, Zap, FileText, TestTube2, RefreshCw,
};

// ---- Animated Counter ----
function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ---- Floating Code Particle ----
function CodeParticle({ delay, x, y, symbol, duration }: { delay: number; x: string; y: string; symbol: string; duration: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: 'var(--primary-400)',
        opacity: 0.15,
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {symbol}
    </div>
  );
}

// ---- Workflow Step ----
function WorkflowStep({ icon: Icon, title, step, isLast }: { icon: React.ElementType; title: string; step: number; isLast?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
      <div className="animate-fade-up" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        animationDelay: `${step * 0.15}s`, animationFillMode: 'backwards',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--gradient-primary)', color: 'white', boxShadow: 'var(--shadow-glow)',
        }}>
          <Icon size={24} />
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '80px' }}>{title}</span>
      </div>
      {!isLast && (
        <div style={{ display: 'flex', alignItems: 'center', margin: '0 4px', paddingBottom: '20px' }}>
          <div style={{ width: '40px', height: '2px', background: 'var(--gradient-primary)', borderRadius: '2px' }} />
          <ChevronRight size={16} style={{ color: 'var(--primary-500)', margin: '0 -4px' }} />
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [particles, setParticles] = useState<{ delay: number; x: string; y: string; symbol: string; duration: number }[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const symbols = ['{ }', '< />', 'fn()', '[ ]', '=> ', '$ _', ':::', '&&', '||', '!=', '===', 'if()', '++', '0x', '#!'];
    const generated = Array.from({ length: 20 }, (_, i) => ({
      delay: i * 0.5,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      duration: 6 + Math.random() * 4,
    }));
    setParticles(generated);
  }, []);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* ===== NAVBAR ===== */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px', height: '72px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'var(--glass-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-primary)' : '1px solid transparent',
        transition: 'all var(--transition-normal)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '16px',
          }}>
            <Sparkles size={20} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span className="gradient-text">CodeSage</span>
            <span style={{ color: 'var(--text-primary)' }}>AI</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="no-print">
          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            {['Features', 'Agents', 'Workflow'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{
                fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)',
                transition: 'color var(--transition-fast)', cursor: 'pointer',
              }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                 onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                {item}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle />
            <Link href="/login" style={{
              padding: '8px 20px', borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)', color: 'white', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all var(--transition-fast)', boxShadow: 'var(--shadow-md)',
            }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}>
              <Github size={16} /> Get Started
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section style={{
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '120px 24px 80px', overflow: 'hidden',
        background: 'var(--gradient-hero)',
      }}>
        {/* Background orbs */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />

        {/* Floating code particles */}
        {particles.map((p, i) => <CodeParticle key={i} {...p} />)}

        <div style={{ maxWidth: '900px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div className="animate-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
            fontSize: '13px', fontWeight: 600, color: 'var(--primary-400)', marginBottom: '24px',
          }}>
            <Sparkles size={14} /> AI-Powered Multi-Agent Code Review Platform
          </div>

          {/* Main Heading */}
          <h1 className="animate-fade-up stagger-1" style={{
            fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1,
            letterSpacing: '-0.03em', marginBottom: '24px',
          }}>
            Review Code Like a{' '}
            <span className="gradient-text">Senior Engineer</span>
            <br />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.7em' }}>
              Powered by 8 AI Agents
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up stagger-2" style={{
            fontSize: '18px', lineHeight: 1.7, color: 'var(--text-secondary)',
            maxWidth: '650px', margin: '0 auto 40px',
          }}>
            CodeSageAI analyzes your GitHub Pull Requests with 8 specialized AI agents — detecting bugs,
            security vulnerabilities, performance issues, and generating human-like review comments
            with fix suggestions.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up stagger-3" style={{
            display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap',
          }}>
            <Link href="/login" style={{
              padding: '14px 32px', borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-primary)', color: 'white', fontSize: '16px',
              fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: 'var(--shadow-glow)', transition: 'all var(--transition-fast)',
              cursor: 'pointer',
            }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}>
              <Github size={20} /> Connect GitHub — Free
              <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" style={{
              padding: '14px 32px', borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '10px',
              transition: 'all var(--transition-fast)', cursor: 'pointer',
            }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
               onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <Play size={18} /> Live Demo
            </Link>
          </div>

          {/* Stats row */}
          <div className="animate-fade-up stagger-4" style={{
            display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '56px',
            flexWrap: 'wrap',
          }}>
            {[
              { value: 10000, suffix: '+', label: 'Reviews Completed' },
              { value: 50000, suffix: '+', label: 'Bugs Detected' },
              { value: 99, suffix: '.2%', label: 'Accuracy Rate' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>
                  <span className="gradient-text">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" style={{ padding: '100px 24px', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 className="animate-fade-up" style={{
              fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}>
              Everything You Need for{' '}
              <span className="gradient-text">Perfect Code</span>
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
              Our multi-agent AI system covers every aspect of code quality, security, and best practices.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {[
              { icon: Shield, title: 'Security Analysis', desc: 'OWASP Top 10 checks: SQL Injection, XSS, CSRF, hardcoded secrets, JWT vulnerabilities, and more.', color: '#f59e0b' },
              { icon: Bug, title: 'Bug Detection', desc: 'Catch null pointers, memory leaks, race conditions, infinite loops, and async/promise mistakes.', color: '#ef4444' },
              { icon: Zap, title: 'Performance Optimization', desc: 'Identify N+1 queries, O(n²) algorithms, memory bloat, unnecessary API calls, and slow database queries.', color: '#10b981' },
              { icon: Code2, title: 'Code Quality', desc: 'Enforce SOLID principles, naming conventions, reduce complexity, and eliminate dead/duplicate code.', color: '#8b5cf6' },
              { icon: TestTube2, title: 'Test Generation', desc: 'Auto-generate unit tests, integration tests, edge cases, negative tests, and mock strategies.', color: '#ec4899' },
              { icon: FileText, title: 'Smart Documentation', desc: 'Generate README improvements, JSDoc comments, API docs, and architecture summaries.', color: '#06b6d4' },
              { icon: RefreshCw, title: 'Refactoring Suggestions', desc: 'Design pattern recommendations, method extraction, folder restructuring, and clean architecture.', color: '#f97316' },
              { icon: BarChart3, title: 'Comprehensive Reports', desc: 'Export detailed PDF, Markdown, or HTML reports with scores, trends, and actionable insights.', color: '#6366f1' },
              { icon: GitPullRequest, title: 'GitHub-Style Reviews', desc: 'Inline PR comments with line-specific feedback, severity levels, confidence scores, and fix suggestions.', color: '#10b981' },
            ].map((feature, i) => (
              <div key={i} className="glass-card animate-fade-up" style={{
                padding: '28px', cursor: 'default',
                animationDelay: `${i * 0.08}s`, animationFillMode: 'backwards',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                  background: `${feature.color}15`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: '16px',
                }}>
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>{feature.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI AGENTS SECTION ===== */}
      <section id="agents" style={{
        padding: '100px 24px', position: 'relative',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}>
              <span className="gradient-text">8 Specialized</span> AI Agents
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
              Each agent is an expert in its domain, working in parallel to deliver a comprehensive code review in seconds.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px',
          }}>
            {AGENT_CONFIGS.map((agent, i) => {
              const Icon = iconMap[agent.icon] || Code2;
              return (
                <div key={i} className="gradient-border animate-fade-up" style={{
                  padding: '24px', cursor: 'default', transition: 'all var(--transition-normal)',
                  animationDelay: `${i * 0.1}s`, animationFillMode: 'backwards',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${agent.color}25`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                      background: `${agent.color}20`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={20} style={{ color: agent.color }} />
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{agent.name}</h3>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {agent.description}
                  </p>
                  <div style={{
                    marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', fontWeight: 600, color: agent.color,
                  }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%', background: agent.color,
                      animation: 'pulse-ring 2s infinite',
                    }} />
                    Ready to Analyze
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW SECTION ===== */}
      <section id="workflow" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}>
            Simple{' '}<span className="gradient-text">3-Minute</span> Workflow
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 56px', lineHeight: 1.7 }}>
            Connect your GitHub, select a PR, and get a comprehensive AI review in minutes.
          </p>

          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
            flexWrap: 'wrap', gap: '8px',
          }}>
            <WorkflowStep icon={Github} title="GitHub Login" step={0} />
            <WorkflowStep icon={GitBranch} title="Select Repo" step={1} />
            <WorkflowStep icon={GitPullRequest} title="Choose PR" step={2} />
            <WorkflowStep icon={Cpu} title="AI Analyzes" step={3} />
            <WorkflowStep icon={BarChart3} title="View Report" step={4} />
            <WorkflowStep icon={Download} title="Export" step={5} isLast />
          </div>
        </div>
      </section>

      {/* ===== LIVE PREVIEW SECTION ===== */}
      <section style={{
        padding: '80px 24px', background: 'var(--bg-secondary)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: '12px' }}>
              Review Preview
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>See how CodeSageAI reviews your code</p>
          </div>

          {/* Mock PR Comment */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid var(--border-primary)',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
                background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white',
              }}>
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>CodeSageAI Bot</div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>reviewed 2 minutes ago</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span className="badge badge-critical">🔴 Critical</span>
              </div>
            </div>

            {/* Code block */}
            <div style={{ padding: '0' }}>
              <div className="diff-line diff-line-context">
                <span className="diff-line-number">40</span>
                {'  const users = await db.query('}
              </div>
              <div className="diff-line diff-line-remove">
                <span className="diff-line-number">41</span>
                {'−   `SELECT * FROM users WHERE email = \'${email}\'`'}
              </div>
              <div className="diff-line diff-line-add">
                <span className="diff-line-number">41</span>
                {'+   `SELECT * FROM users WHERE email = $1`, [email]'}
              </div>
              <div className="diff-line diff-line-context">
                <span className="diff-line-number">42</span>
                {'  );'}
              </div>
            </div>

            {/* Comment */}
            <div style={{
              padding: '20px 24px', borderTop: '1px solid var(--border-primary)',
              background: 'rgba(239, 68, 68, 0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Shield size={16} style={{ color: '#ef4444' }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444' }}>SQL Injection Vulnerability</span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '8px' }}>
                  Confidence: 98%
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '12px' }}>
                String interpolation in SQL queries allows attackers to inject malicious SQL commands.
                Use parameterized queries to prevent SQL injection attacks.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px',
                  fontWeight: 600, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-500)',
                }}>
                  OWASP A03:2021
                </span>
                <span style={{
                  padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px',
                  fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                }}>
                  Security Agent
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TARGET USERS SECTION ===== */}
      <section id="pricing" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: '16px',
            }}>
              Built for{' '}<span className="gradient-text">Every Developer</span>
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px',
          }}>
            {[
              { icon: Code2, title: 'Software Engineers', desc: 'Automated PR reviews with actionable insights' },
              { icon: GitBranch, title: 'Open Source Contributors', desc: 'Maintain code quality across contributions' },
              { icon: Users, title: 'Team Leads', desc: 'Track code health and enforce standards' },
              { icon: Zap, title: 'Startups', desc: 'Ship faster with AI-assisted reviews' },
              { icon: Star, title: 'Students', desc: 'Learn best practices from AI feedback' },
              { icon: CheckCircle2, title: 'Interview Prep', desc: 'Practice writing production-quality code' },
            ].map((user, i) => (
              <div key={i} className="glass-card animate-fade-up" style={{
                padding: '24px', textAlign: 'center',
                animationDelay: `${i * 0.1}s`, animationFillMode: 'backwards',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: 'var(--radius-full)',
                  background: 'var(--gradient-primary)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', color: 'white',
                }}>
                  <user.icon size={22} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{user.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{user.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section style={{
        padding: '100px 24px', position: 'relative', overflow: 'hidden',
        background: 'var(--bg-secondary)',
      }}>
        <div className="bg-orb bg-orb-1" style={{ opacity: 0.15 }} />
        <div className="bg-orb bg-orb-2" style={{ opacity: 0.15 }} />
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, marginBottom: '20px',
            letterSpacing: '-0.02em',
          }}>
            Ready to Ship{' '}
            <span className="gradient-text">Better Code?</span>
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '36px', lineHeight: 1.7 }}>
            Join thousands of developers who use CodeSageAI to ship cleaner, safer, and faster code.
          </p>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '16px 40px', borderRadius: 'var(--radius-lg)',
            background: 'var(--gradient-primary)', color: 'white', fontSize: '17px',
            fontWeight: 700, boxShadow: 'var(--shadow-glow)',
            transition: 'all var(--transition-fast)', cursor: 'pointer',
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; }}
             onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}>
            Start Free Review <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        padding: '48px 24px 24px', borderTop: '1px solid var(--border-primary)',
        background: 'var(--bg-primary)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
              background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white',
            }}>
              <Sparkles size={14} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700 }}>
              <span className="gradient-text">CodeSage</span>AI
            </span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['GitHub', 'Twitter', 'Discord', 'Docs'].map(link => (
              <a key={link} href="#" style={{
                fontSize: '13px', color: 'var(--text-tertiary)', transition: 'color var(--transition-fast)',
              }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                 onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
                {link}
              </a>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            © 2026 CodeSageAI. Built with ❤️ for developers.
          </p>
        </div>
      </footer>
    </div>
  );
}
