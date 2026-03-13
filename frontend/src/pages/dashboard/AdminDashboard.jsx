import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { CreateTrainingJob, TrainingJobsList } from '../admin/AdminComponents';
import { TrainingStats, AuditLogs, PendingUsers, LatestModel } from '../admin/AdminComponents2';
import TrainingMonitor from '../monitoring/TrainingMonitor';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ITEMS = [
  { key: 'create-job', label: 'Create Training Job', icon: '➕' },
  { key: 'list-jobs', label: 'List Training Jobs', icon: '📋' },
  { key: 'stats', label: 'Training Statistics', icon: '📊' },
  { key: 'monitoring', label: 'Training Monitoring', icon: '📡' },
  { key: 'model', label: 'Latest Model', icon: '🧠' },
  { key: 'logs', label: 'Audit Logs', icon: '📄' },
  { key: 'pending', label: 'Pending Users', icon: '👥' },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('create-job');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const renderContent = () => {
    switch (activeSection) {
      case 'create-job': return <CreateTrainingJob isDark={isDark} />;
      case 'list-jobs': return <TrainingJobsList isDark={isDark} />;
      case 'stats': return <TrainingStats isDark={isDark} />;
      case 'monitoring': return <TrainingMonitor isDark={isDark} />;
      case 'model': return <LatestModel isDark={isDark} />;
      case 'logs': return <AuditLogs isDark={isDark} />;
      case 'pending': return <PendingUsers isDark={isDark} />;
      default: return <CreateTrainingJob isDark={isDark} />;
    }
  };

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
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={isDark ? 'glass-card' : 'glass-card-light'}
            style={{ padding: '2rem', minHeight: 'calc(100vh - 160px)' }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
