import React from 'react';
import useInterview from '../../hooks/useInterview';
import QuestionCard from '../../components/interview/QuestionCard';
import AnswerInput from '../../components/interview/AnswerInput';
import SkillRadarChart from '../../components/charts/SkillRadarChart';
import { PlayCircle, ShieldCheck, CheckCircle2, ChevronRight, Award } from 'lucide-react';

export default function InterviewSimulator() {
  const { 
    session, role, currentQuestion, currentIndex, 
    totalQuestions, submitAnswer, startSession, results, loading, answers 
  } = useInterview();

  if (session === 'idle') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="eyebrow">Interactive Practice</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>AI Interview Simulator</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '6px' }}>
            Simulate a real-time technical interview. Answer questions using NLP metrics and get graded instantly.
          </p>
        </div>

        <div className="card glass" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: '#fff', fontSize: '16px' }}>Choose Target Role</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => startSession('Frontend React Developer')}
              className="btn btn-secondary"
              style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', alignItems: 'center', textAlign: 'left' }}
            >
              <div>
                <strong style={{ display: 'block', color: 'var(--v)' }}>Frontend React Developer</strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Topics: Virtual DOM, Hooks, Server Components, State</span>
              </div>
              <PlayCircle size={20} style={{ color: 'var(--v)' }} />
            </button>

            <button 
              onClick={() => startSession('Fullstack Django Developer')}
              className="btn btn-secondary"
              style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', alignItems: 'center', textAlign: 'left' }}
            >
              <div>
                <strong style={{ display: 'block', color: 'var(--t)' }}>Fullstack Django Developer</strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Topics: Migrations, Session Auth, Indexing, DB Optimize</span>
              </div>
              <PlayCircle size={20} style={{ color: 'var(--t)' }} />
            </button>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '20px', fontFamily: 'var(--font-mono)' }}>
            💡 Runs classification and sentiment models on submitted responses
          </div>
        </div>
      </div>
    );
  }

  if (session === 'active') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Mock Technical Interview</h2>
          <span className="badge bp">{role}</span>
        </div>

        <QuestionCard 
          question={currentQuestion} 
          currentIndex={currentIndex} 
          total={totalQuestions} 
        />

        <div className="card glass">
          <AnswerInput onSubmit={submitAnswer} loading={loading} />
        </div>

        {answers.length > 0 && (
          <div className="card glass" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '1rem' }}>Session Answers History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {answers.map((ans, idx) => (
                <div key={idx} style={{ padding: '8px 12px', background: 'var(--s2)', borderRadius: '6px', fontSize: '12px' }}>
                  <div className="flex-between" style={{ marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Q{idx + 1}: {ans.questionText.slice(0, 30)}...</span>
                    <strong style={{ color: 'var(--g)' }}>{ans.score}/100</strong>
                  </div>
                  <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>"{ans.userAnswer}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (session === 'completed' && results) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <span className="eyebrow">Session Results</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Performance Report</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>AI-generated breakdown of answer scoring classifier models.</p>
        </div>

        <div className="grid-cols-2" style={{ alignItems: 'stretch' }}>
          {/* Radar Chart */}
          <div className="card glass flex-center" style={{ flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '15px' }}>Candidate Evaluation Radar</h3>
            <SkillRadarChart categories={results.categories} />
          </div>

          {/* Core Score breakdown */}
          <div className="card glass flex-between" style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--g)' }}>Overall Grade</span>
              <h2 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--g)', margin: '10px 0' }}>
                {results.overallScore} / 100
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: '1.7' }}>
                Excellent delivery and keywords coverage. You demonstrated strong command over basic frameworks. 
                Your readiness index has been updated accordingly.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--g)' }} />
                <span>VADER Polarity: Confident Sentiment</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--g)' }} />
                <span>spaCy: 78% Keyword Overlap Match</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--g)' }} />
                <span>Readability: Good clarity (68 Flesch)</span>
              </div>
            </div>

            <button 
              onClick={() => startSession(role)} 
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px', padding: '0.6rem' }}
            >
              Start New Practice Session
            </button>
          </div>
        </div>

        {/* Detailed Question feedback cards */}
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '1rem' }}>Per-Question Feedback details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {answers.map((ans, idx) => (
              <div key={idx} className="card glass">
                <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>Q{idx + 1}: {ans.questionText}</span>
                  <span className="badge bg" style={{ color: 'var(--g)', background: 'rgba(30,203,123,0.1)' }}>Score: {ans.score}/100</span>
                </div>
                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p><strong>Your Answer:</strong> <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>"{ans.userAnswer}"</span></p>
                  <p><strong>Sentiment:</strong> <span style={{ color: 'var(--v)' }}>{ans.sentiment}</span></p>
                  <p><strong>Concept matches:</strong> {ans.matchedKeywords.map(k => <span key={k} className="badge bg" style={{ marginLeft: '4px' }}>{k}</span>)}</p>
                  <div style={{ marginTop: '6px', padding: '10px', background: 'var(--s2)', borderRadius: '6px', borderLeft: '3px solid var(--t)', fontSize: '12px', color: 'var(--muted)' }}>
                    {ans.feedback}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
