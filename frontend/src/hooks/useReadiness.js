import { useState } from 'react';

export default function useReadiness() {
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(74);
  const [breakdown, setBreakdown] = useState({
    skills: 65,     // 40% weight
    experience: 80, // 20% weight
    education: 90,  // 15% weight
    projects: 75,   // 15% weight
    interview: 82   // 10% weight
  });

  const [history, setHistory] = useState([
    { label: 'Week 1', val: 52 },
    { label: 'Week 2', val: 55 },
    { label: 'Week 3', val: 61 },
    { label: 'Week 4', val: 67 },
    { label: 'Week 5', val: 74 }
  ]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate additions
      const newScore = Math.min(100, score + Math.round(Math.random() * 4));
      setScore(newScore);
      setBreakdown(prev => ({
        ...prev,
        skills: Math.min(100, prev.skills + 3),
        projects: Math.min(100, prev.projects + 5)
      }));
      setHistory(prev => [
        ...prev,
        { label: `Week ${prev.length + 1}`, val: newScore }
      ]);
      setLoading(false);
    }, 500);
  };

  return {
    score,
    breakdown,
    history,
    loading,
    refresh
  };
}
