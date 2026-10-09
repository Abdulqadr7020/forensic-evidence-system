import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './views/DashboardView';
import { CasesView } from './views/CasesView';
import { DocumentsView } from './views/DocumentsView';
import { TransfersView } from './views/TransfersView';
import { IntegrityView } from './views/IntegrityView';
import { AuditView } from './views/AuditView';
import { DesignSystemShowcase } from './views/DesignSystemShowcase';
import { Button } from './components/ui/Button';
import { Layers, Shield } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, staggerChildren: 0.05 } 
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2 } 
  },
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const tabLabels: Record<string, string> = {
    dashboard: 'Overview',
    cases: 'Cases',
    documents: 'Documents',
    transfers: 'Evidence Transfers',
    forensic: 'Forensic Reports',
    integrity: 'Integrity Verification',
    audit: 'Audit Trail',
    'security-center': 'Security Center',
    'design-system': 'Design System',
  };

  const breadcrumbs = [
    'Sentinel DMS',
    tabLabels[currentTab] || 'Overview',
  ];

  return (
    <AppShell
      breadcrumbs={breadcrumbs}
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
    >
      {/* Main Tab Routing */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="h-full"
        >
          {currentTab === 'dashboard' && <DashboardView />}
          {currentTab === 'cases' && <CasesView />}
          {currentTab === 'documents' && <DocumentsView />}
          {currentTab === 'transfers' && <TransfersView />}
          {currentTab === 'forensic' && <TransfersView />}
          {currentTab === 'integrity' && <IntegrityView />}
          {currentTab === 'audit' && <AuditView />}
          {currentTab === 'security-center' && <IntegrityView />}
          {currentTab === 'design-system' && <DesignSystemShowcase />}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
};


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
