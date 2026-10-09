import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: string[];
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  onNavigateToDocument?: (docId: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  breadcrumbs = ['Sentinel DMS', 'Overview'],
  currentTab,
  onSelectTab,
  onNavigateToDocument,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen text-[var(--text-primary)] flex bg-transparent">
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        currentTab={currentTab}
        onSelectTab={onSelectTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          breadcrumbs={breadcrumbs}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onNavigateToDocument={onNavigateToDocument}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
