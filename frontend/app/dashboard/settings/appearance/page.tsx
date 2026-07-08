'use client';

import { useTheme } from '@/components/layout/theme-provider';
import { Moon, Sun, CheckCircle2 } from 'lucide-react';

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Appearance</h2>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Customize how CodeSageAI looks.
      </p>

      <label style={{
        display: 'block', fontSize: '12px', fontWeight: 600,
        color: 'var(--text-tertiary)', marginBottom: '12px',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>Theme</label>

      <div style={{ display: 'flex', gap: '12px' }}>
        {[
          { value: 'light' as const, icon: Sun, label: 'Light' },
          { value: 'dark' as const, icon: Moon, label: 'Dark' },
        ].map(option => (
          <button key={option.value} onClick={() => setTheme(option.value)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            padding: '20px 32px', borderRadius: 'var(--radius-lg)',
            border: `2px solid ${theme === option.value ? 'var(--primary-500)' : 'var(--border-primary)'}`,
            background: theme === option.value ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
            color: theme === option.value ? 'var(--primary-500)' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all var(--transition-fast)',
            fontSize: '13px', fontWeight: 600,
          }}>
            <option.icon size={24} />
            {option.label}
            {theme === option.value && (
              <CheckCircle2 size={16} style={{ color: 'var(--primary-500)' }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
