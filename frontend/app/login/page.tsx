'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Github, Sparkles, Lock, ArrowRight, Shield, Eye } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/theme-toggle';

function LoginContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [hovering, setHovering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If user is already logged in and we are not processing an auth callback
    if (!code && typeof window !== 'undefined' && localStorage.getItem('user')) {
      window.location.href = '/dashboard';
    }
  }, [code]);

  useEffect(() => {
    if (!code) return;

    const authenticate = async () => {
      setLoading(true);
      try {
        const { exchangeOAuthCode } = await import('@/lib/api');
        const data = await exchangeOAuthCode(code);
        
        // Save user to localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('github_token', data.access_token);
        
        window.location.href = '/dashboard';
      } catch (err: any) {
        console.error('OAuth exchange failed:', err);
        setError(err.message || 'GitHub login authentication failed. Please try again.');
        setLoading(false);
      }
    };

    authenticate();
  }, [code]);

  const handleLogin = () => {
    setLoading(true);
    setError('');
    // Use the environment variable if available, fallback to the known ID for dev
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Iv23linu5FGQGo8gq0uO';
    
    // 1. Generate a random state string to prevent CSRF and help GitHub maintain session
    const state = Math.random().toString(36).substring(7);
    
    // 2. Hardcode the redirect URI to EXACTLY match your GitHub App settings
    const redirectUri = 'http://localhost:3000/login';
    
    // 3. Construct the URL with client_id, redirect_uri, and state
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  };

  return (
    <div className="glass-card animate-scale-in" style={{
      padding: '48px', maxWidth: '440px', width: '100%', textAlign: 'center',
      position: 'relative', zIndex: 1,
    }}>
      {/* Logo */}
      <div style={{
        width: '64px', height: '64px', borderRadius: 'var(--radius-lg)',
        background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-glow)',
      }}>
        <Sparkles size={32} color="white" />
      </div>

      <h1 style={{
        fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em',
      }}>
        Welcome to <span className="gradient-text">CodeSageAI</span>
      </h1>
      <p style={{
        fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '36px', lineHeight: 1.6,
      }}>
        Connect your GitHub account to start reviewing code with AI-powered intelligence.
      </p>

      {error && (
        <div style={{
          padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444',
          fontSize: '13px', marginBottom: '20px', textAlign: 'left',
        }}>
          {error}
        </div>
      )}

      {/* GitHub Login Button */}
      <button
        onClick={handleLogin}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        disabled={loading}
        style={{
          width: '100%', padding: '14px 24px', borderRadius: 'var(--radius-lg)',
          background: 'var(--gradient-primary)',
          opacity: loading ? 0.8 : 1,
          color: 'white', fontSize: '16px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          border: 'none', cursor: loading ? 'wait' : 'pointer',
          transition: 'all var(--transition-fast)',
          transform: hovering && !loading ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: hovering && !loading ? 'var(--shadow-glow)' : 'var(--shadow-md)',
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white', borderRadius: '50%',
              animation: 'spin-slow 0.6s linear infinite',
            }} />
            {code ? 'Authenticating account...' : 'Redirecting to GitHub...'}
          </>
        ) : (
          <>
            <Github size={20} />
            Continue with GitHub
            <ArrowRight size={18} />
          </>
        )}
      </button>

      {/* Divider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        margin: '28px 0', color: 'var(--text-tertiary)',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-primary)' }} />
        <span style={{ fontSize: '12px', fontWeight: 500 }}>TRUSTED & SECURE</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-primary)' }} />
      </div>

      {/* Trust badges */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap',
      }}>
        {[
          { icon: Lock, label: 'End-to-End Encrypted' },
          { icon: Shield, label: 'SOC2 Compliant' },
          { icon: Eye, label: 'No Code Storage' },
        ].map((badge, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500,
          }}>
            <badge.icon size={14} style={{ color: 'var(--color-success)' }} />
            {badge.label}
          </div>
        ))}
      </div>

      {/* Permissions info */}
      <div style={{
        marginTop: '28px', padding: '16px', borderRadius: 'var(--radius-md)',
        background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
        textAlign: 'left',
      }}>
        <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
          GitHub Permissions Required:
        </p>
        <ul style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 2, listStyle: 'none', padding: 0 }}>
          {['Read access to repositories & pull requests', 'Read access to organization membership', 'No write access needed — we never modify your code'].map((p, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '4px', height: '4px', borderRadius: '50%',
                background: i === 2 ? 'var(--color-success)' : 'var(--primary-500)',
                flexShrink: 0,
              }} />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', background: 'var(--gradient-hero)',
      padding: '24px',
    }}>
      {/* Background effects */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {/* Theme toggle */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 50 }}>
        <ThemeToggle />
      </div>

      {/* Back to home */}
      <Link href="/" style={{
        position: 'fixed', top: '20px', left: '20px', zIndex: 50,
        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
        color: 'var(--text-secondary)', fontWeight: 500,
      }}>
        <Sparkles size={18} style={{ color: 'var(--primary-500)' }} />
        <span className="gradient-text" style={{ fontWeight: 800 }}>CodeSage</span>AI
      </Link>

      <Suspense fallback={
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading authentication page...</div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
