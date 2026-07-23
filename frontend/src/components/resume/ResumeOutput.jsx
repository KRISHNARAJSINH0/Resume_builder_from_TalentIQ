import React, { useState } from 'react';
import ResumePreview from './ResumePreview';
import { downloadResumeAsPDF } from '../../utils/pdfDownloader';
import {
  FileText, BarChart2, GitBranch, Target, MessageSquare,
  Globe, PieChart, Printer, RotateCcw, Copy,
  CheckCircle2, AlertTriangle, ExternalLink, ChevronRight,
  Award, Clock, TrendingUp, Zap, Download, Loader,
} from 'lucide-react';

const TABS = [
  { id: 0, label: 'Resume', icon: FileText, color: 'var(--v)' },
  { id: 1, label: 'Skill Gap', icon: GitBranch, color: 'var(--a)' },
  { id: 2, label: 'Job Match', icon: Target, color: 'var(--t)' },
  { id: 3, label: 'Interview Prep', icon: MessageSquare, color: 'var(--pk)' },
  { id: 4, label: 'Portfolio', icon: Globe, color: 'var(--b)' },
  { id: 5, label: 'Analytics', icon: PieChart, color: 'var(--t)' },
  { id: 6, label: 'Print', icon: Printer, color: 'var(--g)' },
];

export default function ResumeOutput({
  resumeData, gapData, interviewPrepData, portfolioData,
  activeTab, setActiveTab, onRestart, onPrint,
  onJobMatch, jobMatchData, jobMatchLoading,
}) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfStatus, setPdfStatus] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const handleDownloadPDF = async () => {
    // Ensure the Resume tab (id=0) is visible so html2canvas can capture it
    if (activeTab !== 0) {
      setActiveTab(0);
      // Small delay to let React render the tab before capture
      await new Promise(r => setTimeout(r, 400));
    }
    setPdfLoading(true);
    try {
      await downloadResumeAsPDF(resumeData?.name, resumeData?.resumeId, (msg) => setPdfStatus(msg));
    } catch (err) {
      alert(err.message);
    } finally {
      setPdfLoading(false);
      setPdfStatus('');
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="eyebrow">Generation Complete</span>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Your AI Resume Package</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
            All 12 phases complete · Resume ID: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--v)' }}>{resumeData?.resumeId}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>

          <button onClick={onRestart} className="btn btn-secondary" style={{ gap: '6px' }}>
            <RotateCcw size={13} /> New Resume
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-primary"
            style={{ gap: '6px', opacity: pdfLoading ? 0.7 : 1 }}
            disabled={pdfLoading}
          >
            {pdfLoading
              ? <><Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> {pdfStatus || 'Generating...'}</>
              : <><Download size={13} /> Download PDF</>
            }
          </button>
          <button onClick={onPrint} className="btn btn-secondary" style={{ gap: '6px' }}>
            <Printer size={13} /> Print
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: '4px', flexWrap: 'wrap',
        background: 'var(--s1)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '6px',
      }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '6px',
                border: 'none', cursor: 'pointer', fontSize: '12px',
                fontFamily: 'var(--font-mono)', fontWeight: 600,
                transition: 'all 0.15s ease',
                background: isActive ? tab.color : 'transparent',
                color: isActive ? '#fff' : 'var(--muted)',
                boxShadow: isActive ? `0 0 12px ${tab.color}44` : 'none',
              }}
            >
              <Icon size={13} />
              <span className="tab-label-text">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Template Selector Bar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 700 }}>Resume Template Selection</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px' }}>Choose from 15 premium and professional templates for your export style</p>
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--v)', fontWeight: 600 }}>
                  Active: {selectedTemplate.toUpperCase()}
                </div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: '8px',
                width: '100%',
                marginTop: '4px'
              }}>
                {[
                  { id: 'modern', label: 'Modern Accent', emoji: '🌌' },
                  { id: 'executive', label: 'Executive Classic', emoji: '💼' },
                  { id: 'tech-split', label: 'Tech Split (2-Col)', emoji: '📂' },
                  { id: 'elegant', label: 'Elegant Serif', emoji: '🖋️' },
                  { id: 'minimal-stark', label: 'Minimal Stark', emoji: '🔳' },
                  { id: 'creative-teal', label: 'Creative Teal', emoji: '🐬' },
                  { id: 'slate-sidebar', label: 'Slate Sidebar', emoji: '⚖️' },
                  { id: 'harvard', label: 'Harvard Business', emoji: '🏛️' },
                  { id: 'terracotta', label: 'Warm Terracotta', emoji: '🏺' },
                  { id: 'indigo-bold', label: 'Indigo Bold', emoji: '🔮' },
                  { id: 'metro-grid', label: 'Metro Grid', emoji: '🎛️' },
                  { id: 'corporate-navy', label: 'Corporate Navy', emoji: '⚓' },
                  { id: 'startup-chic', label: 'Startup Chic', emoji: '🚀' },
                  { id: 'pacific-blue', label: 'Pacific Blue', emoji: '🏄' },
                  { id: 'charcoal-premium', label: 'Charcoal Premium', emoji: '💎' },
                ].map((tpl) => {
                  const isActive = selectedTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className="btn"
                      style={{
                        padding: '8px 10px',
                        fontSize: '11.5px',
                        borderColor: isActive ? 'var(--v)' : 'var(--border)',
                        background: isActive ? 'var(--v)' : 'var(--s2)',
                        color: isActive ? '#fff' : 'var(--text)',
                        boxShadow: isActive ? '0 0 10px var(--v-glow)' : 'none',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: '13px' }}>{tpl.emoji}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tpl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Resume Page Preview */}
            <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
              <ResumePreview resumeData={resumeData} template={selectedTemplate} />
            </div>
          </div>
        )}
        {activeTab === 1 && <SkillGapTab gapData={gapData} />}
        {activeTab === 2 && <JobMatchTab onMatch={onJobMatch} jobMatchData={jobMatchData} loading={jobMatchLoading} />}
        {activeTab === 3 && <InterviewPrepTab interviewPrepData={interviewPrepData} />}
        {activeTab === 4 && <PortfolioTab portfolioData={portfolioData} resumeData={resumeData} />}
        {activeTab === 5 && <AnalyticsTab resumeData={resumeData} />}
        {activeTab === 6 && <PrintTab onPrint={onPrint} resumeData={resumeData} onDownloadPDF={handleDownloadPDF} pdfLoading={pdfLoading} pdfStatus={pdfStatus} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 2: SKILL GAP
// ─────────────────────────────────────────────────────────────────
function SkillGapTab({ gapData }) {
  if (!gapData) return <EmptyState text="No skill gap data available." />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Career Boost Banner */}
      {gapData.careerBoost && (
        <div className="card glass" style={{ borderLeft: '3px solid var(--t)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Zap size={20} style={{ color: 'var(--t)', flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>{gapData.careerBoost}</p>
        </div>
      )}

      <div className="grid-cols-2">
        {/* Current Skills */}
        <div className="card glass">
          <h3 style={{ fontSize: '14px', color: 'var(--g)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
            <CheckCircle2 size={14} /> Skills You Have
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(gapData.currentSkills || []).map((s, i) => (
              <span key={i} className="chip syl">{s}</span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="card glass">
          <h3 style={{ fontSize: '14px', color: 'var(--r)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
            <AlertTriangle size={14} /> Missing Skills ({(gapData.missingSkills || []).length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(gapData.missingSkills || []).map((item, i) => (
              <div key={i} style={{
                padding: '8px 12px', background: 'var(--s2)',
                borderRadius: '6px', border: '1px solid var(--border)',
              }}>
                <div className="flex-between" style={{ marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, fontSize: '12px' }}>{item.name}</span>
                  <span className={`badge ${item.priority === 'High' ? 'br' : item.priority === 'Medium' ? 'ba' : 'bg'}`}>
                    {item.priority}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  {item.resource} · {item.timeWeeks} weeks
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roadmap */}
      {gapData.roadmap?.length > 0 && (
        <div className="card glass">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '1.25rem' }}>
            📅 90-Day Career Roadmap
          </h3>
          <div className="timeline">
            {gapData.roadmap.map((step, i) => (
              <div key={i} className="tl">
                <div className="tl-week">{step.week}</div>
                <div className="tl-title">{step.title}</div>
                <div className="tl-desc">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 3: JOB MATCH
// ─────────────────────────────────────────────────────────────────
function JobMatchTab({ onMatch, jobMatchData, loading }) {
  const [jd, setJD] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card glass">
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '0.5rem' }}>
          Paste Job Description
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '1rem' }}>
          Paste any job description and our AI will compare it with your resume to calculate a match score.
        </p>
        <textarea
          className="form-input"
          rows={6}
          placeholder="Paste the full job description here..."
          value={jd}
          onChange={(e) => setJD(e.target.value)}
          style={{ marginBottom: '12px', resize: 'vertical' }}
        />
        <button
          className="btn btn-primary"
          onClick={() => onMatch(jd)}
          disabled={!jd.trim() || loading}
          style={{ gap: '8px' }}
        >
          {loading ? 'Analyzing...' : <><Target size={14} /> Analyze Match</>}
        </button>
      </div>

      {jobMatchData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Match Score Ring */}
          <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <MatchRing score={jobMatchData.matchScore} />
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{
                fontSize: '24px', fontWeight: 800,
                color: jobMatchData.matchScore >= 70 ? 'var(--g)' : jobMatchData.matchScore >= 50 ? 'var(--a)' : 'var(--r)',
                marginBottom: '4px',
              }}>
                {jobMatchData.verdict}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '8px' }}>
                Your resume matches <strong>{jobMatchData.matchScore}%</strong> of the job requirements.
              </p>
              {jobMatchData.explanation && (
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px' }}>
                  "{jobMatchData.explanation}"
                </p>
              )}
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="card glass" style={{ borderLeft: '3px solid var(--g)' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--g)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} /> Matched Skills & Phrases
              </h4>
              <div className="chips">
                {(jobMatchData.matchedSkills || []).map((s, i) => (
                  <span key={i} className="chip syl">{s}</span>
                ))}
              </div>
            </div>
            <div className="card glass" style={{ borderLeft: '3px solid var(--r)' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--r)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={13} /> Missing Keywords & Skills
              </h4>
              <div className="chips">
                {(jobMatchData.missingSkills || []).map((s, i) => (
                  <span key={i} className="chip ext">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {((jobMatchData.weak_phrases && jobMatchData.weak_phrases.length > 0) || (jobMatchData.suggestions && jobMatchData.suggestions.length > 0)) && (
            <div className="card glass" style={{ borderLeft: '3px solid var(--t)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                💡 Vague Phrases & Proposed Rewrites
              </h4>
              {jobMatchData.weak_phrases && jobMatchData.weak_phrases.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {jobMatchData.weak_phrases.map((wp, i) => (
                    <div key={i} style={{
                      background: 'var(--s2)', border: '1px solid var(--border)',
                      borderRadius: '8px', padding: '12px',
                    }}>
                      <div style={{ fontSize: '11px', color: 'var(--r)', textDecoration: 'line-through', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                        ✗ "{wp.phrase}"
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--g)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>✨</span> "{wp.suggestion}"
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                jobMatchData.suggestions.map((s, i) => (
                  <div key={i} style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px', display: 'flex', gap: '8px' }}>
                    <ChevronRight size={12} style={{ color: 'var(--t)', flexShrink: 0, marginTop: '3px' }} />
                    {s}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MatchRing({ score }) {
  const R = 44; const C = 2 * Math.PI * R;
  const offset = C - (score / 100) * C;
  const color = score >= 70 ? 'var(--g)' : score >= 50 ? 'var(--a)' : 'var(--r)';
  return (
    <svg width="108" height="108" viewBox="0 0 108 108" style={{ flexShrink: 0 }}>
      <circle cx="54" cy="54" r={R} fill="none" stroke="var(--s3)" strokeWidth="8" />
      <circle cx="54" cy="54" r={R} fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
        transform="rotate(-90 54 54)" />
      <text x="54" y="50" textAnchor="middle" fill={color} fontSize="18" fontWeight="800" fontFamily="Outfit,sans-serif">{score}</text>
      <text x="54" y="66" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="JetBrains Mono,monospace">% Match</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 4: INTERVIEW PREP
// ─────────────────────────────────────────────────────────────────
function InterviewPrepTab({ interviewPrepData }) {
  const [level, setLevel] = useState('beginner');
  const [openIdx, setOpenIdx] = useState(null);

  if (!interviewPrepData) return <EmptyState text="No interview questions generated." />;

  const levels = [
    { key: 'beginner', label: '🟢 Beginner', color: 'var(--g)' },
    { key: 'intermediate', label: '🟡 Intermediate', color: 'var(--a)' },
    { key: 'advanced', label: '🔴 Advanced', color: 'var(--r)' },
  ];

  const questions = interviewPrepData[level] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Difficulty:</span>
        {levels.map((l) => (
          <button
            key={l.key}
            onClick={() => { setLevel(l.key); setOpenIdx(null); }}
            className="btn"
            style={{
              background: level === l.key ? l.color : 'transparent',
              color: level === l.key ? '#fff' : 'var(--muted)',
              borderColor: level === l.key ? l.color : 'var(--border)',
              fontSize: '11px', padding: '5px 12px',
            }}
          >
            {l.label} (10)
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {questions.map((q, i) => (
          <div key={i} className="card glass" style={{ cursor: 'pointer' }}
            onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            <div className="flex-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '6px',
                  background: 'var(--s3)', color: 'var(--muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{q.q}</span>
              </div>
              <ChevronRight size={14} style={{
                color: 'var(--muted)', flexShrink: 0,
                transform: openIdx === i ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.15s ease',
              }} />
            </div>
            {openIdx === i && q.hint && (
              <div style={{
                marginTop: '12px', paddingTop: '12px',
                borderTop: '1px solid var(--border)',
                fontSize: '12px', color: 'var(--muted)',
                lineHeight: 1.7,
                background: 'rgba(123,111,255,0.05)',
                padding: '10px', borderRadius: '6px',
              }}>
                💡 <strong>Hint:</strong> {q.hint}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 5: PORTFOLIO
// ─────────────────────────────────────────────────────────────────
function PortfolioTab({ portfolioData, resumeData }) {
  if (!portfolioData) return <EmptyState text="No portfolio data available." />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hero Card */}
      <div className="card glass" style={{
        background: 'linear-gradient(135deg, rgba(123,111,255,0.08) 0%, rgba(0,207,168,0.05) 100%)',
        border: '1px solid rgba(123,111,255,0.2)',
        textAlign: 'center', padding: '2.5rem',
      }}>
        <div style={{ fontSize: '42px', marginBottom: '12px' }}>👤</div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>{resumeData?.name}</h2>
        <p style={{ color: 'var(--v)', fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>{portfolioData.tagline}</p>
        <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>{portfolioData.aboutMe}</p>
      </div>

      <div className="grid-cols-2">
        {/* Skills */}
        <div className="card glass">
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '1rem', color: 'var(--t)' }}>⚡ Core Skills</h3>
          <div className="chips">
            {(portfolioData.skills || []).map((s, i) => (
              <span key={i} className="chip ml">{s}</span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="card glass">
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '1rem', color: 'var(--a)' }}>🏆 Achievements</h3>
          {(portfolioData.achievements || []).map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
              <Award size={13} style={{ color: 'var(--a)', flexShrink: 0, marginTop: '2px' }} />
              {a}
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      {portfolioData.projects?.length > 0 && (
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '1rem' }}>🚀 Featured Projects</h3>
          <div className="grid-cols-2">
            {portfolioData.projects.map((proj, i) => (
              <div key={i} className="card glass feat">
                <div className="feat-head">
                  <div className="feat-num" style={{ background: 'var(--v)' }}>{i + 1}</div>
                  <span className="feat-title">{proj.title}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{proj.description}</p>
                <div className="chips" style={{ marginTop: '8px' }}>
                  {(proj.tech || []).map((t, j) => (
                    <span key={j} className="chip">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {portfolioData.cta && (
        <div className="card glass" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(123,111,255,0.06)', border: '1px solid rgba(123,111,255,0.2)',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <p style={{ fontSize: '14px', fontWeight: 600 }}>{portfolioData.cta}</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {resumeData?.email && (
              <a href={`mailto:${resumeData.email}`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <ExternalLink size={13} /> Contact Me
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 5: ANALYTICS
// ─────────────────────────────────────────────────────────────────
function AnalyticsTab({ resumeData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card glass">
        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--t)' }}>
          📈 Recruiter Analytics Metadata
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Resume ID', value: resumeData?.resumeId, icon: FileText, color: 'var(--v)' },
            { label: 'Candidate ID', value: `CAND-${resumeData?.resumeId?.split('-')[1]}`, icon: Award, color: 'var(--pk)' },
            { label: 'Creation Date', value: new Date(resumeData?.createdAt).toLocaleString(), icon: Clock, color: 'var(--b)' },
            { label: 'Template', value: resumeData?.templateName, icon: FileText, color: 'var(--a)' },
            { label: 'Profession', value: resumeData?.profession, icon: TrendingUp, color: 'var(--g)' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={{
                background: 'var(--s2)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Icon size={13} style={{ color: item.color }} />
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{item.label}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', wordBreak: 'break-all' }}>{item.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 8: PRINT & DOWNLOAD
// ─────────────────────────────────────────────────────────────────
function PrintTab({ onPrint, resumeData, onDownloadPDF, pdfLoading, pdfStatus }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Two main actions side by side */}
      <div className="grid-cols-2">
        {/* Download PDF */}
        <div className="card glass" style={{ textAlign: 'center', padding: '2rem' }}>
          <Download size={40} style={{ color: 'var(--v)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>Download PDF</h3>
          <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Generates a clean A4 PDF directly — no print dialog needed.
          </p>
          <button
            onClick={onDownloadPDF}
            className="btn btn-primary"
            style={{ width: '100%', gap: '8px', opacity: pdfLoading ? 0.7 : 1 }}
            disabled={pdfLoading}
          >
            {pdfLoading
              ? <><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> {pdfStatus || 'Generating...'}</>
              : <><Download size={14} /> Download Resume PDF</>
            }
          </button>
          {pdfLoading && (
            <p style={{ fontSize: '10px', color: 'var(--v)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
              {pdfStatus}
            </p>
          )}
        </div>

        {/* Browser Print */}
        <div className="card glass" style={{ textAlign: 'center', padding: '2rem' }}>
          <Printer size={40} style={{ color: 'var(--g)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>Print / Save as PDF</h3>
          <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Opens the browser's print dialog. Choose <strong>"Save as PDF"</strong> as destination.
          </p>
          <button
            onClick={onPrint}
            className="btn btn-secondary"
            style={{ width: '100%', gap: '8px' }}
          >
            <Printer size={14} /> Open Print Dialog
          </button>
        </div>
      </div>

      <div className="card glass">
        <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '1rem' }}>📋 Tips for best PDF quality</h4>
        {[
          'Use "Download PDF" for the best one-click experience',
          'For Print dialog: set paper to A4, margins to Minimum',
          'Enable "Background graphics" for colored skill tags',
          'Chrome or Edge gives the cleanest print output',
          'Portrait orientation is recommended',
        ].map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>
            <ChevronRight size={12} style={{ color: 'var(--v)', flexShrink: 0, marginTop: '3px' }} />
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────
function EmptyState({ text }) {
  return (
    <div className="card glass flex-center" style={{ minHeight: '200px', flexDirection: 'column', gap: '10px', color: 'var(--muted)' }}>
      <AlertTriangle size={28} />
      <p style={{ fontSize: '13px' }}>{text}</p>
    </div>
  );
}
