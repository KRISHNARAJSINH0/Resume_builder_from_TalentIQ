import { useState } from 'react';

const questionBank = {
  'Frontend React Developer': [
    { id: 1, text: 'Explain the difference between Virtual DOM and Real DOM in React.', keywords: ['reconciliation', 'diffing', 'efficient', 'rendering', 'virtual representation'] },
    { id: 2, text: 'What is the purpose of useEffect in React, and how do you clean up side effects?', keywords: ['lifecycle', 'cleanup function', 'dependencies array', 'unmount', 'subscription'] },
    { id: 3, text: 'What are React Server Components (RSC) and how do they differ from client components?', keywords: ['server-side', 'bundle size', 'data fetching', 'ux', 'hydration'] }
  ],
  'Fullstack Django Developer': [
    { id: 1, text: 'Explain Django ORM migrations. How do you handle a conflict in a team environment?', keywords: ['makemigrations', 'migrate', 'merge', 'migration files', 'history'] },
    { id: 2, text: 'How does Django handle session management and user authentication requests?', keywords: ['session middleware', 'cookies', 'database backend', 'jwt', 'request.user'] },
    { id: 3, text: 'What are database indexes, and how would you optimize slow queries in a Django project?', keywords: ['index_together', 'select_related', 'prefetch_related', 'explain', 'query optimization'] }
  ]
};

export default function useInterview() {
  const [session, setSession] = useState('idle'); // idle, active, completed
  const [role, setRole] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const startSession = (selectedRole) => {
    const qList = questionBank[selectedRole] || questionBank['Frontend React Developer'];
    setRole(selectedRole);
    setQuestions(qList);
    setCurrentIndex(0);
    setAnswers([]);
    setResults(null);
    setSession('active');
  };

  const submitAnswer = (answerText) => {
    setLoading(true);
    setTimeout(() => {
      const currentQ = questions[currentIndex];
      
      // Calculate mock metrics based on text properties
      const words = answerText.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      
      // Keyword matches
      const matchedKeywords = currentQ.keywords.filter(k => 
        answerText.toLowerCase().includes(k.toLowerCase())
      );
      const keywordScore = Math.round((matchedKeywords.length / currentQ.keywords.length) * 100);

      // Answer scoring
      let score = 30; // base score
      if (wordCount > 15) score += 20;
      if (wordCount > 40) score += 15;
      score += Math.round(keywordScore * 0.35);
      score = Math.min(score, 100);

      const sentiment = score > 75 ? 'Confident' : score > 50 ? 'Neutral' : 'Hesitant';
      const feedback = score > 75 
        ? 'Excellent answer! You covered core terminology and displayed clear technical knowledge.'
        : score > 50 
        ? 'Good effort. However, you could elaborate more and include keyword definitions like ' + currentQ.keywords.slice(0, 2).join(', ')
        : 'The answer is too brief or lacks key technical terms. Be sure to describe how the concept functions under the hood.';

      const answerResult = {
        questionId: currentQ.id,
        questionText: currentQ.text,
        userAnswer: answerText,
        score,
        wordCount,
        sentiment,
        keywordScore,
        matchedKeywords,
        feedback
      };

      const updatedAnswers = [...answers, answerResult];
      setAnswers(updatedAnswers);

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // End of session - compute totals
        const avgScore = Math.round(updatedAnswers.reduce((acc, curr) => acc + curr.score, 0) / questions.length);
        
        setResults({
          overallScore: avgScore,
          categories: [
            { name: 'Core Concepts', score: avgScore + 5 > 100 ? 100 : avgScore + 5 },
            { name: 'Keyword Accuracy', score: Math.round(updatedAnswers.reduce((acc, curr) => acc + curr.keywordScore, 0) / questions.length) },
            { name: 'Delivery / Volume', score: Math.min(100, Math.round(updatedAnswers.reduce((acc, curr) => acc + curr.wordCount, 0) / 1.5)) },
            { name: 'Sentiment Confidence', score: avgScore > 70 ? 90 : avgScore > 50 ? 70 : 45 },
            { name: 'Clarity / Readability', score: Math.round(60 + Math.random() * 30) }
          ],
          feedbackList: updatedAnswers.map(ans => ans.feedback)
        });
        setSession('completed');
      }
      setLoading(false);
    }, 600);
  };

  return {
    session,
    role,
    currentQuestion: questions[currentIndex],
    currentIndex,
    totalQuestions: questions.length,
    submitAnswer,
    startSession,
    results,
    loading,
    answers
  };
}
