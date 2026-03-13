import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import axiosClient from '../../api/axiosClient';

export default function ApprovalPending() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  useEffect(() => {
    const checkApproval = async () => {
      try {
        const email = localStorage.getItem('pending_email');
        if (!email) return;
        const res = await axiosClient.get('/auth/check-approval', {
          params: { email }
        });
        if (res.data?.approved) {
          localStorage.removeItem('pending_email');
          navigate('/login');
        }
      } catch {
        // Still pending or error, keep polling
      }
    };

    intervalRef.current = setInterval(checkApproval, 10000);
    return () => clearInterval(intervalRef.current);
  }, [navigate]);

  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      className={isDark ? 'gradient-bg-dark' : 'gradient-bg-light'}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}
      >
        <div className={isDark ? 'glass-card' : 'glass-card-light'} style={{ padding: '3rem 2rem' }}>
          {/* Animated Icon */}
          <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 2rem' }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: '50%',
                  border: '2px solid rgba(99,102,241,0.4)',
                }}
                animate={{ scale: [1, 1.5, 1.8], opacity: [0.6, 0.2, 0] }}
                transition={{ duration: 2, delay: i * 0.6, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '50%',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>

          <motion.h2
            style={{ fontWeight: 800, fontSize: '1.6rem', color: isDark ? '#e2e8f0' : '#1e293b', marginBottom: '1rem' }}
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Awaiting Approval
          </motion.h2>

          <p style={{ fontSize: '1rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            Your account is <strong style={{ color: '#6366f1' }}>pending admin approval</strong>.
          </p>
          <p style={{ fontSize: '0.9rem', color: isDark ? '#64748b' : '#94a3b8', lineHeight: 1.6 }}>
            You will gain access once the administrator approves your account.
            This page checks automatically every 10 seconds.
          </p>

          <div style={{
            marginTop: '2rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(99,102,241,0.1)',
            borderRadius: '9999px',
            padding: '0.5rem 1rem',
            color: '#818cf8',
            fontSize: '0.85rem',
          }}>
            <motion.div
              style={{
                width: '8px', height: '8px',
                background: '#6366f1',
                borderRadius: '50%',
              }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Checking approval status...
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6366f1',
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
