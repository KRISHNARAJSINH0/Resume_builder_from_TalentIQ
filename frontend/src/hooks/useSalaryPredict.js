import { useState } from 'react';

export default function useSalaryPredict() {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([
    { role: 'Frontend React Developer', exp: 2, skills: ['React', 'JavaScript'], salary: '₹8.4 LPA', date: '2026-06-25' },
    { role: 'Fullstack Django Developer', exp: 1, skills: ['Python', 'Django'], salary: '₹6.8 LPA', date: '2026-06-24' }
  ]);

  const predict = (inputs) => {
    setLoading(true);
    setTimeout(() => {
      // Calculate a mock salary based on inputs
      let base = 5.0; // base is 5 LPA
      
      const expVal = parseFloat(inputs.experience || 0);
      base += expVal * 1.2; // 1.2 LPA per year exp

      if (inputs.cityTier === 'Metro') base += 2.0; // metro premium
      if (inputs.education === 'Masters') base += 1.5; // masters premium

      // Skill premiums
      const skillCount = (inputs.skills || []).length;
      base += skillCount * 0.4;

      const salaryMin = base.toFixed(1);
      const salaryMax = (base + 2.5).toFixed(1);
      const predictedSalary = `₹${salaryMin} - ₹${salaryMax} LPA`;

      const newPred = {
        role: inputs.role,
        exp: expVal,
        skills: inputs.skills || [],
        salary: `₹${((base + base + 2.5)/2).toFixed(1)} LPA`,
        date: new Date().toISOString().split('T')[0]
      };

      setPrediction({
        min: salaryMin,
        max: salaryMax,
        median: ((base + base + 2.5) / 2).toFixed(1),
        boosters: [
          { skill: 'Docker', val: '₹1.8 LPA' },
          { skill: 'Next.js', val: '₹1.5 LPA' },
          { skill: 'TypeScript', val: '₹1.2 LPA' }
        ],
        marketMedian: '₹9.0 LPA'
      });

      setHistory(prev => [newPred, ...prev]);
      setLoading(false);
    }, 500);
  };

  return {
    prediction,
    loading,
    predict,
    history
  };
}
