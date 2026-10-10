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
import { AuthView } from './views/AuthView';
import { Shield } from 'lucide-react';
import { SplashAnimation } from './components/ui/SplashAnimation';

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
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
};

const MainApp: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <span className="text-xs font-mono text-neutral-400">Verifying judicial clearance...</span>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div
          key="auth-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full w-full"
        >
          <AuthView />
        </motion.div>
      ) : (
        <motion.div
          key="app-shell"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full w-full"
        >
          <AppContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <div className="h-full w-full">
            <MainApp />
          </div>

          <AnimatePresence>
            {showSplash && (
              <motion.div
                key="splash"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="fixed inset-0 z-[100]"
              >
                <SplashAnimation onComplete={() => setShowSplash(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
