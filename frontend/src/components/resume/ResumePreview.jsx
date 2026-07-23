import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe, Github, ExternalLink } from 'lucide-react';

export default function ResumePreview({ resumeData, template = 'modern' }) {
  if (!resumeData) return null;
  const d = resumeData;

  const parseLines = (text) => {
    if (!text) return [];
    return text.split('\n').filter((l) => l.trim().length > 0);
  };

  const renderFooter = () => (
    <div style={{
      marginTop: '30px', paddingTop: '15px',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      textAlign: 'center', fontSize: '9px', color: '#a0a0b0',
      fontFamily: 'Outfit, sans-serif',
    }}>
      Built with TalentIQ
    </div>
  );

  // ── Render Template Switcher ──────────────────────────────────────────────

  // 1. EXECUTIVE CLASSIC
  if (template === 'executive') {
    return (
      <div id="resume-print-area" style={{
        background: '#ffffff', color: '#1a1a2e',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        padding: '50px 55px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '25px', borderBottom: '2px solid #1a1a2e', paddingBottom: '15px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f0f23', marginBottom: '6px', letterSpacing: '-0.01em' }}>{d.name}</h1>
          <div style={{ fontSize: '15px', color: '#555', fontStyle: 'italic', fontWeight: 600, marginBottom: '12px' }}>{d.profession}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', fontSize: '11px', color: '#444', fontFamily: "'Segoe UI', sans-serif" }}>
            {d.email && <span>{d.email}</span>}
            {d.phone && <span>· {d.phone}</span>}
            {d.address && <span>· {d.address}</span>}
            {d.linkedin && <span>· LinkedIn</span>}
            {d.github && <span>· GitHub</span>}
            {d.portfolio && <span>· Portfolio</span>}
          </div>
        </div>

        {d.summary && <ClassicSection title="Professional Summary"><p style={{ fontSize: '13px', color: '#222', lineHeight: 1.7, textAlign: 'justify', marginBottom: 0 }}>{d.summary}</p></ClassicSection>}
        {d.skills && <ClassicSection title="Areas of Expertise"><p style={{ fontSize: '13px', color: '#222', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>{d.skills.split(/[,•\n]+/).filter(s => s.trim()).map(s => s.trim()).join('  ·  ')}</p></ClassicSection>}
        {(d.experienceEnhanced || d.experience) && (
          <ClassicSection title="Professional Experience">
            {d.experienceEnhanced ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {parseLines(d.experienceEnhanced).map((line, i) => (
                  <div key={i} style={{ fontSize: '13px', color: '#222', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ fontSize: '11px', marginTop: '2px' }}>■</span>
                    <span>{line.replace(/^[•■\-\*]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: '13px', color: '#222', lineHeight: 1.6 }}>{d.experience}</p>}
          </ClassicSection>
        )}
        {(d.projectsEnhanced || d.projects) && <ClassicSection title="Key Accomplishments & Projects"><p style={{ fontSize: '13px', color: '#222', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></ClassicSection>}
        {d.education && <ClassicSection title="Education"><p style={{ fontSize: '13px', color: '#222', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></ClassicSection>}
        {d.certifications && <ClassicSection title="Certifications"><CertificationList text={d.certifications} classic /></ClassicSection>}
        {d.achievements && <ClassicSection title="Honors & Awards"><p style={{ fontSize: '13px', color: '#222', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>{d.achievements}</p></ClassicSection>}
        {d.languages && <ClassicSection title="Languages"><p style={{ fontSize: '13px', color: '#222', margin: 0 }}>{d.languages.split(/[,•\n]+/).filter(s => s.trim()).map(s => s.trim()).join('  |  ')}</p></ClassicSection>}
        {renderFooter()}
      </div>
    );
  }

  // 2. TECH SPLIT (2-COLUMN)
  if (template === 'tech-split') {
    return (
      <div id="resume-print-area" style={{
        background: '#ffffff', color: '#2a2d34', fontFamily: "'Segoe UI', 'Outfit', sans-serif",
        borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6, display: 'flex', overflow: 'hidden'
      }}>
        <div style={{ width: '32%', background: '#f4f5f8', borderRight: '1px solid #e2e5ec', padding: '40px 25px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#2c3e50', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px', marginBottom: '15px' }}>{d.name ? d.name.charAt(0) : 'T'}</div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a2e', marginBottom: '4px' }}>{d.name}</h2>
            <div style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 600 }}>{d.profession}</div>
          </div>
          <div>
            <SidebarHeader title="Contact Info" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px', color: '#455a64' }}>
              {d.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={11} color="#2c3e50" /><span style={{ wordBreak: 'break-all' }}>{d.email}</span></div>}
              {d.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={11} color="#2c3e50" /><span>{d.phone}</span></div>}
              {d.address && <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}><MapPin size={11} color="#2c3e50" style={{ marginTop: '2px' }} /><span>{d.address}</span></div>}
              {d.linkedin && <a href={d.linkedin.startsWith('http') ? d.linkedin : `https://${d.linkedin}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#455a64', textDecoration: 'none', fontWeight: 500 }}><Linkedin size={11} color="#2c3e50" /> LinkedIn</a>}
              {d.github && <a href={d.github.startsWith('http') ? d.github : `https://github.com/${d.github}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#455a64', textDecoration: 'none', fontWeight: 500 }}><Github size={11} color="#2c3e50" /> GitHub</a>}
            </div>
          </div>
          {d.skills && (
            <div>
              <SidebarHeader title="Core Expertise" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {d.skills.split(/[,•\n]+/).filter(s => s.trim()).map((skill, i) => (
                  <span key={i} style={{ background: '#e9ecef', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', color: '#2c3e50', fontWeight: 600 }}>{skill.trim()}</span>
                ))}
              </div>
            </div>
          )}
          {d.languages && (
            <div>
              <SidebarHeader title="Languages" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#455a64' }}>
                {d.languages.split(/[,•\n]+/).filter(s => s.trim()).map((lang, i) => <span key={i} style={{ fontWeight: 500 }}>· {lang.trim()}</span>)}
              </div>
            </div>
          )}
          {d.certifications && (
            <div>
              <SidebarHeader title="Certifications" />
              <CertificationList text={d.certifications} sidebar />
            </div>
          )}
        </div>
        <div style={{ width: '68%', padding: '40px 35px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {d.summary && <SidebarSection title="Profile Overview"><p style={{ fontSize: '12px', color: '#4a5568', lineHeight: 1.7, margin: 0 }}>{d.summary}</p></SidebarSection>}
          {(d.experienceEnhanced || d.experience) && (
            <SidebarSection title="Professional Experience">
              {d.experienceEnhanced ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12px', color: '#4a5568', lineHeight: 1.6 }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
                </div>
              ) : <p style={{ fontSize: '12px', color: '#4a5568', lineHeight: 1.6, margin: 0 }}>{d.experience}</p>}
            </SidebarSection>
          )}
          {(d.projectsEnhanced || d.projects) && <SidebarSection title="Featured Projects"><p style={{ fontSize: '12px', color: '#4a5568', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></SidebarSection>}
          {d.education && <SidebarSection title="Education History"><p style={{ fontSize: '12px', color: '#4a5568', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></SidebarSection>}
          {d.achievements && <SidebarSection title="Key Accomplishments"><p style={{ fontSize: '12px', color: '#4a5568', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>{d.achievements}</p></SidebarSection>}
          {renderFooter()}
        </div>
      </div>
    );
  }

  // 3. ELEGANT IVORY
  if (template === 'elegant') {
    return (
      <div id="resume-print-area" style={{
        background: '#fdfbf7', color: '#2a2a2a', fontFamily: "'Georgia', 'Outfit', sans-serif",
        padding: '50px 55px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6,
      }}>
        <div style={{ height: '4px', background: '#1e3d59', marginBottom: '25px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: '1px solid rgba(30,61,89,0.15)', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1e3d59', marginBottom: '4px' }}>{d.name}</h1>
            <div style={{ fontSize: '13px', color: '#68829e', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{d.profession}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', color: '#555', textAlign: 'right', minWidth: '200px', fontFamily: "'Outfit', sans-serif" }}>
            {d.email && <span>{d.email} ✉️</span>}
            {d.phone && <span>{d.phone} 📞</span>}
            {d.address && <span>{d.address} 📍</span>}
          </div>
        </div>

        {d.summary && <ElegantSection title="Profile Synopsis"><p style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.8, marginBottom: 0, fontStyle: 'italic' }}>"{d.summary}"</p></ElegantSection>}
        {d.skills && (
          <ElegantSection title="Expertise & Skills">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {d.skills.split(/[,•\n]+/).filter(s => s.trim()).map((skill, i) => (
                <span key={i} style={{ background: 'rgba(30,61,89,0.06)', border: '1px solid rgba(30,61,89,0.15)', borderRadius: '30px', padding: '3px 12px', fontSize: '11px', color: '#1e3d59', fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>{skill.trim()}</span>
              ))}
            </div>
          </ElegantSection>
        )}
        {(d.experienceEnhanced || d.experience) && (
          <ElegantSection title="Career Progression">
            {d.experienceEnhanced ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.7 }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
              </div>
            ) : <p style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.7 }}>{d.experience}</p>}
          </ElegantSection>
        )}
        {(d.projectsEnhanced || d.projects) && <ElegantSection title="Key Accomplishments"><p style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{d.projectsEnhanced || d.projects}</p></ElegantSection>}
        {d.education && <ElegantSection title="Academic History"><p style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{d.education}</p></ElegantSection>}
        {d.certifications && <ElegantSection title="Professional Credentials"><CertificationList text={d.certifications} elegant /></ElegantSection>}
        {d.languages && (
          <ElegantSection title="Languages">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {d.languages.split(/[,•\n]+/).filter(s => s.trim()).map((lang, i) => <span key={i} style={{ fontSize: '12px', color: '#333', fontWeight: 500 }}>✦ {lang.trim()}</span>)}
            </div>
          </ElegantSection>
        )}
        {renderFooter()}
      </div>
    );
  }

  // 4. MINIMAL STARK (Strict black and white print focus)
  if (template === 'minimal-stark') {
    return (
      <div id="resume-print-area" style={{
        background: '#ffffff', color: '#000000',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '45px 50px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.5,
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '2px', letterSpacing: '-0.02em' }}>{d.name}</h1>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>{d.profession}</div>
          <div style={{ fontSize: '11px', color: '#555', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {d.email && <span>{d.email} |</span>}
            {d.phone && <span>{d.phone} |</span>}
            {d.address && <span>{d.address}</span>}
          </div>
        </div>

        {d.summary && <StarkSection title="Summary"><p style={{ fontSize: '12px', margin: 0 }}>{d.summary}</p></StarkSection>}
        {d.skills && <StarkSection title="Skills"><p style={{ fontSize: '12px', margin: 0 }}>{d.skills.split(/[,•\n]+/).filter(s => s.trim()).map(s => s.trim()).join(', ')}</p></StarkSection>}
        {(d.experienceEnhanced || d.experience) && (
          <StarkSection title="Experience">
            {d.experienceEnhanced ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12px' }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
              </div>
            ) : <p style={{ fontSize: '12px', margin: 0 }}>{d.experience}</p>}
          </StarkSection>
        )}
        {(d.projectsEnhanced || d.projects) && <StarkSection title="Projects"><p style={{ fontSize: '12px', whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></StarkSection>}
        {d.education && <StarkSection title="Education"><p style={{ fontSize: '12px', whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></StarkSection>}
        {d.certifications && <StarkSection title="Certifications"><CertificationList text={d.certifications} classic /></StarkSection>}
        {renderFooter()}
      </div>
    );
  }

  // 5. CREATIVE TEAL (Teal accent split border styling)
  if (template === 'creative-teal') {
    return (
      <div id="resume-print-area" style={{
        background: '#ffffff', color: '#112233', fontFamily: "'Outfit', sans-serif",
        padding: '48px 52px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6,
        borderLeft: '6px double #008080'
      }}>
        <div style={{ marginBottom: '22px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#004d40', marginBottom: '2px' }}>{d.name}</h1>
          <div style={{ fontSize: '13px', color: '#008080', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{d.profession}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: '#556677' }}>
            {d.email && <span>📧 {d.email}</span>}
            {d.phone && <span>📞 {d.phone}</span>}
            {d.address && <span>📍 {d.address}</span>}
          </div>
        </div>

        {d.summary && <TealSection title="About Me"><p style={{ fontSize: '12.5px', margin: 0, color: '#2c3e50' }}>{d.summary}</p></TealSection>}
        {d.skills && (
          <TealSection title="Skills Spectrum">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {d.skills.split(/[,•\n]+/).filter(s => s.trim()).map((s, i) => (
                <span key={i} style={{ background: '#e0f2f1', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', color: '#004d40', fontWeight: 600 }}>{s.trim()}</span>
              ))}
            </div>
          </TealSection>
        )}
        {(d.experienceEnhanced || d.experience) && (
          <TealSection title="Journey">
            {d.experienceEnhanced ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12.5px', color: '#2c3e50' }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
              </div>
            ) : <p style={{ fontSize: '12.5px', color: '#2c3e50' }}>{d.experience}</p>}
          </TealSection>
        )}
        {(d.projectsEnhanced || d.projects) && <TealSection title="Inventions & Projects"><p style={{ fontSize: '12.5px', color: '#2c3e50', whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></TealSection>}
        {d.education && <TealSection title="Studies"><p style={{ fontSize: '12.5px', color: '#2c3e50', whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></TealSection>}
        {d.certifications && <TealSection title="Credentials"><CertificationList text={d.certifications} classic /></TealSection>}
        {renderFooter()}
      </div>
    );
  }

  // 6. SLATE SIDEBAR (2-Column with deep slate block sidebar)
  if (template === 'slate-sidebar') {
    return (
      <div id="resume-print-area" style={{
        background: '#ffffff', color: '#333333', fontFamily: "'Segoe UI', Roboto, sans-serif",
        borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6, display: 'flex', overflow: 'hidden'
      }}>
        {/* Dark Slate Left Sidebar (30%) */}
        <div style={{ width: '30%', background: '#2c3e50', color: '#eceff1', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '2px' }}>{d.name}</h2>
            <div style={{ fontSize: '11px', color: '#cbd5e0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.profession}</div>
          </div>
          <div>
            <SidebarHeader title="Contact" dark />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10.5px', color: '#e2e8f0' }}>
              {d.email && <div style={{ wordBreak: 'break-all' }}>✉️ {d.email}</div>}
              {d.phone && <div>📞 {d.phone}</div>}
              {d.address && <div>📍 {d.address}</div>}
            </div>
          </div>
          {d.skills && (
            <div>
              <SidebarHeader title="Expertise" dark />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {d.skills.split(/[,•\n]+/).filter(s => s.trim()).map((skill, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '3px', padding: '2px 6px', fontSize: '9.5px', color: '#ffffff' }}>{skill.trim()}</span>
                ))}
              </div>
            </div>
          )}
          {d.languages && (
            <div>
              <SidebarHeader title="Languages" dark />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px', color: '#cbd5e0' }}>
                {d.languages.split(/[,•\n]+/).filter(s => s.trim()).map((lang, i) => <span key={i}>· {lang.trim()}</span>)}
              </div>
            </div>
          )}
        </div>
        {/* Main Body (70%) */}
        <div style={{ width: '70%', padding: '40px 30px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {d.summary && <SidebarSection title="Executive Summary"><p style={{ fontSize: '12px', color: '#4a5568', lineHeight: 1.7, margin: 0 }}>{d.summary}</p></SidebarSection>}
          {(d.experienceEnhanced || d.experience) && (
            <SidebarSection title="Experience History">
              {d.experienceEnhanced ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12px', color: '#4a5568' }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
                </div>
              ) : <p style={{ fontSize: '12px', color: '#4a5568', margin: 0 }}>{d.experience}</p>}
            </SidebarSection>
          )}
          {(d.projectsEnhanced || d.projects) && <SidebarSection title="Projects"><p style={{ fontSize: '12px', color: '#4a5568', whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></SidebarSection>}
          {d.education && <SidebarSection title="Education"><p style={{ fontSize: '12px', color: '#4a5568', whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></SidebarSection>}
          {renderFooter()}
        </div>
      </div>
    );
  }

  // 7. HARVARD BUSINESS (Academic centered times roman structure)
  if (template === 'harvard') {
    return (
      <div id="resume-print-area" style={{
        background: '#ffffff', color: '#000000', fontFamily: "'Times New Roman', Times, serif",
        padding: '50px 55px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.4,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>{d.name}</h1>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#333', marginBottom: '6px' }}>{d.profession}</div>
          <div style={{ fontSize: '11px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
            {d.email && <span>{d.email} |</span>}
            {d.phone && <span>{d.phone} |</span>}
            {d.address && <span>{d.address}</span>}
          </div>
        </div>

        {d.summary && <HarvardSection title="Summary"><p style={{ fontSize: '12px', textAlign: 'justify', margin: 0 }}>{d.summary}</p></HarvardSection>}
        {d.skills && <HarvardSection title="Skills & Competencies"><p style={{ fontSize: '12px', margin: 0, fontWeight: 'bold' }}>{d.skills.split(/[,•\n]+/).filter(s => s.trim()).map(s => s.trim()).join(', ')}</p></HarvardSection>}
        {(d.experienceEnhanced || d.experience) && (
          <HarvardSection title="Professional Experience">
            {d.experienceEnhanced ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {parseLines(d.experienceEnhanced).map((line, i) => (
                  <div key={i} style={{ fontSize: '12px', display: 'flex', gap: '4px' }}>
                    <span>·</span>
                    <span>{line.replace(/^[•■\-\*]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: '12px' }}>{d.experience}</p>}
          </HarvardSection>
        )}
        {(d.projectsEnhanced || d.projects) && <HarvardSection title="Selected Accomplishments"><p style={{ fontSize: '12px', whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></HarvardSection>}
        {d.education && <HarvardSection title="Education"><p style={{ fontSize: '12px', whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></HarvardSection>}
        {renderFooter()}
      </div>
    );
  }

  // 8. WARM TERRACOTTA (Warm accent details with classic borders)
  if (template === 'terracotta') {
    return (
      <div id="resume-print-area" style={{
        background: '#fdfcfb', color: '#332211', fontFamily: "'Georgia', 'Outfit', sans-serif",
        padding: '50px 55px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6,
      }}>
        <div style={{ borderBottom: '3px solid #c05c46', paddingBottom: '16px', marginBottom: '22px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#c05c46', marginBottom: '2px' }}>{d.name}</h1>
          <div style={{ fontSize: '14px', color: '#5c4633', fontStyle: 'italic', marginBottom: '10px' }}>{d.profession}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11.5px', color: '#776655', fontFamily: "'Outfit', sans-serif" }}>
            {d.email && <span>{d.email}</span>}
            {d.phone && <span>· {d.phone}</span>}
            {d.address && <span>· {d.address}</span>}
          </div>
        </div>

        {d.summary && <TerracottaSection title="About"><p style={{ fontSize: '13px', margin: 0 }}>{d.summary}</p></TerracottaSection>}
        {d.skills && (
          <TerracottaSection title="Skills Portfolio">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {d.skills.split(/[,•\n]+/).filter(s => s.trim()).map((s, i) => (
                <span key={i} style={{ background: '#f5e6e3', borderRadius: '4px', padding: '3px 10px', fontSize: '11px', color: '#c05c46', fontWeight: 600 }}>{s.trim()}</span>
              ))}
            </div>
          </TerracottaSection>
        )}
        {(d.experienceEnhanced || d.experience) && (
          <TerracottaSection title="Experience">
            {d.experienceEnhanced ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12.5px' }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
              </div>
            ) : <p style={{ fontSize: '12.5px' }}>{d.experience}</p>}
          </TerracottaSection>
        )}
        {(d.projectsEnhanced || d.projects) && <TerracottaSection title="Accomplishments"><p style={{ fontSize: '12.5px', whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></TerracottaSection>}
        {d.education && <TerracottaSection title="Education"><p style={{ fontSize: '12.5px', whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></TerracottaSection>}
        {renderFooter()}
      </div>
    );
  }

  // 9. INDIGO BOLD (Full accent bars, high readability block headings)
  if (template === 'indigo-bold') {
    return (
      <div id="resume-print-area" style={{
        background: '#ffffff', color: '#1a237e', fontFamily: "'Outfit', 'Segoe UI', sans-serif",
        padding: '48px 52px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #3f51b5', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#3f51b5', marginBottom: '4px' }}>{d.name}</h1>
            <div style={{ fontSize: '13px', color: '#7986cb', fontWeight: 700, textTransform: 'uppercase' }}>{d.profession}</div>
          </div>
          <div style={{ fontSize: '11px', color: '#5c6bc0', textAlign: 'right' }}>
            {d.email && <div>{d.email}</div>}
            {d.phone && <div>{d.phone}</div>}
          </div>
        </div>

        {d.summary && <IndigoSection title="Executive Summary"><p style={{ fontSize: '13px', color: '#222', margin: 0 }}>{d.summary}</p></IndigoSection>}
        {d.skills && (
          <IndigoSection title="Technical Skills">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {d.skills.split(/[,•\n]+/).filter(s => s.trim()).map((s, i) => (
                <span key={i} style={{ background: '#e8eaf6', borderRadius: '3px', padding: '3px 8px', fontSize: '11.5px', color: '#3f51b5', fontWeight: 600 }}>{s.trim()}</span>
              ))}
            </div>
          </IndigoSection>
        )}
        {(d.experienceEnhanced || d.experience) && (
          <IndigoSection title="Work Experience">
            {d.experienceEnhanced ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12.5px', color: '#222' }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
              </div>
            ) : <p style={{ fontSize: '12.5px', color: '#222' }}>{d.experience}</p>}
          </IndigoSection>
        )}
        {(d.projectsEnhanced || d.projects) && <IndigoSection title="Featured Projects"><p style={{ fontSize: '12.5px', color: '#222', whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></IndigoSection>}
        {d.education && <IndigoSection title="Education"><p style={{ fontSize: '12.5px', color: '#222', whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></IndigoSection>}
        {renderFooter()}
      </div>
    );
  }

  // 10. METRO GRID (Block grid structures for skills/education)
  if (template === 'metro-grid') {
    return (
      <div id="resume-print-area" style={{
        background: '#ffffff', color: '#333333', fontFamily: "'Segoe UI', sans-serif",
        padding: '48px 52px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6,
      }}>
        <div style={{ marginBottom: '22px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#111', marginBottom: '2px' }}>{d.name}</h1>
          <div style={{ fontSize: '14px', color: '#e67e22', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{d.profession}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '11px', color: '#7f8c8d' }}>
            {d.email && <span>📧 {d.email}</span>}
            {d.phone && <span>📞 {d.phone}</span>}
            {d.address && <span>📍 {d.address}</span>}
          </div>
        </div>

        {d.summary && <MetroSection title="Professional Summary"><p style={{ fontSize: '12.5px', margin: 0 }}>{d.summary}</p></MetroSection>}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '18px' }}>
          {d.skills && (
            <div style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '12px 15px' }}>
              <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#e67e22', letterSpacing: '0.05em', fontWeight: 800, marginBottom: '8px' }}>Core Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {d.skills.split(/[,•\n]+/).filter(s => s.trim()).map((s, i) => (
                  <span key={i} style={{ background: '#ffffff', border: '1px solid #dee2e6', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', color: '#495057', fontWeight: 600 }}>{s.trim()}</span>
                ))}
              </div>
            </div>
          )}
          {d.languages && (
            <div style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '12px 15px' }}>
              <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#e67e22', letterSpacing: '0.05em', fontWeight: 800, marginBottom: '8px' }}>Languages & Tools</h3>
              <p style={{ fontSize: '12px', margin: 0, fontWeight: 500 }}>{d.languages}</p>
            </div>
          )}
        </div>

        {(d.experienceEnhanced || d.experience) && (
          <MetroSection title="Experience">
            {d.experienceEnhanced ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12.5px' }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
              </div>
            ) : <p style={{ fontSize: '12.5px' }}>{d.experience}</p>}
          </MetroSection>
        )}
        {(d.projectsEnhanced || d.projects) && <MetroSection title="Projects"><p style={{ fontSize: '12.5px', whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></MetroSection>}
        {d.education && <MetroSection title="Education"><p style={{ fontSize: '12.5px', whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></MetroSection>}
        {renderFooter()}
      </div>
    );
  }

  // 11. CORPORATE NAVY (Professional dark navy top header banner)
  if (template === 'corporate-navy') {
    return (
      <div id="resume-print-area" style={{
        background: '#ffffff', color: '#2a2a2a', fontFamily: "'Segoe UI', Roboto, sans-serif",
        borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6, overflow: 'hidden'
      }}>
        {/* Navy Header Block */}
        <div style={{ background: '#1a365d', color: '#ffffff', padding: '35px 40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffffff', marginBottom: '2px' }}>{d.name}</h1>
          <div style={{ fontSize: '13px', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>{d.profession}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '11px', color: '#e2e8f0' }}>
            {d.email && <span>✉️ {d.email}</span>}
            {d.phone && <span>📞 {d.phone}</span>}
            {d.address && <span>📍 {d.address}</span>}
          </div>
        </div>

        <div style={{ padding: '35px 40px' }}>
          {d.summary && <NavySection title="Profile Overview"><p style={{ fontSize: '12.5px', margin: 0 }}>{d.summary}</p></NavySection>}
          {d.skills && (
            <NavySection title="Core Capabilities">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {d.skills.split(/[,•\n]+/).filter(s => s.trim()).map((s, i) => (
                  <span key={i} style={{ background: '#f0f4f8', border: '1px solid #cbd5e0', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', color: '#1a365d', fontWeight: 600 }}>{s.trim()}</span>
                ))}
              </div>
            </NavySection>
          )}
          {(d.experienceEnhanced || d.experience) && (
            <NavySection title="Work Experience">
              {d.experienceEnhanced ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12px' }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
                </div>
              ) : <p style={{ fontSize: '12px' }}>{d.experience}</p>}
            </NavySection>
          )}
          {(d.projectsEnhanced || d.projects) && <NavySection title="Accomplishments"><p style={{ fontSize: '12px', whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></NavySection>}
          {d.education && <NavySection title="Education"><p style={{ fontSize: '12px', whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></NavySection>}
          {renderFooter()}
        </div>
      </div>
    );
  }

  // 12. STARTUP CHIC (Outfit typography with gradient borders and initials badge)
  if (template === 'startup-chic') {
    return (
      <div id="resume-print-area" style={{
        background: '#ffffff', color: '#1e293b', fontFamily: "'Outfit', sans-serif",
        padding: '48px 52px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', marginBottom: '2px', letterSpacing: '-0.02em' }}>{d.name}</h1>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{d.profession}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', color: '#475569', textAlign: 'right' }}>
            {d.email && <span>{d.email}</span>}
            {d.phone && <span>{d.phone}</span>}
          </div>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #7b6fff, #00cfa8)', marginBottom: '22px' }} />

        {d.summary && <ChicSection title="Introduction"><p style={{ fontSize: '12.5px', color: '#334155', margin: 0 }}>{d.summary}</p></ChicSection>}
        {d.skills && (
          <ChicSection title="Skills Spectrum">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {d.skills.split(/[,•\n]+/).filter(s => s.trim()).map((s, i) => (
                <span key={i} style={{ background: 'rgba(123,111,255,0.06)', border: '1px solid rgba(123,111,255,0.15)', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', color: '#7b6fff', fontWeight: 600 }}>{s.trim()}</span>
              ))}
            </div>
          </ChicSection>
        )}
        {(d.experienceEnhanced || d.experience) && (
          <ChicSection title="Employment">
            {d.experienceEnhanced ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12.5px', color: '#334155' }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
              </div>
            ) : <p style={{ fontSize: '12.5px', color: '#334155' }}>{d.experience}</p>}
          </ChicSection>
        )}
        {(d.projectsEnhanced || d.projects) && <ChicSection title="Side Hustles & Projects"><p style={{ fontSize: '12.5px', color: '#334155', whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></ChicSection>}
        {d.education && <ChicSection title="Education"><p style={{ fontSize: '12.5px', color: '#334155', whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></ChicSection>}
        {renderFooter()}
      </div>
    );
  }

  // 13. PACIFIC BLUE (Bright ocean accents and categorized lists)
  if (template === 'pacific-blue') {
    return (
      <div id="resume-print-area" style={{
        background: '#ffffff', color: '#2c3e50', fontFamily: "'Segoe UI', Roboto, sans-serif",
        padding: '48px 52px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6,
      }}>
        <div style={{ borderBottom: '2px dashed #0077b6', paddingBottom: '16px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#0077b6', marginBottom: '2px' }}>{d.name}</h1>
          <div style={{ fontSize: '13px', color: '#00b4d8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.profession}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '11px', color: '#457b9d', marginTop: '8px' }}>
            {d.email && <span>{d.email}</span>}
            {d.phone && <span>· {d.phone}</span>}
          </div>
        </div>

        {d.summary && <PacificSection title="Summary"><p style={{ fontSize: '12.5px', margin: 0 }}>{d.summary}</p></PacificSection>}
        {d.skills && (
          <PacificSection title="Skills Inventory">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {d.skills.split(/[,•\n]+/).filter(s => s.trim()).map((s, i) => (
                <span key={i} style={{ background: '#caf0f8', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', color: '#03045e', fontWeight: 600 }}>{s.trim()}</span>
              ))}
            </div>
          </PacificSection>
        )}
        {(d.experienceEnhanced || d.experience) && (
          <PacificSection title="Professional Background">
            {d.experienceEnhanced ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12.5px' }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
              </div>
            ) : <p style={{ fontSize: '12.5px' }}>{d.experience}</p>}
          </PacificSection>
        )}
        {(d.projectsEnhanced || d.projects) && <PacificSection title="Key Ventures"><p style={{ fontSize: '12.5px', whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></PacificSection>}
        {d.education && <PacificSection title="Academics"><p style={{ fontSize: '12.5px', whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></PacificSection>}
        {renderFooter()}
      </div>
    );
  }

  // 14. CHARCOAL PREMIUM (Crisp left solid border, charcoal titles)
  if (template === 'charcoal-premium') {
    return (
      <div id="resume-print-area" style={{
        background: '#ffffff', color: '#2b2b2b', fontFamily: "'Outfit', sans-serif",
        padding: '48px 52px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6,
        borderLeft: '8px solid #333333'
      }}>
        <div style={{ marginBottom: '22px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111', marginBottom: '2px' }}>{d.name}</h1>
          <div style={{ fontSize: '13px', color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{d.profession}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '11px', color: '#666' }}>
            {d.email && <span>✉️ {d.email}</span>}
            {d.phone && <span>📞 {d.phone}</span>}
          </div>
        </div>

        {d.summary && <CharcoalSection title="Synopsys"><p style={{ fontSize: '12.5px', margin: 0 }}>{d.summary}</p></CharcoalSection>}
        {d.skills && (
          <CharcoalSection title="Expertise Area">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {d.skills.split(/[,•\n]+/).filter(s => s.trim()).map((s, i) => (
                <span key={i} style={{ background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '3px', padding: '3px 8px', fontSize: '11px', color: '#333', fontWeight: 600 }}>{s.trim()}</span>
              ))}
            </div>
          </CharcoalSection>
        )}
        {(d.experienceEnhanced || d.experience) && (
          <CharcoalSection title="Career Record">
            {d.experienceEnhanced ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12px' }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
              </div>
            ) : <p style={{ fontSize: '12px' }}>{d.experience}</p>}
          </CharcoalSection>
        )}
        {(d.projectsEnhanced || d.projects) && <CharcoalSection title="Projects Portfolio"><p style={{ fontSize: '12px', whiteSpace: 'pre-line', margin: 0 }}>{d.projectsEnhanced || d.projects}</p></CharcoalSection>}
        {d.education && <CharcoalSection title="Academic Path"><p style={{ fontSize: '12px', whiteSpace: 'pre-line', margin: 0 }}>{d.education}</p></CharcoalSection>}
        {renderFooter()}
      </div>
    );
  }

  // 15. DEFAULT: Modern Accent (Original Layout)
  return (
    <div id="resume-print-area" style={{
      background: '#fff', color: '#1a1a2e', fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      padding: '48px 52px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto',
      boxShadow: '0 4px 40px rgba(0,0,0,0.4)', lineHeight: 1.6,
    }}>
      <div style={{ borderBottom: '2px solid #7b6fff', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f0f23', marginBottom: '4px' }}>{d.name}</h1>
        <div style={{ fontSize: '14px', color: '#5a5a8f', fontWeight: 600, marginBottom: '12px' }}>{d.profession}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '11px', color: '#444' }}>
          {d.email && <a href={`mailto:${d.email}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#444', textDecoration: 'none' }}><Mail size={11} color="#7b6fff" /> {d.email}</a>}
          {d.phone && <a href={`tel:${d.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#444', textDecoration: 'none' }}><Phone size={11} color="#7b6fff" /> {d.phone}</a>}
          {d.address && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={11} color="#7b6fff" /> {d.address}</span>}
          {d.linkedin && <a href={d.linkedin.startsWith('http') ? d.linkedin : `https://${d.linkedin}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#444', textDecoration: 'none' }}><Linkedin size={11} color="#7b6fff" /> LinkedIn</a>}
          {d.portfolio && <a href={d.portfolio.startsWith('http') ? d.portfolio : `https://${d.portfolio}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#444', textDecoration: 'none' }}><Globe size={11} color="#7b6fff" /> Portfolio</a>}
          {d.github && <a href={d.github.startsWith('http') ? d.github : `https://github.com/${d.github}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#444', textDecoration: 'none' }}><Github size={11} color="#7b6fff" /> GitHub</a>}
        </div>
      </div>

      {d.summary && <Section title="Professional Summary"><p style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.8, marginBottom: 0 }}>{d.summary}</p></Section>}
      {d.skills && (
        <Section title="Core Skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {d.skills.split(/[,•\n]+/).filter(s => s.trim()).map((skill, i) => (
              <span key={i} style={{ background: 'rgba(123,111,255,0.08)', border: '1px solid rgba(123,111,255,0.2)', borderRadius: '4px', padding: '3px 10px', fontSize: '11px', color: '#5a5a8f', fontWeight: 500 }}>{skill.trim()}</span>
            ))}
          </div>
        </Section>
      )}
      {(d.experienceEnhanced || d.experience) && (
        <Section title="Work Experience">
          {d.experienceEnhanced ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {parseLines(d.experienceEnhanced).map((line, i) => <div key={i} style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.7 }}>{line.startsWith('•') ? line : `• ${line}`}</div>)}
            </div>
          ) : <p style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.7 }}>{d.experience}</p>}
        </Section>
      )}
      {(d.projectsEnhanced || d.projects) && <Section title="Projects"><p style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{d.projectsEnhanced || d.projects}</p></Section>}
      {d.education && <Section title="Education"><p style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{d.education}</p></Section>}
      {d.certifications && <Section title="Certifications"><CertificationList text={d.certifications} /></Section>}
      {d.achievements && <Section title="Achievements"><p style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{d.achievements}</p></Section>}
      {d.languages && (
        <Section title="Languages">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {d.languages.split(/[,•\n]+/).filter(s => s.trim()).map((lang, i) => (
              <span key={i} style={{ fontSize: '12px', color: '#333' }}>{lang.trim()}{i < d.languages.split(/[,•\n]+/).filter(s => s.trim()).length - 1 ? ' |' : ''}</span>
            ))}
          </div>
        </Section>
      )}
      {renderFooter()}
    </div>
  );
}

// ── Shared Subcomponents & Helpers ───────────────────────────────────────────

function parseCertifications(text) {
  if (!text) return [];
  const entries = text.split(/\n|(?<!\bhttps?:),/).map(s => s.trim()).filter(Boolean);
  const URL_RE = /https?:\/\/[^\s,)>\]]+/i;

  return entries.map(entry => {
    const match = entry.match(URL_RE);
    if (match) {
      const url = match[0];
      const name = entry.replace(/[-–—|:]\s*https?:\/\/[^\s,)>\]]+/i, '').replace(URL_RE, '').trim();
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

function CertificationList({ text, classic = false, elegant = false, sidebar = false }) {
  const certs = parseCertifications(text);

  if (classic) {
    return (
      <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#222' }}>
        {certs.map((cert, i) => (
          <li key={i} style={{ marginBottom: '4px' }}>
            <span>🏅 {cert.name}</span>
            {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" style={{ marginLeft: '8px', color: '#0056b3', textDecoration: 'underline', fontSize: '11px' }}>[Link]</a>}
          </li>
        ))}
      </ul>
    );
  }

  if (sidebar) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {certs.map((cert, i) => (
          <div key={i} style={{ fontSize: '10.5px', color: '#455a64', lineHeight: 1.4 }}>
            <span>🏅 {cert.name}</span>
            {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" style={{ display: 'block', color: '#2980b9', textDecoration: 'none', fontWeight: 600, fontSize: '9.5px', marginTop: '2px' }}>Verify Credentials ↗</a>}
          </div>
        ))}
      </div>
    );
  }

  const border = elegant ? '1px solid rgba(30,61,89,0.15)' : '1px solid rgba(123,111,255,0.12)';
  const bg = elegant ? 'rgba(30,61,89,0.03)' : 'rgba(123,111,255,0.04)';
  const linkColor = elegant ? '#1e3d59' : '#7b6fff';
  const linkBg = elegant ? 'rgba(30,61,89,0.08)' : 'rgba(123,111,255,0.1)';
  const linkBorder = elegant ? '1px solid rgba(30,61,89,0.2)' : '1px solid rgba(123,111,255,0.25)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {certs.map((cert, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', padding: '5px 10px', background: bg, border: border, borderRadius: '5px' }}>
          <span style={{ fontSize: '12px', color: '#333', fontWeight: 500, flex: 1 }}>🏅 {cert.name}</span>
          {cert.url && <a href={cert.url} target="_blank" rel="noreferrer noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: linkColor, fontWeight: 700, textDecoration: 'none', padding: '2px 8px', borderRadius: '20px', background: linkBg, border: linkBorder, whiteSpace: 'nowrap', fontFamily: "'Outfit', sans-serif" }}>View Certificate <ExternalLink size={9} /></a>}
        </div>
      ))}
    </div>
  );
}

// ── Layout Specific Headers/Sections ─────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7b6fff', borderBottom: '1px solid #e8e8f8', paddingBottom: '4px', marginBottom: '10px', fontFamily: 'JetBrains Mono, monospace' }}>{title}</div>
      {children}
    </div>
  );
}

function ClassicSection({ title, children }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0f0f23', borderBottom: '1px solid #1a1a2e', paddingBottom: '2px', marginBottom: '8px', letterSpacing: '0.05em' }}>{title}</div>
      {children}
    </div>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#2c3e50', letterSpacing: '0.08em', borderBottom: '1.5px solid #2c3e50', paddingBottom: '3px', marginBottom: '8px' }}>{title}</div>
      {children}
    </div>
  );
}

function SidebarHeader({ title, dark = false }) {
  return (
    <div style={{
      fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
      color: dark ? '#cbd5e0' : '#1a1a2e', letterSpacing: '0.08em',
      borderBottom: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #bdc3c7',
      paddingBottom: '4px', marginBottom: '8px'
    }}>{title}</div>
  );
}

function ElegantSection({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1e3d59', borderBottom: '1px solid rgba(30,61,89,0.2)', paddingBottom: '4px', marginBottom: '10px' }}>✦ {title}</div>
      {children}
    </div>
  );
}

function StarkSection({ title, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '8px' }}>{title}</div>
      {children}
    </div>
  );
}

function TealSection({ title, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#004d40', borderBottom: '1px solid rgba(0,128,128,0.2)', paddingBottom: '3px', marginBottom: '8px' }}>// {title}</div>
      {children}
    </div>
  );
}

function HarvardSection({ title, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '0.5px solid #000', paddingBottom: '2px', marginBottom: '6px' }}>{title}</div>
      {children}
    </div>
  );
}

function TerracottaSection({ title, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#c05c46', borderBottom: '1px solid rgba(192,92,70,0.2)', paddingBottom: '3px', marginBottom: '8px' }}>{title}</div>
      {children}
    </div>
  );
}

function IndigoSection({ title, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', background: '#3f51b5', color: '#fff', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px' }}>{title}</div>
      {children}
    </div>
  );
}

function MetroSection({ title, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#111', borderLeft: '3px solid #e67e22', paddingLeft: '8px', marginBottom: '8px' }}>{title}</div>
      {children}
    </div>
  );
}

function NavySection({ title, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#1a365d', borderBottom: '2px solid #1a365d', paddingBottom: '3px', marginBottom: '8px' }}>{title}</div>
      {children}
    </div>
  );
}

function ChicSection({ title, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.05em', marginBottom: '8px' }}>{title}</div>
      {children}
    </div>
  );
}

function PacificSection({ title, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0077b6', borderLeft: '4px solid #0077b6', paddingLeft: '8px', marginBottom: '8px' }}>{title}</div>
      {children}
    </div>
  );
}

function CharcoalSection({ title, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#333333', borderBottom: '1px solid #cccccc', paddingBottom: '3px', marginBottom: '8px' }}>{title}</div>
      {children}
    </div>
  );
}
