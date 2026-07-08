'use client';

import { useState } from 'react';
import {
  User, Key, Bell, Shield, Palette, Github, Save,
  CheckCircle2, Eye, EyeOff, Moon, Sun, Monitor
} from 'lucide-react';
import { useTheme } from '@/components/layout/theme-provider';
import { mockUser } from '@/lib/mock-data';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'api-keys', label: 'API Keys', icon: Key },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'github', label: 'GitHub Integration', icon: Github },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Settings</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Manage your account, API keys, and preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
        {/* Sidebar */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)', padding: '12px', height: 'fit-content',
        }}>
          {sections.map(section => (
            <button key={section.key} onClick={() => setActiveSection(section.key)} style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              border: 'none', textAlign: 'left', cursor: 'pointer',
              background: activeSection === section.key ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: activeSection === section.key ? 'var(--primary-500)' : 'var(--text-secondary)',
              fontSize: '13px', fontWeight: 600, transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { if (activeSection !== section.key) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={e => { if (activeSection !== section.key) e.currentTarget.style.background = 'transparent'; }}
            >
              <section.icon size={16} /> {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)', padding: '28px',
        }}>
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Profile Settings</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: 'var(--radius-full)',
                  background: 'var(--gradient-primary)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '22px', fontWeight: 800,
                }}>PK</div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{mockUser.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>@{mockUser.githubUsername}</div>
                </div>
              </div>

              {[
                { label: 'Full Name', value: mockUser.name, type: 'text' },
                { label: 'Email', value: mockUser.email, type: 'email' },
                { label: 'GitHub Username', value: mockUser.githubUsername, type: 'text' },
              ].map((field, i) => (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block', fontSize: '12px', fontWeight: 600,
                    color: 'var(--text-tertiary)', marginBottom: '6px',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{field.label}</label>
                  <input type={field.type} defaultValue={field.value} style={{
                    width: '100%', maxWidth: '400px', padding: '10px 14px',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)', color: 'var(--text-primary)',
                    fontSize: '13px', fontFamily: 'var(--font-sans)', outline: 'none',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
                  />
                </div>
              ))}

              <button onClick={handleSave} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px',
                borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)',
                color: 'white', fontSize: '13px', fontWeight: 700, border: 'none',
                cursor: 'pointer', transition: 'all var(--transition-fast)', marginTop: '8px',
              }}>
                {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          )}

          {/* API Keys Section */}
          {activeSection === 'api-keys' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>API Keys</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Configure your AI provider API keys for code analysis.
              </p>

              {[
                { label: 'OpenAI API Key', placeholder: 'sk-...', hint: 'Used for GPT-4 based analysis' },
                { label: 'Google Gemini API Key', placeholder: 'AIzaSy...', hint: 'Used for Gemini Pro analysis' },
                { label: 'GitHub Personal Access Token', placeholder: 'ghp_...', hint: 'Required for repository access' },
              ].map((key, i) => (
                <div key={i} style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block', fontSize: '12px', fontWeight: 600,
                    color: 'var(--text-tertiary)', marginBottom: '6px',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{key.label}</label>
                  <div style={{ position: 'relative', maxWidth: '500px' }}>
                    <input type={showApiKey ? 'text' : 'password'} placeholder={key.placeholder}
                      style={{
                        width: '100%', padding: '10px 40px 10px 14px', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-primary)', background: 'var(--bg-input)',
                        color: 'var(--text-primary)', fontSize: '13px',
                        fontFamily: 'var(--font-mono)', outline: 'none',
                      }}
                    />
                    <button onClick={() => setShowApiKey(!showApiKey)} style={{
                      position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-tertiary)',
                      cursor: 'pointer', padding: '4px',
                    }}>
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{key.hint}</p>
                </div>
              ))}

              <button onClick={handleSave} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px',
                borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)',
                color: 'white', fontSize: '13px', fontWeight: 700, border: 'none',
                cursor: 'pointer', marginTop: '8px',
              }}>
                {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Keys</>}
              </button>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
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
          )}

          {/* Other sections - placeholder */}
          {(activeSection === 'notifications' || activeSection === 'security' || activeSection === 'github') && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                {sections.find(s => s.key === activeSection)?.label}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                This section will be available when backend integration is complete in Phase 2.
              </p>
              <div style={{
                marginTop: '24px', padding: '32px', borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-secondary)', border: '1px dashed var(--border-primary)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.3 }}>🚧</div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-tertiary)' }}>Coming in Phase 2</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
