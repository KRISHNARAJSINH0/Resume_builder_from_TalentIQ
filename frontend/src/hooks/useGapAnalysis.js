import { useState } from 'react';

const mockData = {
  'Frontend React Developer': {
    have: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
    missing: [
      { name: 'TypeScript', frequency: 78, salaryPremium: 120000, level: 'High', resource: 'TypeScript official docs & handbook' },
      { name: 'Next.js', frequency: 65, salaryPremium: 150000, level: 'High', resource: 'Next.js interactive learn tutorials' },
      { name: 'Redux Toolkit', frequency: 54, salaryPremium: 60000, level: 'Medium', resource: 'Redux Toolkit official quick-start' },
      { name: 'Webpack/Vite', frequency: 42, salaryPremium: 50000, level: 'Medium', resource: 'Vite documentation & config guides' },
      { name: 'Docker', frequency: 35, salaryPremium: 180000, level: 'Low', resource: 'FreeCodeCamp Docker Course for Beginners' }
    ]
  },
  'Fullstack Django Developer': {
    have: ['Python', 'Django', 'SQL', 'HTML5', 'CSS3'],
    missing: [
      { name: 'PostgreSQL', frequency: 85, salaryPremium: 110000, level: 'High', resource: 'PostgreSQL Tutorial Series' },
      { name: 'React', frequency: 72, salaryPremium: 200000, level: 'High', resource: 'React.dev beginner documentation' },
      { name: 'Redis', frequency: 50, salaryPremium: 90000, level: 'Medium', resource: 'Redis University - Caching basics' },
      { name: 'Docker', frequency: 45, salaryPremium: 180000, level: 'Medium', resource: 'Official Docker documentation' },
      { name: 'Celery/RabbitMQ', frequency: 40, salaryPremium: 130000, level: 'Medium', resource: 'Django + Celery asynchronous guide' }
    ]
  },
  'Machine Learning Engineer': {
    have: ['Python', 'SQL', 'Git'],
    missing: [
      { name: 'Scikit-Learn', frequency: 90, salaryPremium: 140000, level: 'High', resource: 'Scikit-Learn user guide & examples' },
      { name: 'Pandas & NumPy', frequency: 85, salaryPremium: 80000, level: 'High', resource: 'Kaggle Pandas tutorial courses' },
      { name: 'TensorFlow/Keras', frequency: 60, salaryPremium: 220000, level: 'High', resource: 'DeepLearning.AI TensorFlow specialization' },
      { name: 'MLOps (MLflow/Docker)', frequency: 42, salaryPremium: 250000, level: 'Medium', resource: 'MLOps Guide for Python developers' },
      { name: 'Matplotlib & Seaborn', frequency: 38, salaryPremium: 40000, level: 'Low', resource: 'Seaborn visualization tutorials' }
    ]
  }
};

export default function useGapAnalysis() {
  const [targetRole, setTargetRole] = useState('Frontend React Developer');
  const [loading, setLoading] = useState(false);

  const data = mockData[targetRole] || mockData['Frontend React Developer'];

  const changeRole = (newRole) => {
    setLoading(true);
    setTimeout(() => {
      setTargetRole(newRole);
      setLoading(false);
    }, 400);
  };

  return {
    targetRole,
    have: data.have,
    missing: data.missing,
    loading,
    changeRole,
    allRoles: Object.keys(mockData)
  };
}
