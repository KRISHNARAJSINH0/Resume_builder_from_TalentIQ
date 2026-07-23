import React, { useState } from 'react';
import useSalaryPredict from '../../hooks/useSalaryPredict';
import SalaryBoxPlot from '../../components/charts/SalaryBoxPlot';
import { IndianRupee, Sparkles, TrendingUp, History } from 'lucide-react';

export default function SalaryPredictor() {
  const { prediction, loading, predict, history } = useSalaryPredict();

  const [role, setRole] = useState('Frontend React Developer');
  const [experience, setExperience] = useState('2');
  const [cityTier, setCityTier] = useState('Metro');
  const [education, setEducation] = useState('BTech');
  const [skills, setSkills] = useState(['React', 'JavaScript']);

  const handlePredict = (e) => {
    e.preventDefault();
    predict({ role, experience, cityTier, education, skills });
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <span className="eyebrow">Compensation Models</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Salary Range Predictor</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Predict expected CTC range based on ML regression models trained on Indian tech salary data.</p>
      </div>

      <div className="grid-cols-2">
        {/* Left Column: Form Parameters */}
        <div className="card glass">
          <h3 style={{ marginBottom: '1.25rem', color: '#fff', fontSize: '15px' }}>Model Input Parameters</h3>
          <form onSubmit={handlePredict}>
            <div className="form-group">
              <label className="form-label">Target Role</label>
              <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
                <option value="Frontend React Developer">Frontend React Developer</option>
                <option value="Fullstack Django Developer">Fullstack Django Developer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input 
                type="number" 
                min="0" 
                max="25"
                className="form-input" 
                value={experience} 
                onChange={e => setExperience(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location / City Tier</label>
              <select className="form-input" value={cityTier} onChange={e => setCityTier(e.target.value)}>
                <option value="Metro">Tier 1 Metro (Bangalore, Mumbai, Delhi)</option>
                <option value="Tier2">Tier 2 Tech City (Pune, Hyderabad)</option>
                <option value="Tier3">Tier 3 / Remote</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Education Level</label>
              <select className="form-input" value={education} onChange={e => setEducation(e.target.value)}>
                <option value="BTech">BTech / BE / BS Computer Science</option>
                <option value="MTech">MTech / MS / MCA</option>
                <option value="PhD">Doctorate / PhD</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.7rem' }} disabled={loading}>
              {loading ? 'Evaluating weights...' : 'Predict Salary Range'}
            </button>
          </form>
        </div>

        {/* Right Column: Prediction results & plots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {prediction ? (
            <>
              {/* Output value */}
              <div className="card glass" style={{ borderLeft: '3px solid var(--g)', background: 'rgba(30,203,123,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="eyebrow" style={{ color: 'var(--g)' }}>Predicted CTC Range</span>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--g)', margin: '4px 0' }}>
                      ₹{prediction.min} - ₹{prediction.max} LPA
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      Median Prediction: ₹{prediction.median} LPA (Confidence Interval: 92%)
                    </p>
                  </div>
                  <IndianRupee size={32} style={{ color: 'var(--g)', opacity: 0.8 }} />
                </div>
              </div>

              {/* Box plot visualizer */}
              <div className="card glass">
                <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '14px' }}>Market Salary Distribution (Box Plot)</h3>
                <SalaryBoxPlot />
              </div>

              {/* Boosters details */}
              <div className="card glass">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--a)', marginBottom: '10px' }}>
                  <TrendingUp size={16} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Expected Skill Boosters</h3>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
                  Adding these skills to your profile will lift your predicted salary by:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {prediction.boosters.map(b => (
                    <div key={b.skill} className="flex-between" style={{ padding: '8px 12px', background: 'var(--s2)', borderRadius: '6px', fontSize: '13px' }}>
                      <span>{b.skill} integration</span>
                      <strong style={{ color: 'var(--g)' }}>+ {b.val} / yr</strong>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card glass flex-center" style={{ flexDirection: 'column', minHeight: '320px', color: 'var(--muted)' }}>
              <Sparkles size={36} style={{ marginBottom: '12px', color: 'var(--v)' }} />
              <p style={{ fontSize: '14px', fontWeight: 500 }}>Submit parameters to run regression predictions</p>
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Loads salary_rf_model.pkl Random Forest model</p>
            </div>
          )}
        </div>
      </div>

      {/* Prediction History */}
      <div className="card glass" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} /> Prediction History
        </h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Target Role</th>
                <th>Experience</th>
                <th>Skills Input</th>
                <th>Average Prediction</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--t)' }}>{h.role}</td>
                  <td>{h.exp} Years</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {h.skills.slice(0, 3).map(s => (
                        <span key={s} className="badge bp">{s}</span>
                      ))}
                      {h.skills.length > 3 && <span className="badge bg">+{h.skills.length - 3}</span>}
                    </div>
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{h.salary}</td>
                  <td style={{ color: 'var(--muted)' }}>{h.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
