import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import axiosClient from '../../api/axiosClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('email', email);
      params.append('password', password);
      const res = await axiosClient.post('/auth/login', null, { params });
      const { access_token, role, organization } = res.data;
      const userData = { email, role, organization };
      login(access_token, userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      className={isDark ? 'gradient-bg-dark' : 'gradient-bg-light'}>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '1.25rem',
              marginBottom: '1rem',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </motion.div>
          <h1 style={{ fontWeight: 800, fontSize: '1.75rem', color: isDark ? '#e2e8f0' : '#1e293b', margin: 0 }}>
            FedHealth<span style={{ color: '#6366f1' }}>AI</span>
          </h1>
          <p style={{ color: isDark ? '#64748b' : '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Federated Learning Healthcare Platform
          </p>
        </div>

        {/* Card */}
        <div className={isDark ? 'glass-card' : 'glass-card-light'} style={{ padding: '2rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.35rem', marginBottom: '1.5rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Sign In
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '0.65rem',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                color: '#f87171',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`input-field ${!isDark ? 'input-field-light' : ''}`}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`input-field ${!isDark ? 'input-field-light' : ''}`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: isDark ? '#64748b' : '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
