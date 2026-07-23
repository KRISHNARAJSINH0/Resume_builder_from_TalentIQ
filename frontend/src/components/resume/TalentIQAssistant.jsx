import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles, X, Send, RotateCcw, ChevronDown,
  Zap, Target, GitBranch, MessageSquare, Star,
  AlertCircle, Lightbulb, User, Check, Palette,
} from 'lucide-react';
import { assistantChat } from '../../api/resumeAPI';
import { useTheme } from '../../context/ThemeContext';
import { UI_THEMES } from '../../utils/themes';

// ─── Quick-action chip definitions ───────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: 'ats',       icon: Target,        label: 'ATS Review',    prompt: `Review my resume for ATS compatibility. What is my current score and how can I improve it?` },
  { id: 'theme',     icon: Palette,       label: 'Change Theme',  prompt: `Show me all available UI themes for this platform so I can pick one.` },
  { id: 'gap',       icon: GitBranch,     label: 'Skill Gap',     prompt: `Analyze my skill gap. What key skills am I missing for my target role?` },
  { id: 'interview', icon: MessageSquare, label: 'Interview Prep', prompt: `Generate 5 interview questions tailored to my resume and profession.` },
  { id: 'career',    icon: Zap,           label: 'Career Tips',   prompt: `Based on my current resume, what are the top career improvement suggestions you recommend?` },
  { id: 'fix',       icon: AlertCircle,   label: 'Fix Issues',    prompt: `Scan my resume for problems: missing fields, weak descriptions, grammar issues. Give me a full report.` },
  { id: 'summary',   icon: Lightbulb,     label: 'Write Summary', prompt: `Write a powerful, ATS-optimized professional summary for my resume.` },
];

// ─── Theme detection: check if AI response is about themes ───────────────────
const THEME_TRIGGER_PATTERNS = [
  /theme/i, /colour/i, /color scheme/i, /appearance/i, /skin/i,
  /dark mode/i, /light mode/i, /visual style/i, /ui style/i,
  /change the look/i, /background/i, /palette/i,
];

function isThemeResponse(userMsg, aiResponse) {
  const combined = (userMsg + ' ' + aiResponse).toLowerCase();
  return THEME_TRIGGER_PATTERNS.some(p => p.test(combined)) &&
    (combined.includes('theme') || combined.includes('colour') || combined.includes('color'));
}

// ─── Markdown-lite renderer ────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, li) => {
    if (/^[•\-\*]\s/.test(line)) {
      const content = line.replace(/^[•\-\*]\s/, '');
      return (
        <div key={li} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
          <span style={{ color: 'var(--v)', flexShrink: 0, marginTop: '1px' }}>•</span>
          <span>{inlineBold(content)}</span>
        </div>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      const content = line.replace(/^\d+\.\s/, '');
      return (
        <div key={li} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
          <span style={{ color: 'var(--t)', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '2px', minWidth: '14px' }}>{num}.</span>
          <span>{inlineBold(content)}</span>
        </div>
      );
    }
    if (/^###\s/.test(line)) return <div key={li} style={{ fontWeight: 700, color: 'var(--text)', marginTop: '10px', marginBottom: '4px', fontSize: '13px' }}>{line.replace(/^###\s/, '')}</div>;
    if (/^##\s/.test(line))  return <div key={li} style={{ fontWeight: 700, color: 'var(--text)', marginTop: '12px', marginBottom: '6px', fontSize: '14px' }}>{line.replace(/^##\s/, '')}</div>;
    if (line.trim() === '')  return <div key={li} style={{ height: '6px' }} />;
    return <div key={li} style={{ marginBottom: '2px' }}>{inlineBold(line)}</div>;
  });
}

function inlineBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: 'var(--text)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2)
      return <code key={i} style={{ background: 'var(--s3)', borderRadius: '3px', padding: '1px 5px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--t)' }}>{part.slice(1, -1)}</code>;
    return part;
  });
}

// ─── Typing Indicator ──────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: 'var(--v)',
          animation: 'bounce 1.2s ease infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Theme Card (rendered inside chat bubble) ──────────────────────────────
function ThemeCard({ themeObj, isActive, onApply }) {
  const [hovered, setHovered] = useState(false);
  const active = isActive || hovered;

  return (
    <button
      onClick={() => onApply(themeObj.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Apply ${themeObj.name} theme`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        background: isActive
          ? 'rgba(123,111,255,0.15)'
          : hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isActive ? 'rgba(123,111,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '10px',
        padding: '10px 12px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.18s ease',
        transform: hovered && !isActive ? 'translateX(3px)' : 'none',
      }}
    >
      {/* Colour swatch strip */}
      <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
        {themeObj.preview.map((colour, i) => (
          <div
            key={i}
            style={{
              width: i === 0 ? '22px' : '10px',
              height: '32px',
              borderRadius: i === 0 ? '6px 0 0 6px' : i === themeObj.preview.length - 1 ? '0 6px 6px 0' : '0',
              background: colour,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>

      {/* Name + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '12px', fontWeight: 700,
          color: isActive ? 'var(--v)' : 'var(--text)',
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          {themeObj.emoji} {themeObj.name}
          {isActive && (
            <span style={{
              fontSize: '9px', fontFamily: 'var(--font-mono)',
              background: 'rgba(123,111,255,0.2)', color: 'var(--v)',
              border: '1px solid rgba(123,111,255,0.3)',
              borderRadius: '3px', padding: '1px 5px',
            }}>
              ACTIVE
            </span>
          )}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px', lineHeight: 1.4 }}>
          {themeObj.description}
        </div>
      </div>

      {/* Apply indicator */}
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isActive ? 'var(--v)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${isActive ? 'var(--v)' : 'rgba(255,255,255,0.1)'}`,
        transition: 'all 0.18s ease',
      }}>
        {isActive
          ? <Check size={12} style={{ color: '#fff' }} />
          : <span style={{ fontSize: '9px', color: 'var(--muted)' }}>→</span>}
      </div>
    </button>
  );
}

// ─── Theme Picker (full panel shown when AI detects theme request) ─────────
function ThemePicker({ currentThemeId, onApply, onClose }) {
  const [justApplied, setJustApplied] = useState(currentThemeId);

  const handleApply = (id) => {
    setJustApplied(id);
    onApply(id);
  };

  return (
    <div style={{
      background: 'rgba(12,12,24,0.98)',
      border: '1px solid rgba(123,111,255,0.25)',
      borderRadius: '14px',
      overflow: 'hidden',
      animation: 'assistantFadeIn 0.3s ease',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--v), var(--t))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Palette size={13} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>UI Theme Selector</div>
            <div style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Changes apply instantly · {Object.keys(UI_THEMES).length} themes available
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', padding: '3px', display: 'flex',
          }}
          title="Dismiss"
        >
          <X size={13} />
        </button>
      </div>

      {/* Theme list */}
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Object.values(UI_THEMES).map(theme => (
          <ThemeCard
            key={theme.id}
            themeObj={theme}
            isActive={justApplied === theme.id}
            onApply={handleApply}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontSize: '9px', color: 'rgba(136,136,165,0.5)',
        fontFamily: 'var(--font-mono)', textAlign: 'center',
      }}>
        Your choice is saved automatically ✓
      </div>
    </div>
  );
}

// ─── Chat Bubble ─────────────────────────────────────────────────────────────
function AssistantBubble({ role, content, showThemePicker, currentThemeId, onApplyTheme, onCloseThemePicker }) {
  const isAI = role === 'assistant';
  return (
    <div style={{
      display: 'flex', gap: '8px',
      flexDirection: isAI ? 'row' : 'row-reverse',
      animation: 'assistantFadeIn 0.25s ease',
    }}>
      {/* Avatar */}
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isAI ? 'linear-gradient(135deg, var(--v), var(--t))' : 'var(--s3)',
        border: `1px solid ${isAI ? 'rgba(123,111,255,0.35)' : 'var(--border)'}`,
        boxShadow: isAI ? '0 0 10px rgba(123,111,255,0.2)' : 'none',
        alignSelf: 'flex-start',
        marginTop: '2px',
      }}>
        {isAI
          ? <Sparkles size={12} style={{ color: '#fff' }} />
          : <User size={12} style={{ color: 'var(--muted)' }} />}
      </div>

      <div style={{ maxWidth: '88%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Text bubble */}
        <div style={{
          background: isAI
            ? 'linear-gradient(135deg, rgba(21,21,42,0.95), rgba(28,28,50,0.95))'
            : 'rgba(123,111,255,0.14)',
          border: `1px solid ${isAI ? 'rgba(123,111,255,0.15)' : 'rgba(123,111,255,0.3)'}`,
          borderRadius: isAI ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
          padding: '10px 13px',
          fontSize: '12.5px',
          lineHeight: '1.65',
          color: isAI ? 'var(--muted)' : 'var(--text)',
          wordBreak: 'break-word',
        }}>
          {isAI ? renderMarkdown(content) : content}
        </div>

        {/* Theme Picker — appended below the AI bubble when detected */}
        {isAI && showThemePicker && (
          <ThemePicker
            currentThemeId={currentThemeId}
            onApply={onApplyTheme}
            onClose={onCloseThemePicker}
          />
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TalentIQAssistant({ resumeContext = {} }) {
  const { themeId, setTheme } = useTheme();

  const [isOpen, setIsOpen]               = useState(false);
  const [isMinimized, setIsMinimized]     = useState(false);
  const [input, setInput]                 = useState('');
  const [history, setHistory]             = useState([]);   // [{role, content, showThemePicker?}]
  const [loading, setLoading]             = useState(false);
  const [hasNew, setHasNew]               = useState(false);
  const [showActions, setShowActions]     = useState(true);
  const [appliedTheme, setAppliedTheme]   = useState(null); // name of last applied theme

  const endRef   = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setHasNew(false);
    }
  }, [isOpen, isMinimized]);

  // Greeting on first open
  useEffect(() => {
    if (isOpen && history.length === 0) {
      const profession = resumeContext?.profession?.label || 'your profession';
      const phase      = resumeContext?.phase;
      const active     = UI_THEMES[themeId];

      let greeting = `👋 Hi! I'm **TalentIQ Resume Assistant** — your personal AI career coach.\n\nI can see your current session data and I'm ready to help you with:`;

      if (phase === 'results' && resumeContext?.resumeData?.name) {
        greeting = `👋 Great work, **${resumeContext.resumeData.name}**! Your **${profession}** resume has been generated.\n\nI've analyzed your resume and I'm ready to help you with:`;
      } else if (phase === 'interview') {
        greeting = `👋 Hey! I can see you're building a **${profession}** resume right now.\n\nWhile you're answering the interview questions, I'm here to help with:`;
      }

      greeting += `\n\n• **ATS optimization** & scoring\n• **UI Theme switching** — currently using *${active?.name || 'Deep Space'}* ${active?.emoji || '🌌'}\n• **Skill gap analysis** & learning roadmap\n• **Interview question** generation\n• **Resume content** improvements\n• **Career path** suggestions\n\nTry a quick action below, or just type *"change theme"* to browse all themes! 🎨`;

      setHistory([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen]);

  // Handle theme application from the picker
  const handleApplyTheme = useCallback((id) => {
    setTheme(id);
    const applied = UI_THEMES[id];
    setAppliedTheme(applied?.name);

    // Add a confirmation message if it's not already the last one
    setHistory(prev => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant' && last?.isThemeConfirm) {
        // Update the existing confirm
        return prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, content: `✅ **${applied?.name}** ${applied?.emoji} theme applied! The entire UI has been updated.\n\nLooking great! Want me to suggest a theme that best matches your **${resumeContext?.profession?.label || 'profile'}**?` }
            : m
        );
      }
      return [...prev, {
        role: 'assistant',
        isThemeConfirm: true,
        content: `✅ **${applied?.name}** ${applied?.emoji} theme applied! The entire UI has been updated.\n\nLooking great! Want me to suggest a theme that best matches your **${resumeContext?.profession?.label || 'profile'}**?`,
      }];
    });
  }, [setTheme, resumeContext]);

  const closeThemePicker = useCallback((msgIndex) => {
    setHistory(prev => prev.map((m, i) =>
      i === msgIndex ? { ...m, showThemePicker: false } : m
    ));
  }, []);

  const sendMessage = useCallback(async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || loading) return;

    setInput('');
    setShowActions(false);

    const userMsg = { role: 'user', content: text };
    const updatedHistory = [...history, userMsg];
    setHistory(updatedHistory);
    setLoading(true);

    try {
      const response = await assistantChat(
        updatedHistory.map(m => ({ role: m.role, content: m.content })),
        resumeContext
      );

      // Check if this is a theme-related exchange
      const showPicker = isThemeResponse(text, response);

      setHistory(prev => [...prev, {
        role: 'assistant',
        content: response,
        showThemePicker: showPicker,
      }]);

      if (!isOpen) setHasNew(true);
    } catch (err) {
      setHistory(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Sorry, I ran into an issue: *${err.message}*\n\nPlease try again in a moment.`,
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, history, resumeContext, isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => { setHistory([]); setShowActions(true); setTimeout(() => inputRef.current?.focus(), 50); };
  const toggleOpen = () => { setIsOpen(prev => !prev); setIsMinimized(false); };

  const phase     = resumeContext?.phase;
  const hasResume = phase === 'results';
  const activeTheme = UI_THEMES[themeId];

  return (
    <>
      {/* ── Floating Action Button ──────────────────────────────────── */}
      <button
        id="talentiq-assistant-fab"
        onClick={toggleOpen}
        className="assistant-fab"
        title="TalentIQ Resume Assistant"
        aria-label="Open TalentIQ Resume Assistant"
      >
        <div className="assistant-fab-inner">
          {isOpen ? <X size={20} style={{ color: '#fff' }} /> : <Sparkles size={20} style={{ color: '#fff' }} />}
        </div>
        {hasNew && !isOpen && <span className="assistant-fab-badge" />}
        {!isOpen && <span className="assistant-fab-label">AI Assistant</span>}
      </button>

      {/* ── Chat Panel ─────────────────────────────────────────────── */}
      <div
        className={`assistant-panel ${isOpen ? 'open' : ''} ${isMinimized ? 'minimized' : ''}`}
        role="dialog"
        aria-label="TalentIQ Resume Assistant"
      >
        {/* Header */}
        <div className="assistant-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--v), var(--t))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(123,111,255,0.35)',
            }}>
              <Sparkles size={16} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)', lineHeight: 1.2 }}>
                TalentIQ Assistant
              </div>
              <div style={{ fontSize: '10px', color: 'var(--t)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {loading ? 'Thinking...' : (
                  <>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--g)' }} />
                    {activeTheme?.emoji} {activeTheme?.name}
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {history.length > 1 && (
              <button onClick={clearChat} title="Clear chat" className="assistant-icon-btn"
                onMouseEnter={e => e.currentTarget.style.color = 'var(--r)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                <RotateCcw size={13} />
              </button>
            )}
            <button
              onClick={() => setIsMinimized(p => !p)}
              title={isMinimized ? 'Expand' : 'Minimize'}
              className="assistant-icon-btn"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >
              <ChevronDown size={15} style={{ transform: isMinimized ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            <button onClick={() => setIsOpen(false)} title="Close" className="assistant-icon-btn"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--r)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        {!isMinimized && (
          <>
            {/* Applied-theme toast strip */}
            {appliedTheme && (
              <div style={{
                padding: '6px 14px',
                background: 'rgba(30,203,123,0.08)',
                borderBottom: '1px solid rgba(30,203,123,0.15)',
                fontSize: '10px', color: 'var(--g)',
                fontFamily: 'var(--font-mono)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <Check size={10} />
                Theme changed to <strong>{appliedTheme}</strong>
                <button onClick={() => setAppliedTheme(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', marginLeft: 'auto', fontSize: '10px' }}>✕</button>
              </div>
            )}

            {/* Messages */}
            <div className="assistant-messages" id="assistant-messages-list">
              {history.map((msg, i) => (
                <AssistantBubble
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  showThemePicker={msg.showThemePicker}
                  currentThemeId={themeId}
                  onApplyTheme={handleApplyTheme}
                  onCloseThemePicker={() => closeThemePicker(i)}
                />
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--v), var(--t))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Sparkles size={12} style={{ color: '#fff' }} />
                  </div>
                  <div style={{ background: 'rgba(21,21,42,0.95)', border: '1px solid rgba(123,111,255,0.15)', borderRadius: '4px 14px 14px 14px', padding: '10px 13px' }}>
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick Action Chips */}
            {showActions && history.length <= 1 && (
              <div className="assistant-quick-actions">
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  Quick Actions
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {QUICK_ACTIONS.map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        id={`assistant-action-${action.id}`}
                        onClick={() => { sendMessage(action.prompt); }}
                        className="assistant-chip"
                        disabled={loading}
                      >
                        <Icon size={10} style={{ color: 'var(--v)', flexShrink: 0 }} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="assistant-input-area">
              <textarea
                ref={inputRef}
                id="assistant-chat-input"
                className="assistant-textarea"
                placeholder={`Ask anything… or type "change theme" 🎨`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={loading}
              />
              <button
                id="assistant-send-btn"
                className="assistant-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                title="Send"
              >
                <Send size={14} />
              </button>
            </div>

            {/* Footer */}
            <div style={{ padding: '6px 14px', fontSize: '9.5px', color: 'rgba(136,136,165,0.6)', fontFamily: 'var(--font-mono)', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
              Powered by Groq · Context-aware · Press Enter to send
            </div>
          </>
        )}
      </div>
    </>
  );
}
