import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import TrainingMonitor from '../monitoring/TrainingMonitor';
import { AuditLogs } from '../admin/AdminComponents2';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const MENU_ITEMS = [
  { key: 'monitoring', label: 'Training Monitoring', icon: '📡' },
  { key: 'logs', label: 'Audit Logs', icon: '📄' },
];

export default function ResearcherDashboard() {
  const [activeSection, setActiveSection] = useState('monitoring');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={isDark ? 'gradient-bg-dark' : 'gradient-bg-light'} style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar menuItems={MENU_ITEMS} activeSection={activeSection} onSelect={setActiveSection} />
        <main style={{ flex: 1, padding: '2rem' }}>
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={isDark ? 'glass-card' : 'glass-card-light'}
            style={{ padding: '2rem', minHeight: 'calc(100vh - 160px)' }}
          >
            {activeSection === 'monitoring' ? <TrainingMonitor isDark={isDark} /> : <AuditLogs isDark={isDark} />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
