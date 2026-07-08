'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, GitBranch, SearchCode, FileBarChart, History, Settings,
  Sparkles, ChevronLeft, ChevronRight, Bell, Search, LogOut, User,
  Menu, X
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { mockUser } from '@/lib/mock-data';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Repositories', href: '/dashboard/repositories', icon: GitBranch },
  { label: 'Reviews', href: '/dashboard/review/pr-001', icon: SearchCode },
  { label: 'Reports', href: '/dashboard/reports', icon: FileBarChart },
  { label: 'History', href: '/dashboard/history', icon: History },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ===== SIDEBAR ===== */}
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'var(--overlay-bg)',
            zIndex: 40, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      <aside
        className="sidebar"
        style={{
          width: collapsed ? '72px' : '260px',
          height: '100vh', position: 'sticky', top: 0,
          display: 'flex', flexDirection: 'column',
          padding: collapsed ? '16px 12px' : '16px',
          zIndex: 45, overflow: 'hidden',
          transition: 'width var(--transition-normal)',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '4px 8px', marginBottom: '24px', minHeight: '40px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', flexShrink: 0,
          }}>
            <Sparkles size={16} />
          </div>
          {!collapsed && (
            <span style={{ fontSize: '18px', fontWeight: 800, whiteSpace: 'nowrap' }}>
              <span className="gradient-text">CodeSage</span>AI
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '10px' : '10px 16px',
                }}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px',
            fontWeight: 500, transition: 'all var(--transition-fast)',
            marginTop: '8px',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.color = 'var(--primary-500)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> Collapse</>}
        </button>

        {/* User section */}
        <div style={{
          marginTop: '12px', padding: collapsed ? '8px 0' : '12px',
          borderTop: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'center', gap: '10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 700,
            flexShrink: 0,
          }}>
            PK
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {mockUser.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Pro Plan</div>
            </div>
          )}
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{
          height: '64px', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-primary)',
          background: 'var(--bg-primary)',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none', background: 'none', border: 'none',
              color: 'var(--text-primary)', cursor: 'pointer',
            }}
          >
            <Menu size={24} />
          </button>

          {/* Search */}
          <div style={{
            position: 'relative', maxWidth: '400px', width: '100%',
          }}>
            <Search size={16} style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: searchFocused ? 'var(--primary-500)' : 'var(--text-tertiary)',
              transition: 'color var(--transition-fast)',
            }} />
            <input
              type="text"
              placeholder="Search repositories, reviews, issues..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%', padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${searchFocused ? 'var(--primary-500)' : 'var(--border-primary)'}`,
                background: 'var(--bg-input)', color: 'var(--text-primary)',
                fontSize: '13px', outline: 'none',
                fontFamily: 'var(--font-sans)',
                transition: 'all var(--transition-fast)',
              }}
            />
            <kbd style={{
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
              padding: '2px 6px', borderRadius: '4px', fontSize: '11px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
              color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)',
            }}>⌘K</kbd>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle />

            {/* Notifications */}
            <button style={{
              position: 'relative', width: '40px', height: '40px',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)',
              background: 'var(--bg-card)', color: 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.color = 'var(--primary-500)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Bell size={18} />
              <div style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--color-danger)',
                border: '2px solid var(--bg-primary)',
              }} />
            </button>

            {/* User menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '4px 12px 4px 4px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
                  cursor: 'pointer', transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                onMouseLeave={e => { if (!userMenuOpen) e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--gradient-primary)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '11px', fontWeight: 700,
                }}>PK</div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {mockUser.name.split(' ')[0]}
                </span>
              </button>

              {userMenuOpen && (
                <div className="animate-scale-in" style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: '200px', background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xl)',
                  padding: '4px', zIndex: 50,
                }}>
                  {[
                    { icon: User, label: 'Profile', href: '#' },
                    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
                    { icon: LogOut, label: 'Sign Out', href: '/login' },
                  ].map((item, i) => (
                    <Link key={i} href={item.href} onClick={() => setUserMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                      fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <item.icon size={16} /> {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1, padding: '24px', overflow: 'auto',
          background: 'var(--bg-secondary)',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
