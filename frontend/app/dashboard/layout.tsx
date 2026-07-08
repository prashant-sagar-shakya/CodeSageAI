'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import {
  LayoutDashboard, GitBranch, SearchCode, FileBarChart, History, Settings,
  Sparkles, ChevronLeft, ChevronRight, Bell, Search, LogOut, User,
  Menu, X, CreditCard, Bot
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Repositories', href: '/dashboard/repositories', icon: GitBranch },
  { label: 'Sage Agent', href: '/dashboard/sage', icon: Bot },
  { label: 'Reports', href: '/dashboard/reports', icon: FileBarChart },
  { label: 'History', href: '/dashboard/history', icon: History },
  { label: 'Pricing', href: '/dashboard/pricing', icon: CreditCard },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [searchRepos, setSearchRepos] = useState<any[]>([]);

  // Initialize notifications from localStorage only on client mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('codeSage_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      setNotifications([
        { id: 1, title: 'Welcome to CodeSageAI!', message: 'You\'ve successfully connected your GitHub profile. You can now start analyzing code and triggering reviews. Let us know if you have any questions, we are here to help you get the most out of our AI features!', time: 'Just now', color: 'var(--primary-500)', read: false },
        { id: 2, title: 'Setup Complete', message: 'Track your first repository to begin analysis.', time: '5 minutes ago', color: 'var(--color-success)', read: true }
      ]);
    }
  }, []);

  // Sync notifications changes to localStorage
  useEffect(() => {
    if (notifications.length > 0 || localStorage.getItem('codeSage_notifications')) {
      localStorage.setItem('codeSage_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const loadUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        import('@/lib/api').then(api => {
          api.fetchRepos(user.id).then(setSearchRepos).catch(console.error);
        });
      }
    };
    loadUser();
    window.addEventListener('userUpdated', loadUser);
    return () => window.removeEventListener('userUpdated', loadUser);
  }, []);

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
            flexShrink: 0, overflow: 'hidden',
          }}>
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (currentUser?.name || 'GU').substring(0, 2).toUpperCase()
            )}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.name || 'Guest User'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>@{currentUser?.username || 'user'}</div>
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
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/dashboard/repositories?search=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchFocused(false);
                }
              }}
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
              pointerEvents: 'none',
            }}>
              /
            </kbd>

            {/* Autocomplete Dropdown */}
            {searchFocused && searchQuery.trim().length > 0 && (
              <div className="animate-fade-up" style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xl)',
                maxHeight: '300px', overflowY: 'auto', zIndex: 100, padding: '8px',
                animationDuration: '0.2s'
              }}>
                {(() => {
                  const filtered = searchRepos.filter(r => 
                    r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    r.name?.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  if (filtered.length === 0) {
                    return (
                      <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                        No repositories found matching "{searchQuery}"
                      </div>
                    );
                  }
                  return filtered.map(repo => (
                    <div key={repo.id} 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(repo.name);
                        setSearchFocused(false);
                        router.push(`/dashboard/repositories?search=${encodeURIComponent(repo.name)}`);
                      }}
                      style={{
                        padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px', transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <GitBranch size={16} style={{ color: 'var(--primary-500)', opacity: 0.8 }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{repo.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{repo.full_name}</div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle />

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button style={{
                position: 'relative', width: '40px', height: '40px',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)',
                background: 'var(--bg-card)', color: 'var(--text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all var(--transition-fast)',
              }}
              onClick={() => setNotificationsOpen(true)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.color = 'var(--primary-500)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <div style={{
                    position: 'absolute', top: '6px', right: '6px',
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'var(--color-danger)',
                    border: '2px solid var(--bg-primary)',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }} />
                )}
              </button>

              {/* Slide-out Notifications Panel */}
              <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '420px', background: 'var(--bg-card)',
                borderLeft: '1px solid var(--border-primary)',
                boxShadow: 'var(--shadow-2xl)', zIndex: 100,
                transform: notificationsOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{
                  padding: '20px', borderBottom: '1px solid var(--border-primary)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={18} style={{ color: 'var(--primary-500)' }} />
                      <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Notifications</h3>
                    </div>
                    <button onClick={() => setNotificationsOpen(false)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)', padding: '4px',
                    }}>
                      <X size={18} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleMarkAllRead} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--primary-500)', fontSize: '12px', fontWeight: 600,
                    }}>
                      Mark all read
                    </button>
                    <button onClick={handleClearAll} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-tertiary)', fontSize: '12px', fontWeight: 600,
                    }}>
                      Clear all
                    </button>
                  </div>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '20px' }}>
                      No notifications right now.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} 
                        onClick={() => {
                          setSelectedNotification(n);
                          if (!n.read) {
                            setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item));
                          }
                        }}
                        style={{
                          padding: '12px', borderRadius: 'var(--radius-md)', background: n.read ? 'transparent' : 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)', borderLeft: `3px solid ${n.color}`,
                          cursor: 'pointer', transition: 'background var(--transition-fast)',
                          opacity: n.read ? 0.7 : 1,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                        onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'var(--bg-secondary)'}
                      >
                        <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{n.title}</h4>
                        <p style={{ 
                          fontSize: '12px', color: 'var(--text-secondary)',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {n.message}
                        </p>
                        {n.message.length > 80 && (
                          <span style={{ fontSize: '11px', color: 'var(--primary-500)', fontWeight: 500 }}>...more</span>
                        )}
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '8px', display: 'block' }}>{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Popup Dialog for Selected Notification */}
              {selectedNotification && (
                <div style={{
                  position: 'fixed', inset: 0, zIndex: 200,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div 
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
                    onClick={() => setSelectedNotification(null)}
                  />
                  <div className="glass-card animate-scale-in" style={{
                    position: 'relative', width: '90%', maxWidth: '400px',
                    padding: '24px', borderRadius: 'var(--radius-lg)', zIndex: 201,
                    borderLeft: `4px solid ${selectedNotification.color}`,
                  }}>
                    <button onClick={() => setSelectedNotification(null)} style={{
                      position: 'absolute', top: '16px', right: '16px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)',
                    }}>
                      <X size={18} />
                    </button>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', paddingRight: '24px' }}>
                      {selectedNotification.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                      {selectedNotification.message}
                    </p>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{selectedNotification.time}</span>
                  </div>
                </div>
              )}

              {/* Notification Overlay Backdrop */}
              {notificationsOpen && (
                <div 
                  onClick={() => setNotificationsOpen(false)}
                  style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(2px)', zIndex: 99,
                  }} 
                />
              )}
            </div>

            {/* User menu */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Pricing link badge removed as per request */}

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
                  overflow: 'hidden',
                }}>
                  {currentUser?.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (currentUser?.name || 'GU').substring(0, 2).toUpperCase()
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {(currentUser?.name || 'Guest').split(' ')[0]}
                  </span>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px',
                    color: currentUser?.subscription_tier === 'pro' ? '#8b5cf6' : currentUser?.subscription_tier === 'basic' ? '#3b82f6' : 'var(--text-tertiary)',
                  }}>
                    {currentUser?.subscription_tier || 'Free'}
                  </span>
                </div>
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
                    { icon: User, label: 'Profile', href: '/dashboard/settings/profile' },
                    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
                    { icon: LogOut, label: 'Sign Out', href: '/login' },
                  ].map((item, i) => (
                    <Link key={i} href={item.href} onClick={(e) => {
                      if (item.label === 'Sign Out') {
                        localStorage.removeItem('user');
                        localStorage.removeItem('github_token');
                      }
                      setUserMenuOpen(false);
                    }} style={{
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
      
      {/* Razorpay Checkout Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
