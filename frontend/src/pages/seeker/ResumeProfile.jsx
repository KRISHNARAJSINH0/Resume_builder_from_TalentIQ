import React, { createContext, useContext, useMemo } from 'react';
import useResumeBuilder from '../../hooks/useResumeBuilder';
import ProfessionPicker from '../../components/resume/ProfessionPicker';
import ResumeChat from '../../components/resume/ResumeChat';
import ResumeOutput from '../../components/resume/ResumeOutput';
import { Wand2, AlertCircle, RotateCcw } from 'lucide-react';

// ── Resume Context (consumed by TalentIQAssistant in SeekerLayout) ──────────
export const ResumeContext = createContext({});
export function useResumeContext() { return useContext(ResumeContext); }

export default function ResumeProfile() {
  const {
    phase, profession, questions, currentQIndex, chatHistory,
    answers, loading, generatingStep, error,
    resumeData, gapData, interviewPrepData, portfolioData,
    activeTab, jobMatchData, jobMatchLoading,
    publicResumeId, publicResumeUrl, resumeSaveStatus,
    selectProfession, submitAnswer, skipQuestion,
    runJobMatch, restart, setActiveTab, printResume,
  } = useResumeBuilder();

  // Build context object for TalentIQ Assistant
  const resumeContext = useMemo(() => ({
    phase,
    profession,
    resumeData,
    gapData,
    answers,
  }), [phase, profession, resumeData, gapData, answers]);

  return (
    <ResumeContext.Provider value={resumeContext}>
    <div>
      {/* ── PHASE: PROFESSION SELECTION ─────────────────────────────── */}
      {phase === 'profession_select' && (
        <ProfessionPicker onSelect={selectProfession} loading={loading} />
      )}

      {/* ── Loading overlay while fetching questions ─────────────────── */}
      {phase === 'profession_select' && loading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(7,7,14,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '1rem',
        }}>
          <div style={{ fontSize: '32px' }}>{profession?.icon}</div>
          <div className="spinner" />
          <p style={{ color: 'var(--v)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            Generating interview questions for {profession?.label}...
          </p>
        </div>
      )}

      {/* ── PHASE: INTERVIEW ─────────────────────────────────────────── */}
      {phase === 'interview' && (
        <ResumeChat
          profession={profession}
          questions={questions}
          currentQIndex={currentQIndex}
          chatHistory={chatHistory}
          onSubmit={submitAnswer}
          onSkip={skipQuestion}
          loading={loading}
        />
      )}

      {/* ── PHASE: GENERATING ────────────────────────────────────────── */}
      {phase === 'generating' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', gap: '2rem',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, var(--v), var(--t))',
              borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(123,111,255,0.3)',
              animation: 'pulse 2s ease infinite',
            }}>
              <Wand2 size={36} style={{ color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
              Building Your Resume
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '2rem' }}>
              Our AI is crafting your professional package — this takes about 30 seconds.
            </p>

            {/* Generating Step */}
            <div style={{
              background: 'var(--s2)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '12px 24px',
              fontFamily: 'var(--font-mono)', fontSize: '12px',
              color: 'var(--v)', display: 'inline-flex', alignItems: 'center', gap: '10px',
            }}>
              <div className="spinner-sm" />
              {generatingStep || 'Initializing AI pipeline...'}
            </div>
          </div>

          {/* Phase progress indicators */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              'Summary', 'Experience', 'Projects',
              'Skill Gap', 'Interview Prep', 'Portfolio',
            ].map((step, i) => (
              <div key={step} style={{
                padding: '4px 10px',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)',
              }}>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PHASE: RESULTS ───────────────────────────────────────────── */}
      {phase === 'results' && (
        <ResumeOutput
          resumeData={resumeData}
          gapData={gapData}
          interviewPrepData={interviewPrepData}
          portfolioData={portfolioData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRestart={restart}
          onPrint={printResume}
          onJobMatch={runJobMatch}
          jobMatchData={jobMatchData}
          jobMatchLoading={jobMatchLoading}
          publicResumeId={publicResumeId}
          publicResumeUrl={publicResumeUrl}
          resumeSaveStatus={resumeSaveStatus}
        />
      )}

      {/* ── ERROR STATE ──────────────────────────────────────────────── */}
      {error && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)',
          borderRadius: '10px', padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          maxWidth: '380px', zIndex: 9999,
        }}>
          <AlertCircle size={16} style={{ color: 'var(--r)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--r)', marginBottom: '4px' }}>
              AI Error
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>{error}</div>
            <button onClick={restart} className="btn" style={{ marginTop: '8px', gap: '5px', fontSize: '11px' }}>
              <RotateCcw size={11} /> Restart
            </button>
          </div>
        </div>
      )}
    </div>
    </ResumeContext.Provider>
  );
}
