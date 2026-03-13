import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const ChevronIcon = ({ open }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function Sidebar({ menuItems, activeSection, onSelect }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.aside
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        width: '250px',
        minHeight: 'calc(100vh - 60px)',
        background: isDark
          ? 'rgba(15,15,26,0.6)'
          : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        borderRight: isDark
          ? '1px solid rgba(255,255,255,0.07)'
          : '1px solid rgba(99,102,241,0.1)',
        padding: '1.5rem 0.75rem',
        flexShrink: 0,
        boxShadow: isDark
          ? '4px 0 24px rgba(0,0,0,0.25)'
          : '4px 0 20px rgba(99,102,241,0.08)',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.9rem',
              borderRadius: '0.75rem',
              fontWeight: 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              background: activeSection === item.key
                ? isDark
                  ? 'rgba(99,102,241,0.2)'
                  : 'rgba(99,102,241,0.12)'
                : 'transparent',
              color: activeSection === item.key
                ? '#6366f1'
                : isDark ? '#94a3b8' : '#475569',
              borderLeft: activeSection === item.key
                ? '3px solid #6366f1'
                : '3px solid transparent',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </motion.aside>
  );
}
