import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import axiosClient from '../../api/axiosClient';

function AlertBanner({ msg, type }) {
  if (!msg) return null;
  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  };
  const c = colors[type] || colors.error;
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '0.65rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: c.text, fontSize: '0.875rem' }}>
      {msg}
    </motion.div>
  );
}

export function CreateTrainingJob({ isDark }) {
  const [form, setForm] = useState({ job_name: '', model: 'logistic_regression', rounds: 5, privacy_budget: 1.0 });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.job_name) { setAlert({ msg: 'Job name is required.', type: 'error' }); return; }
    setLoading(true);
    try {
      await axiosClient.post('/training-jobs/create', form);
      setAlert({ msg: 'Training job created successfully! Federated server starting...', type: 'success' });
      setForm({ job_name: '', model: 'logistic_regression', rounds: 5, privacy_budget: 1.0 });
    } catch (err) {
      setAlert({ msg: err.response?.data?.detail || 'Failed to create job.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
        ➕ Create Training Job
      </h2>
      {alert && <AlertBanner msg={alert.msg} type={alert.type} />}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '480px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>Job Name</label>
          <input type="text" value={form.job_name} onChange={e => setForm(p => ({ ...p, job_name: e.target.value }))}
            placeholder="e.g. Hospital Network Training Round 1"
            className={`input-field ${!isDark ? 'input-field-light' : ''}`} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>Model Type</label>
          <select value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
            className={`input-field ${!isDark ? 'input-field-light' : ''}`} style={{ cursor: 'pointer' }}>
            <option value="logistic_regression">Logistic Regression</option>
            <option value="neural_network">Neural Network</option>
            <option value="decision_tree">Decision Tree</option>
            <option value="random_forest">Random Forest</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>
            Rounds: <span style={{ color: '#6366f1' }}>{form.rounds}</span>
          </label>
          <input type="range" min="1" max="50" value={form.rounds}
            onChange={e => setForm(p => ({ ...p, rounds: parseInt(e.target.value) }))}
            style={{ width: '100%', accentColor: '#6366f1' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>
            Privacy Budget (ε): <span style={{ color: '#6366f1' }}>{form.privacy_budget}</span>
          </label>
          <input type="range" min="0.1" max="10" step="0.1" value={form.privacy_budget}
            onChange={e => setForm(p => ({ ...p, privacy_budget: parseFloat(e.target.value) }))}
            style={{ width: '100%', accentColor: '#6366f1' }} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary" style={{ alignSelf: 'flex-start', width: '160px', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creating...' : '🚀 Create Job'}
        </button>
      </form>
    </div>
  );
}

export function TrainingJobsList({ isDark }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/training-jobs/list');
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load jobs.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const statusStyle = (s) => {
    const map = { CREATED: 'badge-created', TRAINING: 'badge-training', COMPLETED: 'badge-completed' };
    return `status-badge ${map[s] || 'badge-created'}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>📋 Training Jobs</h2>
        <button onClick={fetchJobs} className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Refresh</button>
      </div>
      {error && <AlertBanner msg={error} type="error" />}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No training jobs yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(99,102,241,0.15)' }}>
                {['Job ID', 'Model', 'Rounds', 'Participants', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => (
                <motion.tr key={job.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(99,102,241,0.07)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#6366f1' }}>#{job.id}</td>
                  <td style={{ padding: '0.85rem 1rem', color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '0.9rem' }}>{job.model_type || job.model || 'N/A'}</td>
                  <td style={{ padding: '0.85rem 1rem', color: isDark ? '#94a3b8' : '#475569' }}>{job.rounds}</td>
                  <td style={{ padding: '0.85rem 1rem', color: isDark ? '#94a3b8' : '#475569' }}>{job.participants ?? '—'}</td>
                  <td style={{ padding: '0.85rem 1rem' }}><span className={statusStyle(job.status)}>{job.status}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
