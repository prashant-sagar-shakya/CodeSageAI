'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle2, Sparkles } from 'lucide-react';
import { updateProfile } from '@/lib/api';

export default function ProfileSettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', username: '' });
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      setFormData({ name: user.name || '', email: user.email || '', username: user.username || '' });
    }
  }, []);

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      const updatedUser = await updateProfile(currentUser.id, formData);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      window.dispatchEvent(new Event('userUpdated'));
      
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      alert('Failed to save profile changes');
    }
  };

  const profileName = currentUser?.name || 'Guest User';
  const profileUsername = currentUser?.username || 'guest';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Profile Settings</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
            borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)',
            color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600,
            border: '1px solid var(--border-primary)', cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
          >
            Edit Profile
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: 'var(--radius-full)',
          background: 'var(--gradient-primary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '22px', fontWeight: 800,
          overflow: 'hidden',
        }}>
          {currentUser?.avatar_url ? (
            <img src={currentUser.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            profileName.substring(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{profileName}</div>
            <div style={{
              padding: '2px 8px', borderRadius: 'var(--radius-full)',
              fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
              background: currentUser?.subscription_tier === 'pro' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : currentUser?.subscription_tier === 'basic' ? '#3b82f6' : 'var(--bg-tertiary)',
              color: currentUser?.subscription_tier && currentUser.subscription_tier !== 'free' ? 'white' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              {currentUser?.subscription_tier === 'pro' && <Sparkles size={10} />}
              {currentUser?.subscription_tier || 'Free'}
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>@{profileUsername}</div>
        </div>
      </div>

      {[
        { label: 'Full Name', value: formData.name, type: 'text', key: 'name' as keyof typeof formData },
        { label: 'Email', value: formData.email, type: 'email', key: 'email' as keyof typeof formData },
        { label: 'GitHub Username', value: formData.username, type: 'text', key: 'username' as keyof typeof formData },
      ].map((field) => (
        <div key={field.key} style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '12px', fontWeight: 600,
            color: 'var(--text-tertiary)', marginBottom: '6px',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{field.label}</label>
          <input type={field.type} value={field.value} 
          disabled={!isEditing}
          onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
          style={{
            width: '100%', maxWidth: '400px', padding: '10px 14px',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)',
            background: isEditing ? 'var(--bg-input)' : 'var(--bg-tertiary)',
            color: isEditing ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: '13px', fontFamily: 'var(--font-sans)', outline: 'none',
            transition: 'border-color var(--transition-fast)', cursor: isEditing ? 'text' : 'not-allowed',
            opacity: isEditing ? 1 : 0.7,
          }}
          onFocus={e => { if (isEditing) e.currentTarget.style.borderColor = 'var(--primary-500)'; }}
          onBlur={e => { if (isEditing) e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
          />
        </div>
      ))}

      {isEditing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
          <button onClick={handleSave} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px',
            borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)',
            color: 'white', fontSize: '13px', fontWeight: 700, border: 'none',
            cursor: 'pointer', transition: 'all var(--transition-fast)',
          }}>
            {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
          </button>
          <button onClick={() => {
            setIsEditing(false);
            setFormData({ name: currentUser?.name || '', email: currentUser?.email || '', username: currentUser?.username || '' });
          }} style={{
            padding: '10px 24px', borderRadius: 'var(--radius-md)',
            background: 'transparent', color: 'var(--text-secondary)',
            fontSize: '13px', fontWeight: 600, border: '1px solid var(--border-primary)',
            cursor: 'pointer', transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
