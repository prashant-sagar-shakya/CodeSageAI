'use client';

import { usePathname, useRouter } from 'next/navigation';
import { User, Key, Bell, Shield, Palette, Github } from 'lucide-react';
import Link from 'next/link';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const sections = [
    { key: 'profile', label: 'Profile', icon: User, path: '/dashboard/settings/profile' },
    { key: 'notifications', label: 'Notifications', icon: Bell, path: '/dashboard/settings/notifications' },
    { key: 'appearance', label: 'Appearance', icon: Palette, path: '/dashboard/settings/appearance' },
    { key: 'security', label: 'Security', icon: Shield, path: '/dashboard/settings/security' },
    { key: 'github', label: 'GitHub Integration', icon: Github, path: '/dashboard/settings/github' },
  ];
  
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Settings</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Manage your account and preferences.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{
          flex: '0 0 250px',
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)', padding: '12px', height: 'fit-content',
        }}>
          {sections.map(section => {
            const isActive = pathname.includes(section.path);
            return (
              <Link key={section.key} href={section.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  border: 'none', textAlign: 'left', cursor: 'pointer',
                  background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: isActive ? 'var(--primary-500)' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: 600, transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <section.icon size={16} /> {section.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Content */}
        <div style={{
          flex: '1 1 500px',
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)', padding: '28px',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
