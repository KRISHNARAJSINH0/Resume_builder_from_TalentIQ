/**
 * PublicResumePage.jsx
 *
 * A login-free, mobile-responsive public resume page.
 * Accessed at /resume/:resumeId (e.g. /resume/RES12345)
 *
 * Features:
 * - Fetches resume data from Django backend
 * - Displays all resume sections (Summary, Skills, Experience, etc.)
 * - Shows LinkedIn / Portfolio links
 * - Download PDF button (generates ATS-friendly PDF via jsPDF + html2canvas)
 * - Analytics tracking: view, pdf_download
 * - Works without login — recruiter-accessible
 */

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getPublicResume, trackEvent } from '../api/resumePublicAPI';
import { downloadResumeAsPDF } from '../utils/pdfDownloader';
import {
  Mail, Phone, MapPin, Linkedin, Globe, Github,
  Download, Loader, AlertCircle, CheckCircle2,
  ExternalLink, Award, FileText, Zap,
} from 'lucide-react';

// ── Public Resume Page ────────────────────────────────────────────────────────
export default function PublicResumePage() {
  const { resumeId } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfStatus, setPdfStatus] = useState('');
  const [pdfDone, setPdfDone] = useState(false);
  const resumeRef = useRef(null);


  useEffect(() => {
    if (!resumeId) return;

    async function load() {
      try {
        setLoading(true);
        const data = await getPublicResume(resumeId);
        setResume(data);

        // Track analytics
        trackEvent(resumeId, 'view');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [resumeId]);

  // ── Download PDF ────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    const element = resumeRef.current;
    if (!element) return;

    setPdfLoading(true);
    setPdfStatus('Initiating PDF download...');
    setPdfDone(false);

    try {
      const name = resume?.personal_info?.full_name || 'Resume';
      await downloadResumeAsPDF(name, resumeId, (msg) => setPdfStatus(msg));
      setPdfDone(true);
      trackEvent(resumeId, 'pdf_download');
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setPdfLoading(false);
      setPdfStatus('');
      setTimeout(() => setPdfDone(false), 3000);
    }
  };

/**
 * Traverses all anchor tags in the target DOM element, measures their
 * coordinates, and places native clickable PDF link annotations on top of them.
 */
function addLinksToPdf(pdf, element, pdfWidth) {
  try {
    const containerRect = element.getBoundingClientRect();
    const pxToMm = pdfWidth / containerRect.width;
    const pageHeightMM = pdf.internal.pageSize.getHeight();

    const links = element.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const href = link.href || link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;

      const linkRect = link.getBoundingClientRect();
      const left = linkRect.left - containerRect.left;
      const top = linkRect.top - containerRect.top;
      const width = linkRect.width;
      const height = linkRect.height;

      const x = left * pxToMm;
      const y = top * pxToMm;
      const w = width * pxToMm;
      const h = height * pxToMm;

      // Determine page index and offset on target page
      const pageIndex = Math.floor(y / pageHeightMM);
      const yOnPage = y % pageHeightMM;

      const targetPage = pageIndex + 1;
      const totalPages = pdf.internal.getNumberOfPages();

      if (targetPage <= totalPages) {
        pdf.setPage(targetPage);
        pdf.link(x, yOnPage, w, h, { url: href });
      }
    }
  } catch (err) {
    console.error('Failed to add interactive links to PDF:', err);
  }
}

  // ── Loading State ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={loadingStyle}>
            <div style={logoStyle}>TalentIQ</div>
            <div className="spinner" style={{ margin: '2rem auto', width: '40px', height: '40px' }} />
            <p style={{ color: '#8888a5', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}>
              Loading resume...
            </p>
            <p style={{ color: '#555570', fontSize: '11px', marginTop: '8px', textAlign: 'center', maxWidth: '280px' }}>
              If this takes &gt;10 seconds, the server is waking up from sleep. Please wait.
            </p>
          </div>
        </div>
      </div>
    );
  }


  // ── Error State ─────────────────────────────────────────────────────────────
  if (error || !resume) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={loadingStyle}>
            <div style={logoStyle}>TalentIQ</div>
            <AlertCircle size={48} style={{ color: '#ff6b6b', margin: '1.5rem auto', display: 'block' }} />
            <h2 style={{ color: '#eaeaf5', marginBottom: '8px', textAlign: 'center' }}>Resume Not Found</h2>
            <p style={{ color: '#8888a5', fontSize: '13px', textAlign: 'center', lineHeight: 1.7 }}>
              {error || 'This resume link may be expired or invalid.'}<br />
              Resume ID: <span style={{ color: '#7b6fff', fontFamily: 'monospace' }}>{resumeId}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const d = resume.resume_data || {};

  // Normalize: localStorage stores flat resumeData, backend stores nested resume_data
  // Map both structures to a unified shape
  const name = d.name || d.full_name || resume.user_name || 'Candidate';
  const profession = d.profession || resume.profession || '';
  const email = d.email || '';
  const phone = d.phone || '';
  const address = d.address || '';
  const linkedin = d.linkedin || d.linkedin_url || '';
  const portfolio = d.portfolio || d.portfolio_url || '';
  const github = d.github || d.github_url || '';
  const summary = d.summary || d.professional_summary || '';
  const skills = d.skills || '';
  const experience = d.experience || '';
  const experienceEnhanced = d.experienceEnhanced || d.experience_enhanced || '';
  const projects = d.projects || '';
  const projectsEnhanced = d.projectsEnhanced || d.projects_enhanced || '';
  const projectsStructured = d.projectsStructured || null;
  const education = d.education || '';
  const certifications = d.certifications || '';
  const achievements = d.achievements || '';
  const languages = d.languages || '';

  const parseLines = (text) => {
    if (!text) return [];
    return text.split('\n').filter(l => l.trim().length > 0);
  };

  const parseCommaList = (text) => {
    if (!text) return [];
    if (Array.isArray(text)) return text;
    return text.split(/[,•\n]+/).map(s => s.trim()).filter(Boolean);
  };


  // ── Resume Page ─────────────────────────────────────────────────────────────
  return (
    <div style={pageStyle}>
      {/* ── Top Navigation Bar ───────────────────────────────────────── */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={logoStyle}>TalentIQ</div>
          <span style={{ color: '#8888a5', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>
            Public Resume
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', color: '#8888a5', fontFamily: 'JetBrains Mono, monospace' }}>
            ID: {resume.resume_id}
          </span>

          <button
            onClick={downloadPDF}
            disabled={pdfLoading}
            style={pdfBtnStyle(pdfLoading, pdfDone)}
          >
            {pdfDone
              ? <><CheckCircle2 size={14} /> Downloaded!</>
              : pdfLoading
                ? <><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> {pdfStatus || 'Generating...'}</>
                : <><Download size={14} /> Download PDF</>
            }
          </button>
        </div>
      </header>

      {/* ── Resume Content ────────────────────────────────────────────── */}
      <main style={containerStyle}>

        {/* ── Resume Print Area ─────────────────────────────────────── */}
        <div
          id="public-resume-print-area"
          ref={resumeRef}
          style={resumeCardStyle}
        >
          {/* ── Header / Profile ──────────────────────────────────── */}
          <div style={{ borderBottom: '2px solid #7b6fff', paddingBottom: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f0f23', marginBottom: '4px' }}>
                  {name}
                </h1>
                <div style={{ fontSize: '14px', color: '#7b6fff', fontWeight: 700, marginBottom: '12px' }}>
                  {profession}
                </div>
              </div>

            </div>

            {/* Contact Info */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: '#444' }}>
              {email && (
                <a href={`mailto:${email}`} style={contactLinkStyle}>
                  <Mail size={12} color="#7b6fff" /> {email}
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} style={contactLinkStyle}>
                  <Phone size={12} color="#7b6fff" /> {phone}
                </a>
              )}
              {address && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="#7b6fff" /> {address}
                </span>
              )}
              {linkedin && (
                <a
                  href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
                  target="_blank" rel="noreferrer"
                  style={contactLinkStyle}
                >
                  <Linkedin size={12} color="#7b6fff" /> LinkedIn
                  <ExternalLink size={10} />
                </a>
              )}
              {portfolio && (
                <a
                  href={portfolio.startsWith('http') ? portfolio : `https://${portfolio}`}
                  target="_blank" rel="noreferrer"
                  style={contactLinkStyle}
                >
                  <Globe size={12} color="#7b6fff" /> Portfolio
                  <ExternalLink size={10} />
                </a>
              )}
              {github && (
                <a
                  href={github.startsWith('http') ? github : `https://github.com/${github}`}
                  target="_blank" rel="noreferrer"
                  style={contactLinkStyle}
                >
                  <Github size={12} color="#7b6fff" /> GitHub
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>

          {summary && (
            <ResumeSection title="Professional Summary">
              <p style={{ fontSize: '13px', color: '#333', lineHeight: 1.8 }}>{summary}</p>
            </ResumeSection>
          )}

          {/* ── Core Skills ──────────────────────────────────────── */}
          {skills && (
            <ResumeSection title="Core Skills">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {parseCommaList(skills).map((skill, i) => (
                  <span key={i} style={skillBadgeStyle}>{skill}</span>
                ))}
              </div>
            </ResumeSection>
          )}

          {/* ── Work Experience ───────────────────────────────────── */}
          {(experienceEnhanced || experience) && (
            <ResumeSection title="Work Experience">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {experienceEnhanced
                  ? parseLines(experienceEnhanced).map((line, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#333', lineHeight: 1.7 }}>
                      {line.startsWith('•') ? line : `• ${line}`}
                    </div>
                  ))
                  : <p style={{ fontSize: '13px', color: '#333', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{experience}</p>
                }
              </div>
            </ResumeSection>
          )}

          {/* ── Projects ───────────────────────────────────────── */}
          {(projectsStructured || projectsEnhanced || projects) && (
            <ResumeSection title="Projects">
              {projectsStructured
                ? <PublicProjectList projects={projectsStructured} />
                : <p style={{ fontSize: '13px', color: '#333', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                    {projectsEnhanced || projects}
                  </p>
              }
            </ResumeSection>
          )}

          {/* ── Education ─────────────────────────────────────────── */}
          {education && (
            <ResumeSection title="Education">
              <p style={{ fontSize: '13px', color: '#333', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {education}
              </p>
            </ResumeSection>
          )}

          {/* ── Certifications ───────────────────────────── */}
          {certifications && (
            <ResumeSection title="Certifications">
              <CertificationList text={certifications} />
            </ResumeSection>
          )}

          {/* ── Achievements ──────────────────────────────────────── */}
          {achievements && (
            <ResumeSection title="Achievements">
              <p style={{ fontSize: '13px', color: '#333', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {achievements}
              </p>
            </ResumeSection>
          )}

          {/* ── Languages ─────────────────────────────────────────── */}
          {languages && (
            <ResumeSection title="Languages">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {parseCommaList(languages).map((lang, i) => (
                  <span key={i} style={{ fontSize: '13px', color: '#333' }}>
                    {lang}{i < parseCommaList(languages).length - 1 ? ' ·' : ''}
                  </span>
                ))}
              </div>
            </ResumeSection>
          )}

          {/* ── Footer ────────────────────────────────────────────── */}
          <div style={{
            marginTop: '28px', paddingTop: '14px',
            borderTop: '1px solid #e0e0f0',
            textAlign: 'center', fontSize: '9px', color: '#aaa',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            Resume ID: {resume.resume_id} · Generated by TalentIQ Resume Intelligence Engine
          </div>
        </div>

        {/* ── Download CTA (below resume) ──────────────────────────── */}
        <div style={{
          background: 'rgba(123,111,255,0.06)',
          border: '1px solid rgba(123,111,255,0.15)',
          borderRadius: '12px', padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px', margin: '0 auto',
          maxWidth: '800px',
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#eaeaf5', marginBottom: '4px' }}>
              <Zap size={14} style={{ display: 'inline', color: '#7b6fff', marginRight: '6px' }} />
              Download ATS-Friendly PDF
            </div>
            <div style={{ fontSize: '12px', color: '#8888a5' }}>
              Clean A4 format · Ready to submit
            </div>
          </div>
          <button
            onClick={downloadPDF}
            disabled={pdfLoading}
            style={{ ...pdfBtnStyle(pdfLoading, pdfDone), minWidth: '160px' }}
          >
            {pdfDone
              ? <><CheckCircle2 size={14} /> Downloaded!</>
              : pdfLoading
                ? <><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> {pdfStatus || 'Generating...'}</>
                : <><Download size={14} /> Download PDF</>
            }
          </button>
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', padding: '2rem 0', fontSize: '11px', color: '#4a4a6a' }}>
          Powered by <span style={{ color: '#7b6fff', fontWeight: 700 }}>TalentIQ</span> · AI Resume Intelligence
          {resume.view_count > 0 && (
            <span style={{ marginLeft: '8px' }}>
              · {resume.view_count} view{resume.view_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </main>

      {/* ── CSS for spinner ──────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .spinner {
          width: 32px; height: 32px;
          border: 3px solid rgba(123,111,255,0.2);
          border-top-color: #7b6fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          header, .no-print { display: none !important; }
          body { background: #fff !important; }
          #public-resume-print-area {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
        }
        @media (max-width: 600px) {
          .resume-header-row { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}

// ── Public Project List with clickable links ─────────────────────────────────────────
function PublicProjectList({ projects }) {
  if (!projects || projects.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {projects.map((proj, i) => (
        <div key={i} style={{
          borderLeft: '2px solid rgba(123,111,255,0.4)',
          paddingLeft: '12px',
        }}>
          {/* Title + tech */}
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#222' }}>
              {proj.project_name}
            </span>
            {proj.technologies && (
              <span style={{ fontSize: '11px', color: '#888' }}>({proj.technologies})</span>
            )}
          </div>
          {/* Description */}
          {(proj.enhancedDescription || proj.description) && (
            <p style={{ fontSize: '12px', color: '#444', lineHeight: 1.6, margin: '0 0 6px 0' }}>
              {proj.enhancedDescription || proj.description}
            </p>
          )}
          {/* Links */}
          {(proj.github_link || proj.live_link) && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {proj.github_link && (
                <a
                  href={proj.github_link.startsWith('http') ? proj.github_link : `https://${proj.github_link}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '11px', fontWeight: 700, textDecoration: 'none',
                    color: '#7b6fff', padding: '3px 10px', borderRadius: '20px',
                    background: 'rgba(123,111,255,0.08)',
                    border: '1px solid rgba(123,111,255,0.25)',
                  }}
                >
                  <Github size={10} /> GitHub
                </a>
              )}
              {proj.live_link && (
                <a
                  href={proj.live_link.startsWith('http') ? proj.live_link : `https://${proj.live_link}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '11px', fontWeight: 700, textDecoration: 'none',
                    color: '#16a34a', padding: '3px 10px', borderRadius: '20px',
                    background: 'rgba(22,163,74,0.08)',
                    border: '1px solid rgba(22,163,74,0.25)',
                  }}
                >
                  <ExternalLink size={10} /> Live Demo
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Certification helpers ─────────────────────────────────────────────────────────────────────────────
function parseCertifications(text) {
  if (!text) return [];
  const entries = text.split(/\n|(?<!\bhttps?:),/).map(s => s.trim()).filter(Boolean);
  const URL_RE = /https?:\/\/[^\s,)>\]]+/i;
  return entries.map(entry => {
    const match = entry.match(URL_RE);
    if (match) {
      const url = match[0];
      const name = entry.replace(/[-\u2013\u2014|:]\s*https?:\/\/[^\s,)>\]]+/i, '').replace(URL_RE, '').trim();
      const cleanName = name.replace(/^\[Certificate Uploaded:\s*/i, '').replace(/\]$/, '').trim();
      return { name: cleanName || name || entry, url };
    }

    const uploadMatch = entry.match(/\[Certificate Uploaded:\s*([^\]]+)\]/i);
    if (uploadMatch) {
      const filename = uploadMatch[1];
      const mockUrl = `https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=1200`;
      return { name: filename, url: mockUrl };
    }

    return { name: entry, url: null };
  });
}

function CertificationList({ text }) {
  const certs = parseCertifications(text);

  const cardStyle = (hasUrl) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '6px',
    padding: '5px 10px',
    background: 'rgba(123,111,255,0.04)',
    border: '1px solid rgba(123,111,255,0.12)',
    borderRadius: '5px',
    cursor: hasUrl ? 'pointer' : 'default',
    textDecoration: 'none',
    transition: 'opacity 0.15s ease',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {certs.map((cert, i) => {
        const inner = (
          <>
            <span style={{ fontSize: '12px', color: '#333', fontWeight: 500, flex: 1 }}>
              🏅 {cert.name}
            </span>
            {cert.url && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                fontSize: '10px', color: '#7b6fff', fontWeight: 700,
                padding: '2px 8px', borderRadius: '20px',
                background: 'rgba(123,111,255,0.1)',
                border: '1px solid rgba(123,111,255,0.25)',
                whiteSpace: 'nowrap',
              }}>
                View Certificate <ExternalLink size={9} />
              </span>
            )}
          </>
        );
        return cert.url ? (
          <a
            key={i}
            href={cert.url}
            target="_blank"
            rel="noreferrer noopener"
            style={cardStyle(true)}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {inner}
          </a>
        ) : (
          <div key={i} style={cardStyle(false)}>{inner}</div>
        );
      })}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function ResumeSection({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: '#7b6fff',
        borderBottom: '1px solid #e8e8f8', paddingBottom: '4px', marginBottom: '10px',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #07070e 0%, #0e0e1c 50%, #0a0a18 100%)',
  fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
};

const containerStyle = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '0 16px 48px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const headerStyle = {
  background: 'rgba(7, 7, 14, 0.9)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  padding: '12px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '10px',
  position: 'sticky',
  top: 0,
  zIndex: 50,
  marginBottom: '24px',
};

const logoStyle = {
  fontFamily: 'JetBrains Mono, monospace',
  fontWeight: 800,
  fontSize: '16px',
  color: '#7b6fff',
  letterSpacing: '-0.02em',
};

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  gap: '1rem',
};

const resumeCardStyle = {
  background: '#fff',
  color: '#1a1a2e',
  fontFamily: "'Outfit', 'Segoe UI', sans-serif",
  padding: '48px 52px',
  borderRadius: '12px',
  maxWidth: '800px',
  margin: '0 auto',
  width: '100%',
  boxShadow: '0 8px 60px rgba(0,0,0,0.5)',
  lineHeight: 1.6,
};

const skillBadgeStyle = {
  background: 'rgba(123,111,255,0.08)',
  border: '1px solid rgba(123,111,255,0.2)',
  borderRadius: '4px',
  padding: '3px 10px',
  fontSize: '11px',
  color: '#5a5a8f',
  fontWeight: 500,
};

const contactLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  color: '#444',
  textDecoration: 'none',
};

const pdfBtnStyle = (loading, done) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '9px 18px',
  background: done ? '#1ecb7b' : '#7b6fff',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 700,
  cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? 0.8 : 1,
  transition: 'all 0.15s ease',
  boxShadow: done
    ? '0 0 15px rgba(30,203,123,0.3)'
    : '0 0 15px rgba(123,111,255,0.3)',
});
