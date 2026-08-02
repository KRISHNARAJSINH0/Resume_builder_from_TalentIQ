import React, { useState, useRef, useEffect } from 'react';
import { Send, SkipForward, User, Sparkles, ChevronRight, Upload, File, Loader, Trash2, Plus, AlertCircle } from 'lucide-react';
import { PROFESSIONS } from '../../hooks/useResumeBuilder';
import { parseCertificateText } from '../../api/resumeAPI';

export default function ResumeChat({
  profession, questions, currentQIndex, chatHistory,
  onSubmit, onSkip, loading,
}) {
  const [inputValue, setInputValue] = useState('');
  const [uploadedCerts, setUploadedCerts] = useState([]);
  const [uploadingCert, setUploadingCert] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const currentQ = questions[currentQIndex];
  const progress = questions.length > 0
    ? Math.round((currentQIndex / questions.length) * 100)
    : 0;
  const isOptional = currentQ && !currentQ.required;

  const currentQId = (currentQ?.id || '').toLowerCase();
  const currentQText = (currentQ?.question || '').toLowerCase();

  const isWorkExpQuestion = currentQId === 'work_experiences' || currentQId === 'work_experience' || currentQId === 'experience' || (currentQText.includes('work experience') || currentQText.includes('employment history'));
  const isEducationQuestion = currentQId === 'educations' || currentQId === 'education' || (currentQText.includes('education') || currentQText.includes('academic'));
  const isProjectQuestion = currentQId === 'projects' || currentQId === 'project' || (currentQText.includes('project') && !currentQId.includes('certif'));

  // Check if current question is about certifications
  const isCertQuestion = currentQ && (
    currentQId.includes('certificat') ||
    currentQText.includes('certificat') ||
    currentQText.includes('credentials')
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (!loading && !isWorkExpQuestion && !isEducationQuestion && !isProjectQuestion) {
      inputRef.current?.focus();
    }
    setUploadedCerts([]);
  }, [currentQIndex, loading, isWorkExpQuestion, isEducationQuestion, isProjectQuestion]);

  const updateCertField = (idx, field, value) => {
    setUploadedCerts(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const certLines = uploadedCerts.map(c => {
      const parts = [c.name.trim()];
      if (c.issuer.trim()) parts.push(c.issuer.trim());
      const line = parts.join(' — ');
      let entry = c.issue_date.trim() ? `• ${line} (${c.issue_date.trim()})` : `• ${line}`;
      // ONLY use credential_url if it's a real external URL (not a blob:// local file URL)
      const link = c.credential_url && c.credential_url.trim() && !c.credential_url.startsWith('blob:')
        ? c.credential_url.trim()
        : '';
      if (link) entry += ` – ${link}`;
      return entry;
    });


    let finalAnswer = inputValue.trim();
    if (certLines.length > 0) {
      const certsString = certLines.join('\n');
      finalAnswer = finalAnswer ? `${finalAnswer}\n${certsString}` : certsString;
    }

    if (!finalAnswer && !isOptional) return;

    onSubmit(finalAnswer);
    setInputValue('');
    setUploadedCerts([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getSuggestions = () => {
    if (!currentQ) return [];
    let list = currentQ.suggestions || [];
    const qText = currentQ.question?.toLowerCase() || '';
    const qId = currentQ.id?.toLowerCase() || '';
    if (qId.includes('role') || qText.includes('role') || qId.includes('profession') || qText.includes('profession') || qText.includes('career')) {
      const allProfLabels = PROFESSIONS.map(p => p.label);
      list = [...new Set([...list, ...allProfLabels])];
    }
    return list;
  };

  const handleSuggestionClick = (sug) => {
    const qId = currentQ?.id?.toLowerCase() || '';
    const qText = currentQ?.question?.toLowerCase() || '';
    const isList = qId.includes('skills') || qId.includes('frameworks') || qId.includes('databases') || qId.includes('languages') || qText.includes('skills') || qText.includes('languages');

    if (isList) {
      setInputValue(prev => {
        const trimmed = prev.trim();
        if (!trimmed) return sug;
        if (trimmed.endsWith(',')) return `${prev} ${sug}`;
        return `${prev}, ${sug}`;
      });
    } else {
      setInputValue(sug);
    }
    inputRef.current?.focus();
  };

  const handleCertUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingCert(true);
    try {
      const uploaded = [];

      for (const file of files) {
        // Read file as text if possible (for PDFs just use filename)
        let textContent = file.name;
        if (file.type === 'text/plain') {
          try {
            textContent = await file.text();
          } catch {
            textContent = file.name;
          }
        }

        // Use Groq AI to parse certificate details from filename/text
        const parseResult = await parseCertificateText(textContent).catch(() => ({
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          issuer: '',
          issue_date: '',
        }));

        // Create a local object URL for preview
        const localUrl = URL.createObjectURL(file);

        uploaded.push({
          id: Math.random().toString(36).substring(2, 9),
          filename: file.name,
          url: localUrl,
          credential_url: '',
          name: parseResult.name || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          issuer: parseResult.issuer || '',
          issue_date: parseResult.issue_date || '',
        });
      }
      setUploadedCerts(prev => [...prev, ...uploaded]);
    } catch (err) {
      console.error(err);
      alert('Failed to process certificate file. Please try again.');
    } finally {
      setUploadingCert(false);
    }
  };


  const removeCert = (idxToRemove) => {
    setUploadedCerts(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const suggestionChips = getSuggestions();

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      {/* Header with profession + progress */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span className="eyebrow">AI Recruiter Interview</span>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
              {profession.icon} {profession.label} Resume Builder
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge bp">
              Q{currentQIndex + 1} / {questions.length}
            </span>
            <span className="badge bg">{progress}% complete</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '4px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--v), var(--t))',
            borderRadius: '2px',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Chat Window */}
      <div className="card glass" style={{
        minHeight: '380px', maxHeight: '480px',
        overflowY: 'auto', padding: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '16px',
        marginBottom: '1rem',
      }}>
        {chatHistory.map((msg, idx) => (
          <ChatBubble key={idx} role={msg.role} text={msg.text} />
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--v)' }}>
            <TypingIndicator />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestion Chips Panel */}
      {!loading && currentQ && !isWorkExpQuestion && !isEducationQuestion && !isProjectQuestion && suggestionChips.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)',
            color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase',
          }}>
            Suggestions for this field:
          </div>
          <div style={{
            display: 'flex', gap: '6px', flexWrap: 'nowrap', overflowX: 'auto',
            paddingBottom: '6px', scrollbarWidth: 'thin',
          }}>
            {suggestionChips.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestionClick(sug)}
                className="chip btn-secondary"
                style={{
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  fontSize: '11px',
                  background: 'var(--s2)',
                  color: 'var(--text)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={10} style={{ color: 'var(--v)' }} />
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      {!loading && currentQ && (
        <div className="card glass" style={{ padding: '1.25rem' }}>
          <div style={{
            fontSize: '13px', color: 'var(--text)', fontWeight: 600,
            marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <ChevronRight size={15} style={{ color: 'var(--v)' }} />
            {currentQ.question}
            {isOptional && (
              <span className="badge ba" style={{ marginLeft: '6px' }}>Optional</span>
            )}
          </div>

          {/* Structured Input Form: Work Experience */}
          {isWorkExpQuestion ? (
            <WorkExperienceForm
              onSubmit={onSubmit}
              isOptional={isOptional}
              onSkip={onSkip}
              defaultRole={profession?.label || ''}
            />
          ) : isEducationQuestion ? (
            /* Structured Input Form: Education */
            <EducationForm
              onSubmit={onSubmit}
              isOptional={isOptional}
              onSkip={onSkip}
            />
          ) : isProjectQuestion ? (
            /* Structured Input Form: Projects */
            <ProjectsForm
              onSubmit={onSubmit}
              isOptional={isOptional}
              onSkip={onSkip}
            />
          ) : (
            /* Free-Text / Certificate Input Area */
            <>
              {isCertQuestion && (
                <div style={{
                  border: '2px dashed var(--border)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.01)',
                  position: 'relative',
                  marginBottom: '12px',
                  transition: 'all 0.2s ease',
                }}>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleCertUpload}
                    style={{
                      position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer',
                    }}
                  />
                  {uploadingCert ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Loader className="animate-spin" size={24} style={{ color: 'var(--v)' }} />
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Analyzing certificate file...</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <Upload size={24} style={{ color: 'var(--muted)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Click or Drag Certificates here</span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Supports PDF, PNG, JPG (Max 5MB)</span>
                    </div>
                  )}
                </div>
              )}

              {uploadedCerts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--g)', fontWeight: 600 }}>
                    ✓ Uploaded Certificates ({uploadedCerts.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {uploadedCerts.map((cert, idx) => (
                      <div key={cert.id} style={{
                        background: 'var(--s2)', border: '1px solid var(--border)',
                        borderRadius: '8px', padding: '12px',
                        display: 'flex', flexDirection: 'column', gap: '8px',
                      }}>
                        <div className="flex-between" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            <File size={11} color="var(--g)" /> {cert.filename}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCert(idx)}
                            style={{
                              background: 'transparent', border: 'none', color: 'var(--r)',
                              cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginBottom: '3px' }}>Certificate Name</label>
                            <input
                              className="form-input"
                              value={cert.name}
                              onChange={e => updateCertField(idx, 'name', e.target.value)}
                              style={{ fontSize: '11px', padding: '5px 8px', background: 'var(--s1)' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginBottom: '3px' }}>Issuer (e.g. Coursera)</label>
                            <input
                              className="form-input"
                              value={cert.issuer}
                              onChange={e => updateCertField(idx, 'issuer', e.target.value)}
                              style={{ fontSize: '11px', padding: '5px 8px', background: 'var(--s1)' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginBottom: '3px' }}>Issue Year (e.g. 2025)</label>
                            <input
                              className="form-input"
                              value={cert.issue_date}
                              placeholder="YYYY"
                              onChange={e => updateCertField(idx, 'issue_date', e.target.value)}
                              style={{ fontSize: '11px', padding: '5px 8px', background: 'var(--s1)' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginBottom: '3px' }}>🔗 Credential Link (optional)</label>
                            <input
                              className="form-input"
                              value={cert.credential_url || ''}
                              placeholder="https://credly.com/badges/..."
                              onChange={e => updateCertField(idx, 'credential_url', e.target.value)}
                              style={{ fontSize: '11px', padding: '5px 8px', background: 'var(--s1)' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                <textarea
                  ref={inputRef}
                  className="form-input"
                  placeholder={
                    isCertQuestion
                      ? 'e.g. AWS Cloud Practitioner – https://credly.com/badges/xyz\nOr just type names if no link available'
                      : currentQ.placeholder || 'Type your answer...'
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  style={{
                    flex: 1, resize: 'none', lineHeight: '1.5',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1.25rem', height: '100%' }}
                    disabled={!inputValue.trim() && uploadedCerts.length === 0 && !isOptional}
                  >
                    <Send size={14} />
                  </button>
                  {isOptional && (
                    <button
                      type="button"
                      className="btn"
                      style={{ padding: '0.5rem', fontSize: '10px' }}
                      onClick={onSkip}
                      title="Skip optional question"
                    >
                      <SkipForward size={13} />
                    </button>
                  )}
                </div>
              </form>

              <div style={{
                marginTop: '8px', fontSize: '10px', color: 'var(--muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                Press <kbd style={{
                  background: 'var(--s2)', border: '1px solid var(--border)',
                  borderRadius: '3px', padding: '1px 5px', fontSize: '9px',
                }}>Enter</kbd> to send &nbsp;·&nbsp;
                <kbd style={{
                  background: 'var(--s2)', border: '1px solid var(--border)',
                  borderRadius: '3px', padding: '1px 5px', fontSize: '9px',
                }}>Shift+Enter</kbd> for new line
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED FORM: WORK EXPERIENCE
// ─────────────────────────────────────────────────────────────────────────────
function WorkExperienceForm({ onSubmit, isOptional, onSkip, defaultRole }) {
  const [items, setItems] = useState([
    { role: defaultRole || '', company: '', start_date: '', end_date: '', is_current: false, description: '' }
  ]);
  const [error, setError] = useState('');

  const updateItem = (index, field, value) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    setError('');
  };

  const addItem = () => {
    setItems(prev => [...prev, { role: '', company: '', start_date: '', end_date: '', is_current: false, description: '' }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Please add at least one work experience entry.');
      return;
    }

    if (isOptional && items.length === 1) {
      const item = items[0];
      const hasContent = item.company.trim() ||
                         item.start_date.trim() ||
                         item.description.trim() ||
                         (item.role.trim() && item.role !== (defaultRole || ''));
      if (!hasContent) {
        onSubmit([]);
        return;
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.role.trim()) {
        setError(`Job title / role is required for position #${i + 1}.`);
        return;
      }
      if (!item.company.trim()) {
        setError(`Company name is required for position #${i + 1}.`);
        return;
      }
      if (!item.start_date.trim()) {
        setError(`Start date is required for position #${i + 1}.`);
        return;
      }
      if (!item.is_current && !item.end_date.trim()) {
        setError(`End date (or 'Currently work here') is required for position #${i + 1}.`);
        return;
      }
    }

    onSubmit(items);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {error && (
        <div style={{
          background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)',
          borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: 'var(--r)',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {items.map((item, index) => (
        <div key={index} style={{
          background: 'var(--s2)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--v)' }}>
              Position #{index + 1}
            </span>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={{ background: 'none', border: 'none', color: 'var(--r)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Job Title / Role <span style={{ color: 'var(--r)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Software Engineer"
                value={item.role}
                onChange={e => updateItem(index, 'role', e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Company Name <span style={{ color: 'var(--r)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Google"
                value={item.company}
                onChange={e => updateItem(index, 'company', e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Start Date <span style={{ color: 'var(--r)' }}>*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={item.start_date}
                onChange={e => updateItem(index, 'start_date', e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600 }}>
                  End Date {!item.is_current && <span style={{ color: 'var(--r)' }}>*</span>}
                </label>
                {item.is_current && (
                  <span 
                    onClick={() => updateItem(index, 'is_current', false)}
                    style={{ fontSize: '10px', color: 'var(--v)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Set Date
                  </span>
                )}
              </div>
              <div
                onClick={() => {
                  if (item.is_current) {
                    updateItem(index, 'is_current', false);
                  }
                }}
                style={{ cursor: item.is_current ? 'pointer' : 'default' }}
                title={item.is_current ? 'Click to uncheck "I currently work here" and enter End Date' : ''}
              >
                <input
                  type="date"
                  className="form-input"
                  disabled={item.is_current}
                  value={item.is_current ? '' : item.end_date}
                  onChange={e => updateItem(index, 'end_date', e.target.value)}
                  style={{
                    fontSize: '12px',
                    padding: '6px 10px',
                    opacity: item.is_current ? 0.5 : 1,
                    pointerEvents: item.is_current ? 'none' : 'auto',
                    cursor: item.is_current ? 'pointer' : 'text'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id={`current-job-${index}`}
              checked={item.is_current}
              onChange={e => updateItem(index, 'is_current', e.target.checked)}
              style={{ accentColor: 'var(--v)', cursor: 'pointer' }}
            />
            <label htmlFor={`current-job-${index}`} style={{ fontSize: '11px', color: 'var(--muted)', cursor: 'pointer' }}>
              I currently work here (Present)
            </label>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Key Responsibilities & Achievements
            </label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g. Architected microservices pipeline reducing latency by 40%..."
              value={item.description}
              onChange={e => updateItem(index, 'description', e.target.value)}
              style={{ fontSize: '12px', padding: '6px 10px', resize: 'vertical' }}
            />
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button
          type="button"
          onClick={addItem}
          className="btn"
          style={{ fontSize: '11px', padding: '6px 12px', border: '1px dashed var(--v)', color: 'var(--v)' }}
        >
          <Plus size={12} /> Add another job
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isOptional && (
            <button type="button" onClick={onSkip} className="btn" style={{ fontSize: '11px', padding: '8px 14px' }}>
              Skip Section
            </button>
          )}
          <button type="submit" className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 18px' }}>
            Save & Continue <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED FORM: EDUCATION
// ─────────────────────────────────────────────────────────────────────────────
function EducationForm({ onSubmit, isOptional, onSkip }) {
  const [items, setItems] = useState([
    { degree: '', specialization: '', institution: '', start_year: '', end_year: '', percentage_or_cgpa: '' }
  ]);
  const [error, setError] = useState('');

  const updateItem = (index, field, value) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    setError('');
  };

  const addItem = () => {
    setItems(prev => [...prev, { degree: '', specialization: '', institution: '', start_year: '', end_year: '', percentage_or_cgpa: '' }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Please add at least one education entry.');
      return;
    }

    if (isOptional && items.length === 1) {
      const item = items[0];
      const hasContent = item.degree.trim() ||
                         item.specialization.trim() ||
                         item.institution.trim() ||
                         item.start_year.trim() ||
                         item.end_year.trim() ||
                         item.percentage_or_cgpa.trim();
      if (!hasContent) {
        onSubmit([]);
        return;
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.degree.trim()) {
        setError(`Degree / Qualification is required for education entry #${i + 1}.`);
        return;
      }
      if (!item.institution.trim()) {
        setError(`Institution / University is required for education entry #${i + 1}.`);
        return;
      }
    }

    onSubmit(items);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {error && (
        <div style={{
          background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)',
          borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: 'var(--r)',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {items.map((item, index) => (
        <div key={index} style={{
          background: 'var(--s2)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--v)' }}>
              Education #{index + 1}
            </span>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={{ background: 'none', border: 'none', color: 'var(--r)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Degree / Qualification <span style={{ color: 'var(--r)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Bachelor of Technology"
                value={item.degree}
                onChange={e => updateItem(index, 'degree', e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Specialization / Field
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science"
                value={item.specialization}
                onChange={e => updateItem(index, 'specialization', e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Institution / University <span style={{ color: 'var(--r)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Indian Institute of Technology Delhi"
              value={item.institution}
              onChange={e => updateItem(index, 'institution', e.target.value)}
              style={{ fontSize: '12px', padding: '6px 10px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Start Year
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 2018"
                value={item.start_year}
                onChange={e => updateItem(index, 'start_year', e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                End / Graduation Year
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 2022"
                value={item.end_year}
                onChange={e => updateItem(index, 'end_year', e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                CGPA / Percentage
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 8.8 CGPA"
                value={item.percentage_or_cgpa}
                onChange={e => updateItem(index, 'percentage_or_cgpa', e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button
          type="button"
          onClick={addItem}
          className="btn"
          style={{ fontSize: '11px', padding: '6px 12px', border: '1px dashed var(--v)', color: 'var(--v)' }}
        >
          <Plus size={12} /> Add another education
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isOptional && (
            <button type="button" onClick={onSkip} className="btn" style={{ fontSize: '11px', padding: '8px 14px' }}>
              Skip Section
            </button>
          )}
          <button type="submit" className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 18px' }}>
            Save & Continue <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED FORM: PROJECTS
// ─────────────────────────────────────────────────────────────────────────────
function ProjectsForm({ onSubmit, isOptional, onSkip }) {
  const [items, setItems] = useState([
    { project_name: '', technologies: '', github_link: '', live_link: '', description: '' }
  ]);
  const [error, setError] = useState('');

  const updateItem = (index, field, value) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    setError('');
  };

  const addItem = () => {
    setItems(prev => [...prev, { project_name: '', technologies: '', github_link: '', live_link: '', description: '' }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Please add at least one project entry.');
      return;
    }

    if (isOptional && items.length === 1) {
      const item = items[0];
      const hasContent = item.project_name.trim() ||
                         item.technologies.trim() ||
                         item.github_link.trim() ||
                         item.live_link.trim() ||
                         item.description.trim();
      if (!hasContent) {
        onSubmit([]);
        return;
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.project_name.trim()) {
        setError(`Project title is required for project entry #${i + 1}.`);
        return;
      }
    }

    onSubmit(items);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {error && (
        <div style={{
          background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)',
          borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: 'var(--r)',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {items.map((item, index) => (
        <div key={index} style={{
          background: 'var(--s2)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--v)' }}>
              Project #{index + 1}
            </span>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={{ background: 'none', border: 'none', color: 'var(--r)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Project Title <span style={{ color: 'var(--r)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. AI Resume Builder"
                value={item.project_name}
                onChange={e => updateItem(index, 'project_name', e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Technologies Used
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. React, Django, PostgreSQL"
                value={item.technologies}
                onChange={e => updateItem(index, 'technologies', e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                GitHub Repository Link (Optional)
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/username/project"
                value={item.github_link}
                onChange={e => updateItem(index, 'github_link', e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Live Demo Link (Optional)
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://myproject.com"
                value={item.live_link}
                onChange={e => updateItem(index, 'live_link', e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Description & Key Features
            </label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g. Developed real-time collaborative resume editor..."
              value={item.description}
              onChange={e => updateItem(index, 'description', e.target.value)}
              style={{ fontSize: '12px', padding: '6px 10px', resize: 'vertical' }}
            />
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button
          type="button"
          onClick={addItem}
          className="btn"
          style={{ fontSize: '11px', padding: '6px 12px', border: '1px dashed var(--v)', color: 'var(--v)' }}
        >
          <Plus size={12} /> Add another project
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isOptional && (
            <button type="button" onClick={onSkip} className="btn" style={{ fontSize: '11px', padding: '8px 14px' }}>
              Skip Section
            </button>
          )}
          <button type="submit" className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 18px' }}>
            Save & Continue <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Chat Bubble ────────────────────────────────────────────────────────────
function ChatBubble({ role, text }) {
  const isAI = role === 'ai';
  const formattedText = typeof text === 'string'
    ? text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: 'var(--text)' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })
    : String(text);

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      flexDirection: isAI ? 'row' : 'row-reverse',
      animation: 'fadeIn 0.25s ease',
    }}>
      <div style={{
        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isAI
          ? 'linear-gradient(135deg, #0ea5e9, #6366f1)'
          : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
        border: isAI ? '1.5px solid rgba(14,165,233,0.4)' : '1.5px solid rgba(14,165,233,0.5)',
        boxShadow: '0 2px 10px rgba(14,165,233,0.25)',
      }}>
        {isAI
          ? <Sparkles size={13} style={{ color: '#fff' }} />
          : <User size={13} style={{ color: '#fff' }} />}
      </div>

      <div style={{
        maxWidth: '75%',
        background: isAI ? 'var(--s1)' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
        border: `1px solid ${isAI ? 'var(--border)' : 'transparent'}`,
        borderRadius: isAI ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
        padding: '10px 14px',
        fontSize: '13px',
        lineHeight: '1.6',
        color: isAI ? 'var(--text)' : '#ffffff',
        wordBreak: 'break-word',
        whiteSpace: 'pre-line',
        boxShadow: isAI
          ? '0 2px 8px rgba(14,165,233,0.06)'
          : '0 4px 16px rgba(14,165,233,0.35)',
      }}>
        {formattedText}
      </div>
    </div>
  );
}

// ─── Typing Indicator ───────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <div style={{
        width: '30px', height: '30px', borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--v), var(--t))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Sparkles size={13} style={{ color: '#fff' }} />
      </div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--v)',
            animation: `bounce 1.2s ease infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}
