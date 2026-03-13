import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { OrgJobsList, UploadDataset } from '../organization/OrgComponents';
import TrainingMonitor from '../monitoring/TrainingMonitor';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const MENU_ITEMS = [
  { key: 'jobs', label: 'Available Jobs', icon: '🚀' },
  { key: 'upload', label: 'Upload Dataset', icon: '📁' },
  { key: 'monitoring', label: 'Training Monitoring', icon: '📡' },
];

export default function OrganizationDashboard() {
  const [activeSection, setActiveSection] = useState('jobs');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const renderContent = () => {
    switch (activeSection) {
      case 'jobs': return <OrgJobsList isDark={isDark} />;
      case 'upload': return <UploadDataset isDark={isDark} />;
      case 'monitoring': return <TrainingMonitor isDark={isDark} />;
      default: return <OrgJobsList isDark={isDark} />;
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
