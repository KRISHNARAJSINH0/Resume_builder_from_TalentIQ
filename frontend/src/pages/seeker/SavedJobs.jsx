import React from 'react';
import useRecommendations from '../../hooks/useRecommendations';
import JobCard from '../../components/jobs/JobCard';
import { Bookmark, ClipboardList } from 'lucide-react';

export default function SavedJobs() {
  const { jobs, toggleSaveJob } = useRecommendations();
  const savedJobs = jobs.filter(j => j.saved);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <span className="eyebrow">Personal Board</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Saved Job Listings</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Bookmark job descriptions to analyze later or prepare interview answers.</p>
      </div>

      {savedJobs.length > 0 ? (
        <div className="grid-cols-2">
          {savedJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              onToggleSave={toggleSaveJob} 
              onApply={(id) => alert(`Redirecting mock job ${id} detail...`)} 
            />
          ))}
        </div>
      ) : (
        <div className="card glass flex-center" style={{ flexDirection: 'column', minHeight: '300px', color: 'var(--muted)' }}>
          <Bookmark size={36} style={{ marginBottom: '10px', color: 'var(--muted)' }} />
          <h3 style={{ fontSize: '15px', color: 'var(--text)' }}>No bookmarked jobs</h3>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>Browse the recommended job feed and click bookmark icons.</p>
        </div>
      )}
    </div>
  );
}
