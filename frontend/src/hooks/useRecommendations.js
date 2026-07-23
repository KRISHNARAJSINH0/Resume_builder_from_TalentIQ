import { useState } from 'react';

const initialJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechCorp India',
    location: 'Bangalore (Hybrid)',
    salary: '₹12,00,000 - ₹15,00,000',
    experience: '2-4 years',
    match: 85,
    skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'TypeScript'],
    have: ['React', 'JavaScript', 'HTML5', 'CSS3'],
    missing: ['TypeScript'],
    logo: '💼',
    saved: false
  },
  {
    id: 2,
    title: 'React developer',
    company: 'Fintech Solutions',
    location: 'Mumbai (Remote)',
    salary: '₹14,00,000 - ₹18,00,000',
    experience: '3-5 years',
    match: 78,
    skills: ['React', 'JavaScript', 'TypeScript', 'Next.js', 'Redux Toolkit'],
    have: ['React', 'JavaScript'],
    missing: ['TypeScript', 'Next.js', 'Redux Toolkit'],
    logo: '📈',
    saved: false
  },
  {
    id: 3,
    title: 'Junior Web Developer',
    company: 'StartupLabs',
    location: 'Pune (Onsite)',
    salary: '₹6,00,000 - ₹8,00,000',
    experience: '0-2 years',
    match: 92,
    skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
    have: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
    missing: [],
    logo: '⚡',
    saved: false
  },
  {
    id: 4,
    title: 'UI Developer - React/Vite',
    company: 'HiringHub',
    location: 'Hyderabad (Hybrid)',
    salary: '₹10,00,000 - ₹13,00,000',
    experience: '2-3 years',
    match: 80,
    skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Vite', 'Webpack'],
    have: ['React', 'JavaScript', 'HTML5', 'CSS3'],
    missing: ['Vite', 'Webpack'],
    logo: '🔗',
    saved: true
  }
];

export default function useRecommendations() {
  const [jobs, setJobs] = useState(initialJobs);
  const [filters, setFilters] = useState({
    role: '',
    location: '',
    experience: ''
  });

  const toggleSaveJob = (id) => {
    setJobs(prev =>
      prev.map(job => job.id === id ? { ...job, saved: !job.saved } : job)
    );
  };

  const filteredJobs = jobs.filter(job => {
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.experience && !job.experience.toLowerCase().includes(filters.experience.toLowerCase())) return false;
    return true;
  });

  return {
    jobs: filteredJobs,
    toggleSaveJob,
    filters,
    setFilters
  };
}
