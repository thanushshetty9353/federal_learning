import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import axiosClient from '../../api/axiosClient';

export default function TrainingMonitor({ isDark: isDarkProp }) {
  const { theme } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : theme === 'dark';
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axiosClient.get('/monitoring/training');
        setMetrics(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load monitoring data.');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.08)';
  const cardStyle = {
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.04)',
    border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(99,102,241,0.12)',
    borderRadius: '1rem', padding: '1.5rem'
  };

  // Build chart data from rounds_data or fallback
  const chartData = (metrics?.rounds_data || metrics?.history || []).map((r, i) => ({
    round: `R${r.round || i + 1}`,
    accuracy: typeof r.accuracy === 'number' ? parseFloat((r.accuracy > 1 ? r.accuracy : r.accuracy * 100).toFixed(2)) : null,
    loss: typeof r.loss === 'number' ? parseFloat(r.loss.toFixed(4)) : null,
  }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          📡 Training Monitor
        </h2>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(16,185,129,0.1)', borderRadius: '9999px', padding: '0.3rem 0.8rem',
          color: '#10b981', fontSize: '0.8rem', fontWeight: 600,
        }}>
          <motion.div style={{ width:'8px', height:'8px', background:'#10b981', borderRadius:'50%' }}
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          Live (15s)
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.65rem', padding: '0.75rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading monitoring data...</div>
      ) : !metrics ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No monitoring data available. Start a training job first.</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Current Round', value: metrics.current_round ?? metrics.round ?? '—', color: '#6366f1', icon: '🔄' },
              { label: 'Accuracy', value: metrics.accuracy != null ? `${(metrics.accuracy * 100).toFixed(1)}%` : '—', color: '#10b981', icon: '🎯' },
              { label: 'Loss', value: metrics.loss != null ? metrics.loss.toFixed(4) : '—', color: '#ef4444', icon: '📉' },
              { label: 'Nodes', value: metrics.participating_nodes ?? metrics.nodes ?? '—', color: '#8b5cf6', icon: '🏥' },
            ].map(s => (
              <div key={s.label} style={{ ...cardStyle }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div style={{ fontSize: '0.75rem', color: axisColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, marginTop: '0.25rem' }}>{String(s.value)}</div>
              </div>
            ))}
          </div>

          {chartData.length > 0 && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={cardStyle}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', color: isDark ? '#94a3b8' : '#475569' }}>Accuracy over Rounds</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="round" tick={{ fill: axisColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: axisColor, fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: isDark ? '#1e1e2e' : '#fff', border: 'none', borderRadius: '0.65rem' }} />
                    <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={cardStyle}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', color: isDark ? '#94a3b8' : '#475569' }}>Loss over Rounds</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="round" tick={{ fill: axisColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: isDark ? '#1e1e2e' : '#fff', border: 'none', borderRadius: '0.65rem' }} />
                    <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
