import React, { useState } from 'react';

export default function AnswerInput({ onSubmit, loading }) {
  const [answer, setAnswer] = useState('');

  const wordCount = answer.split(/\s+/).filter(Boolean).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() && !loading) {
      onSubmit(answer);
      setAnswer('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Your Answer</span>
          <span style={{ color: wordCount > 40 ? 'var(--g)' : 'var(--a)' }}>{wordCount} words</span>
        </label>
        <textarea
          required
          rows="6"
          className="form-input"
          placeholder="Type your response here. Try to use technical terms and aim for 30-60 words for best accuracy..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '13px' }}
        />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} disabled={loading}>
        {loading ? 'AI analyzing answer metrics...' : 'Submit Answer'}
      </button>
    </form>
  );
}
