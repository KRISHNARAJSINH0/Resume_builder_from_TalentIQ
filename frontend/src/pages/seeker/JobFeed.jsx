import React, { useState } from 'react';
import useRecommendations from '../../hooks/useRecommendations';
import JobCard from '../../components/jobs/JobCard';
import JobFilters from '../../components/jobs/JobFilters';
import { ExternalLink, HelpCircle, X } from 'lucide-react';

export default function JobFeed() {
  const { jobs, toggleSaveJob, filters, setFilters } = useRecommendations();
  const [selectedJob, setSelectedJob] = useState(null);

  const handleApply = (id) => {
    const jobObj = jobs.find(j => j.id === id);
    setSelectedJob(jobObj);
  };

  const closeModal = () => {
    setSelectedJob(null);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <span className="eyebrow">Job Intelligence</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Jobs For You</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>AI-recommended roles computed using content-based TF-IDF cosine similarity.</p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1.5rem' }}>
        <JobFilters filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Jobs list grid */}
      <div className="grid-cols-2">
        {jobs.map(job => (
          <JobCard 
            key={job.id} 
            job={job} 
            onToggleSave={toggleSaveJob} 
            onApply={handleApply} 
          />
        ))}
      </div>

      {/* Detailed view Modal */}
      {selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7,7,14,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '500px', position: 'relative', background: 'var(--s1)', padding: '2rem' }}>
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '32px' }}>{selectedJob.logo}</span>
              <div>
                <h2 style={{ color: '#fff', fontSize: '18px' }}>{selectedJob.title}</h2>
                <p style={{ color: 'var(--v)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{selectedJob.company}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '13px', color: 'var(--text)' }}>
              <div>
                <strong style={{ color: 'var(--t)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Location</strong>
                <p>{selectedJob.location}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--t)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Salary CTC</strong>
                <p>{selectedJob.salary}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--t)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Experience Required</strong>
                <p>{selectedJob.experience}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--t)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Job Description (Extracted)</strong>
                <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                  We are seeking a talented engineer to build user interfaces. You will collaborate with design teams and integrate backend APIs. Primary stack includes React, modern Javascript, and tools listed below.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
              <button onClick={closeModal} className="btn btn-secondary" style={{ flex: 1 }}>Close Details</button>
              <a 
                href="https://indeed.com" 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-primary" 
                style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              >
                Apply Externally <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
