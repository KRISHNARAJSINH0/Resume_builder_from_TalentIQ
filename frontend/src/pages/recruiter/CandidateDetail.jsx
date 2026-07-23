import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReadinessGauge from '../../components/charts/ReadinessGauge';
import { ArrowLeft, User, FileText, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

const mockProfiles = {
  1: {
    id: 1,
    name: 'Kartik Shah',
    email: 'kartik@email.com',
    role: 'Frontend React Developer',
    score: 74,
    shortlistProb: 88,
    college: 'Delhi Technological University (DTU)',
    exp: 'Software Engineering Intern at WebSolutions Pvt. Ltd.',
    skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'SQL', 'Python'],
    interviewAnswers: [
      { q: 'Explain the difference between Virtual DOM and Real DOM in React.', score: 85, feedback: 'Covered diffing and reconciliation details perfectly.' },
      { q: 'What is the purpose of useEffect in React, and how do you clean up side effects?', score: 79, feedback: 'Described lifecycle cleanup functions correctly.' }
    ]
  },
  2: {
    id: 2,
    name: 'Anjali Verma',
    email: 'anjali@email.com',
    role: 'Fullstack Django Developer',
    score: 81,
    shortlistProb: 94,
    college: 'Indian Institute of Technology (IIT) Delhi',
    exp: 'Django backend dev at FinTech Labs',
    skills: ['Python', 'Django', 'PostgreSQL', 'HTML5', 'CSS3', 'Git'],
    interviewAnswers: [
      { q: 'Explain Django ORM migrations. How do you handle a conflict in a team environment?', score: 92, feedback: 'Excellent description of merging conflicts.' },
      { q: 'How does Django handle session management and user authentication requests?', score: 70, feedback: 'Described sessions, but missed JWT token refreshing details.' }
    ]
  }
};

export default function CandidateDetail() {
  const { id } = useParams();
  const profile = mockProfiles[id] || mockProfiles[1];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/recruiter/talent" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--t)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
          <ArrowLeft size={14} /> Back to Talent Pool
        </Link>
      </div>

      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--t)' }}>Candidate Inspection</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>{profile.name}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Parsed profile details & ML classification indicators.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => alert('Sending email invitation...')}>Email Candidate</button>
          <button className="btn btn-primary" onClick={() => alert('Candidate shortlisted!')}>Approve Shortlist</button>
        </div>
      </div>

      {/* Row 1: Gauge & Stats */}
      <div className="grid-cols-2" style={{ marginBottom: '2rem', alignItems: 'stretch' }}>
        {/* Readiness Gauge */}
        <div className="card glass flex-center" style={{ flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '15px' }}>Calculated Career Readiness Index</h3>
          <ReadinessGauge score={profile.score} />
        </div>

        {/* Shortlist ML Score Card */}
        <div className="card glass flex-between" style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--v)' }}>Shortlist Probability</span>
            <h2 style={{ fontSize: '42px', fontWeight: 800, color: 'var(--v)', margin: '5px 0' }}>
              {profile.shortlistProb}%
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: '1.7' }}>
              Calculated using Random Forest classifier trained on historical hiring data. Kartik exhibits high match values for BTech credentials and years of experience.
            </p>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--s2)', borderRadius: '6px', fontSize: '11px', color: 'var(--g)', border: '1px solid rgba(30,203,123,0.1)', width: '100%', marginTop: '15px' }}>
            ✓ Shortlist probability exceeds placement threshold benchmarks
          </div>
        </div>
      </div>

      {/* Row 2: CV details & Interview sessions */}
      <div className="grid-cols-2">
        {/* CV extracted fields */}
        <div className="card glass">
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '1.25rem' }}>Extracted CV Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '13px' }}>
            <div>
              <strong style={{ display: 'block', color: 'var(--t)', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>College / University</strong>
              <p>{profile.college}</p>
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--t)', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Prior Experience</strong>
              <p>{profile.exp}</p>
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--t)', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Extracted Skills Cloud</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                {profile.skills.map(s => (
                  <span key={s} className="badge bp">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mock Interview transcripts */}
        <div className="card glass">
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '1.25rem' }}>AI Mock Interview Submissions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {profile.interviewAnswers.map((ans, idx) => (
              <div key={idx} style={{ padding: '10px', background: 'var(--s2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div className="flex-between" style={{ marginBottom: '4px', fontSize: '12px' }}>
                  <strong style={{ color: '#fff' }}>Q: {ans.q.slice(0, 32)}...</strong>
                  <span style={{ color: 'var(--g)' }}>{ans.score}/100</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  Feedback: {ans.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
