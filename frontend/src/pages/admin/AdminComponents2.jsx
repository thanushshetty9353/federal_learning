import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
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

export function TrainingStats({ isDark }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/training-jobs/admin/job-stats')
      .then(res => setStats(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats.map(s => ({
    name: `Job #${s.job_id}`,
    participants: s.participants,
    rounds: s.rounds,
  }));

  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.08)';

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
        📊 Training Statistics
      </h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading statistics...</div>
      ) : stats.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No job statistics available yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.04)',
            border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(99,102,241,0.12)',
            borderRadius: '1rem', padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', color: isDark ? '#94a3b8' : '#475569' }}>
              Participants per Job
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
                <Tooltip contentStyle={{ background: isDark ? '#1e1e2e' : '#fff', border: 'none', borderRadius: '0.65rem' }} />
                <Bar dataKey="participants" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.04)',
            border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(99,102,241,0.12)',
            borderRadius: '1rem', padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', color: isDark ? '#94a3b8' : '#475569' }}>
              Rounds per Job
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
                <Tooltip contentStyle={{ background: isDark ? '#1e1e2e' : '#fff', border: 'none', borderRadius: '0.65rem' }} />
                <Bar dataKey="rounds" fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export function AuditLogs({ isDark }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient.get('/audit/logs')
      .then(res => {
        const rawLogs = res.data?.logs || [];
        const parsed = rawLogs.map((line, idx) => {
          const parts = line.split(' - ');
          return { id: idx, timestamp: parts[0] || '', level: parts[1] || '', message: parts.slice(2).join(' - ') || line };
        });
        setLogs(parsed);
      })
      .catch(err => setError(err.response?.data?.detail || 'Failed to load audit logs.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
        📄 Audit Logs
      </h2>
      {error && <AlertBanner msg={error} type="error" />}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading logs...</div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No audit logs available.</div>
      ) : (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {logs.map((log) => (
            <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                padding: '0.65rem 0.75rem', marginBottom: '0.25rem',
                borderRadius: '0.5rem',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.04)',
                borderLeft: `3px solid ${log.level?.includes('ERROR') ? '#ef4444' : log.level?.includes('WARNING') ? '#eab308' : '#6366f1'}`,
              }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', flexShrink: 0, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {log.timestamp.substring(0, 19)}
              </span>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px',
                background: log.level?.includes('ERROR') ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)',
                color: log.level?.includes('ERROR') ? '#f87171' : '#818cf8',
                flexShrink: 0,
              }}>
                {log.level?.trim() || 'INFO'}
              </span>
              <span style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#475569' }}>{log.message}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PendingUsers({ isDark }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionAlert, setActionAlert] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/users/pending');
      setUsers(res.data?.pending_users || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load pending users.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const approve = async (id) => {
    try {
      await axiosClient.post(`/admin/users/${id}/approve`);
      setActionAlert({ msg: 'User approved successfully!', type: 'success' });
      fetchUsers();
    } catch (err) {
      setActionAlert({ msg: err.response?.data?.detail || 'Approval failed.', type: 'error' });
    }
  };

  const reject = async (id) => {
    try {
      await axiosClient.post(`/admin/users/${id}/reject`);
      setActionAlert({ msg: 'User rejected.', type: 'success' });
      fetchUsers();
    } catch (err) {
      setActionAlert({ msg: err.response?.data?.detail || 'Rejection failed.', type: 'error' });
    }
  };

  const roleLabel = { ORG_NODE: 'Organization', RESEARCHER: 'Researcher', AUDITOR: 'Auditor' };

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
        👥 Pending Users
      </h2>
      {actionAlert && <AlertBanner msg={actionAlert.msg} type={actionAlert.type} />}
      {error && <AlertBanner msg={error} type="error" />}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No pending approval requests.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(99,102,241,0.15)' }}>
                {['ID', 'Email', 'Requested Role', 'Organization', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(99,102,241,0.07)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#6366f1' }}>#{u.id}</td>
                  <td style={{ padding: '0.85rem 1rem', color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '0.9rem' }}>{u.email}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className="status-badge badge-created">{roleLabel[u.requested_role] || u.requested_role}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: isDark ? '#94a3b8' : '#475569' }}>{u.organization_name || '—'}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => approve(u.id)} className="btn-success" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>✓ Approve</button>
                      <button onClick={() => reject(u.id)} className="btn-danger" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>✗ Reject</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function LatestModel({ isDark }) {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient.get('/admin/models/latest')
      .then(res => setModel(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load model info.'))
      .finally(() => setLoading(false));
  }, []);

  const downloadModel = () => {
    const token = localStorage.getItem('token');
    // Ensure we use the correct absolute URL or relative path handled by proxy/axios
    window.open(`http://127.0.0.1:8000/training-jobs/admin/models/latest?token=${token}`, '_blank');
  };

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
        🧠 Latest Trained Model
      </h2>
      {error && <AlertBanner msg={error} type="error" />}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading model info...</div>
      ) : model && (model.error || model.message) ? (
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,102,241,0.1)',
          borderRadius: '1rem', padding: '2rem', textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
          <p style={{ color: isDark ? '#94a3b8' : '#475569' }}>{model.error || model.message}</p>
        </div>
      ) : model ? (
        <div style={{
          background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '1rem', padding: '2rem',
          display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '480px'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Model Name</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: isDark ? '#e2e8f0' : '#1e293b', margin: '0.25rem 0 0' }}>{model.model_name}</p>
          </div>
          {model.job_id && (
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Associated Job</span>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#6366f1', margin: '0.25rem 0 0' }}>Job #{model.job_id}</p>
            </div>
          )}
          {model.accuracy && (
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Accuracy</span>
              <p style={{ fontWeight: 700, fontSize: '1.5rem', color: '#10b981', margin: '0.25rem 0 0' }}>{(parseFloat(model.accuracy) * 100).toFixed(2)}%</p>
            </div>
          )}
          <button onClick={downloadModel} className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
            ⬇ Download Model
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ModelsList({ isDark }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/models/list');
      setModels(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load models list.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchModels(); }, []);

  const downloadModel = () => {
    const token = localStorage.getItem('token');
    window.open(`http://127.0.0.1:8000/training-jobs/admin/models/latest?token=${token}`, '_blank');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>📂 Load Models</h2>
        <button onClick={fetchModels} className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Refresh</button>
      </div>
      {error && <AlertBanner msg={error} type="error" />}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading models...</div>
      ) : models.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No trained models yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(99,102,241,0.15)' }}>
                {['Job ID', 'Model Name', 'Accuracy', 'Created At', 'Action'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((m, i) => (
                <motion.tr key={m.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(99,102,241,0.07)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#6366f1' }}>#{m.job_id || '—'}</td>
                  <td style={{ padding: '0.85rem 1rem', color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '0.9rem' }}>{m.model_name}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#10b981', fontWeight: 700 }}>{(parseFloat(m.accuracy || 0) * 100).toFixed(2)}%</td>
                  <td style={{ padding: '0.85rem 1rem', color: isDark ? '#94a3b8' : '#475569', fontSize: '0.8rem' }}>{new Date(m.created_at).toLocaleString()}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <button onClick={downloadModel} className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>⬇ Download</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
