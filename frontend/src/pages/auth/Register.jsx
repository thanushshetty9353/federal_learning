import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import axiosClient from '../../api/axiosClient';

const ROLES = [
  { value: 'ORG_NODE', label: 'Organization' },
  { value: 'RESEARCHER', label: 'Researcher' },
  { value: 'AUDITOR', label: 'Auditor' },
];

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', role: '', organization_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Please enter a valid email address.';
    if (!form.password || form.password.length < 6)
      return 'Password must be at least 6 characters.';
    if (!form.role)
      return 'Please select a role.';
    if (form.role === 'ORG_NODE' && !form.organization_name.trim())
      return 'Organization name is required for Organization role.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('email', form.email);
      params.append('password', form.password);
      params.append('requested_role', form.role);
      if (form.organization_name) params.append('organization_name', form.organization_name);

      await axiosClient.post('/auth/register', null, { params });
      // Store email for approval check
      localStorage.setItem('pending_email', form.email);
      navigate('/approval-pending');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
        style={{ width: '100%', maxWidth: '440px' }}
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
              borderRadius: '1.25rem', marginBottom: '1rem',
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
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Create your account
          </p>
        </div>

        {/* Card */}
        <div className={isDark ? 'glass-card' : 'glass-card-light'} style={{ padding: '2rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.35rem', marginBottom: '1.5rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Register
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '0.65rem', padding: '0.75rem 1rem',
                marginBottom: '1rem', color: '#f87171', fontSize: '0.875rem',
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>
                Email Address *
              </label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="your@email.com"
                className={`input-field ${!isDark ? 'input-field-light' : ''}`}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>
                Password * <span style={{ fontWeight: 400, color: '#64748b' }}>(min. 6 characters)</span>
              </label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="••••••••"
                className={`input-field ${!isDark ? 'input-field-light' : ''}`}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>
                Role *
              </label>
              <select
                name="role" value={form.role} onChange={handleChange}
                className={`input-field ${!isDark ? 'input-field-light' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select your role...</option>
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <AnimatePresence>
              {form.role === 'ORG_NODE' && (
                <motion.div
                  key="org-name"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>
                    Organization Name *
                  </label>
                  <input
                    type="text" name="organization_name" value={form.organization_name} onChange={handleChange}
                    placeholder="e.g. City Hospital"
                    className={`input-field ${!isDark ? 'input-field-light' : ''}`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
