import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const roleColors = {
  ADMIN: 'rgba(239,68,68,0.2)',
  ORG_NODE: 'rgba(16,185,129,0.2)',
  RESEARCHER: 'rgba(234,179,8,0.2)',
  AUDITOR: 'rgba(99,102,241,0.2)',
};

const roleLabels = {
  ADMIN: 'Admin',
  ORG_NODE: 'Organization',
  RESEARCHER: 'Researcher',
  AUDITOR: 'Auditor',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        background: isDark
          ? 'rgba(15, 15, 26, 0.85)'
          : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(99,102,241,0.15)',
        boxShadow: isDark
          ? '0 4px 24px rgba(0,0,0,0.3)'
          : '0 4px 24px rgba(99,102,241,0.1)',
      }}
      className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: '0.65rem',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          FedHealth<span style={{ color: '#6366f1' }}>AI</span>
        </span>
      </div>

      {/* User info + controls */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-3">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {user.email}
              </div>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#6366f1',
                background: roleColors[user.role] || 'rgba(99,102,241,0.15)',
                padding: '1px 8px',
                borderRadius: '9999px',
                display: 'inline-block',
                marginTop: '2px',
              }}>
                {roleLabels[user.role] || user.role}
              </div>
            </div>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.1)',
            border: 'none',
            borderRadius: '0.65rem',
            padding: '8px',
            cursor: 'pointer',
            color: isDark ? '#e2e8f0' : '#6366f1',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s',
          }}
          title="Toggle theme"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Logout */}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '0.65rem',
              padding: '8px 14px',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s',
              boxShadow: '0 3px 12px rgba(239,68,68,0.3)',
            }}
          >
            <LogoutIcon />
            Logout
          </button>
        )}
      </div>
    </motion.nav>
  );
}
