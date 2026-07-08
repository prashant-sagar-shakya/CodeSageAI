'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Loader2, TerminalSquare, Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { createChatSession, fetchChatSessions, fetchChatMessages, sendChatMessage, deleteChatSession } from '@/lib/api';

export default function SageAgentPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      loadSessions(parsedUser.id);
    }
  }, []);

  const loadSessions = async (userId: number) => {
    try {
      const data = await fetchChatSessions(userId);
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        handleSelectSession(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewChat = async () => {
    if (!user) return;
    try {
      const newSession = await createChatSession(user.id);
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([
        { role: 'assistant', content: "Hello! I am **Sage**, your AI Assistant for CodeSageAI. How can I help you today?" }
      ]);
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectSession = async (sessionId: number) => {
    setCurrentSessionId(sessionId);
    if (window.innerWidth < 768) setSidebarOpen(false);
    try {
      const msgs = await fetchChatMessages(sessionId);
      if (msgs.length === 0) {
        setMessages([{ role: 'assistant', content: "Hello! I am **Sage**, your AI Assistant for CodeSageAI. How can I help you today?" }]);
      } else {
        setMessages(msgs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || !user || isLoading) return;
    
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
       const newSession = await createChatSession(user.id);
       setSessions(prev => [newSession, ...prev]);
       activeSessionId = newSession.id;
       setCurrentSessionId(activeSessionId);
    }
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    
    try {
      const aiResponse = await sendChatMessage(activeSessionId!, userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse.content }]);
      
      const data = await fetchChatSessions(user.id);
      setSessions(data);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "**Error:** I'm having trouble connecting to the server. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    const segments = text.split(/(```[\s\S]*?```)/g);
    
    return segments.map((segment, index) => {
      if (segment.startsWith('```') && segment.endsWith('```')) {
        const content = segment.replace(/```[a-z]*\n?/i, '').replace(/```$/, '');
        return (
          <div key={index} className="code-block animate-fade-in" style={{ padding: '16px', margin: '12px 0' }}>
            <pre style={{ margin: 0, color: 'var(--text-primary)' }}>{content}</pre>
          </div>
        );
      }
      
      let formattedText = segment
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary); font-weight: 700;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="color: var(--text-primary);">$1</em>')
        .replace(/`([^`]+)`/g, '<code style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; color: var(--primary-500); border: 1px solid var(--border-primary);">$1</code>')
        .replace(/\n/g, '<br/>');
        
      return <span key={index} dangerouslySetInnerHTML={{ __html: formattedText }} style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }} />;
    });
  };

  return (
    <div style={{ 
      display: 'flex', height: 'calc(100vh - 120px)',
      background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden', position: 'relative'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '0px',
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: sidebarOpen ? '1px solid var(--border-primary)' : 'none',
        transition: 'width var(--transition-normal)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 10
      }}>
        <div style={{ padding: '20px' }}>
          <button 
            onClick={handleNewChat}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)', display: 'flex', alignItems: 'center',
              gap: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
              boxShadow: 'var(--shadow-sm)', transition: 'all var(--transition-fast)'
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = 'var(--primary-400)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <Plus size={18} style={{ color: 'var(--primary-500)' }} /> New Chat
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
            Chat History
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                style={{
                  padding: '12px', borderRadius: 'var(--radius-md)',
                  background: currentSessionId === session.id ? 'var(--bg-primary)' : 'transparent',
                  color: currentSessionId === session.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', transition: 'all var(--transition-fast)', fontSize: '14px',
                  border: currentSessionId === session.id ? '1px solid var(--border-primary)' : '1px solid transparent',
                  boxShadow: currentSessionId === session.id ? 'var(--shadow-sm)' : 'none',
                  fontWeight: currentSessionId === session.id ? 600 : 500
                }}
                onMouseOver={e => {
                  if (currentSessionId !== session.id) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseOut={e => {
                  if (currentSessionId !== session.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <MessageSquare size={16} style={{ flexShrink: 0, color: currentSessionId === session.id ? 'var(--primary-500)' : 'inherit' }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {session.title || "New Chat"}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-tertiary)',
                    cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
                    borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)'
                  }}
                  onMouseOver={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                  onMouseOut={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border-secondary)', borderRadius: 'var(--radius-md)' }}>
                No past chats
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-primary)' }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)', zIndex: 5, position: 'sticky', top: 0
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent', border: 'none', 
              borderRadius: 'var(--radius-sm)', padding: '8px', cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
              transition: 'all var(--transition-fast)'
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
          
          <div style={{
            width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
          }}>
            <Bot size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Sage
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Your personal CodeSageAI Assistant
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '32px 24px',
          display: 'flex', flexDirection: 'column', gap: '32px'
        }}>
          {!currentSessionId && messages.length === 0 ? (
            <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: 'var(--radius-2xl)',
                background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '24px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
              }}>
                <Bot size={40} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>How can I help you today?</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Select a chat from the sidebar or type a message below.</p>
            </div>
          ) : (
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {messages.map((msg, i) => (
                <div key={i} className="animate-fade-up" style={{
                  display: 'flex', gap: '16px',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                    background: msg.role === 'user' ? 'var(--bg-tertiary)' : 'var(--gradient-card)',
                    color: msg.role === 'user' ? 'var(--text-secondary)' : 'var(--primary-600)',
                    border: msg.role === 'assistant' ? '1px solid var(--border-primary)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: msg.role === 'assistant' ? 'var(--shadow-sm)' : 'none',
                    overflow: 'hidden',
                    marginTop: '4px'
                  }}>
                    {msg.role === 'user' ? (
                      user?.avatar_url ? <img src={user.avatar_url} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} />
                    ) : <TerminalSquare size={20} />}
                  </div>
                  
                  <div style={{
                    maxWidth: '85%', padding: '10px 16px',
                    borderRadius: 'var(--radius-xl)',
                    background: msg.role === 'user' ? 'var(--bg-tertiary)' : 'transparent',
                    border: msg.role === 'user' ? '1px solid var(--border-primary)' : 'none',
                    color: 'var(--text-primary)',
                    fontSize: '15px'
                  }}>
                    {msg.role === 'user' ? (
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{msg.content}</div>
                    ) : (
                      <div style={{ color: 'inherit' }}>{renderMarkdown(msg.content)}</div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="animate-fade-up" style={{ display: 'flex', gap: '20px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                    background: 'var(--gradient-card)', color: 'var(--primary-600)',
                    border: '1px solid var(--border-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <TerminalSquare size={20} />
                  </div>
                  <div style={{
                    padding: '16px 20px', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px'
                  }}>
                    <Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite', color: 'var(--primary-500)' }} />
                    <span className="text-shimmer">
                      Sage is thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          padding: '24px', background: 'var(--bg-primary)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute', top: '-60px', left: 0, right: 0, height: '60px',
            background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            maxWidth: '800px', margin: '0 auto'
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={user ? "Message Sage..." : "Please log in first"}
              disabled={!user || isLoading}
              style={{
                width: '100%', padding: '16px 64px 16px 24px',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-secondary)',
                background: 'var(--bg-card)', color: 'var(--text-primary)',
                fontSize: '15px', outline: 'none', resize: 'none', minHeight: '60px',
                maxHeight: '200px', overflowY: 'auto',
                fontFamily: 'var(--font-sans)', boxShadow: 'var(--shadow-lg)',
                transition: 'all var(--transition-normal)'
              }}
              rows={1}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--primary-500)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !user || isLoading}
              style={{
                position: 'absolute', right: '12px', bottom: '12px',
                width: '40px', height: '40px', borderRadius: 'var(--radius-lg)',
                background: input.trim() && !isLoading ? 'var(--primary-500)' : 'var(--bg-tertiary)',
                color: input.trim() && !isLoading ? 'white' : 'var(--text-tertiary)',
                border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all var(--transition-fast)',
                boxShadow: input.trim() && !isLoading ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
              }}
              onMouseOver={e => {
                if (input.trim() && !isLoading) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                if (input.trim() && !isLoading) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Send size={18} />
            </button>
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Sage may produce inaccurate information about people, places, or facts.
          </div>
        </div>
      </div>
    </div>
  );
}
