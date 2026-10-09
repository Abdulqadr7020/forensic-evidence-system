import React from 'react';
import { X, Shield } from 'lucide-react';
import { Logo } from './Logo';
import { NAV_ITEMS } from './navConfig';
import { useAuth } from '../../context/AuthContext';
import { ThemeSelector } from './ThemeSelector';
import { UserRole } from '../../types/auth';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onSelectTab: (tabId: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
}) => {
  const { user, switchRole } = useAuth();

  if (!isOpen) return null;

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(user.role)
  );

  const roles: { role: UserRole; title: string }[] = [
    { role: 'police', title: 'Police / IO' },
    { role: 'forensic', title: 'Forensic Lab' },
    { role: 'prosecutor', title: 'Prosecutor' },
    { role: 'admin', title: 'Admin' },
    { role: 'auditor', title: 'Auditor' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-72 max-w-[80vw] h-full bg-[var(--surface)] border-r border-[var(--border)] p-4 flex flex-col justify-between shadow-2xl z-10">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <Logo isCollapsed={false} />
            <button
              onClick={onClose}
              className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus-glow"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 mt-3">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors focus-glow ${
                    isActive
                      ? 'bg-[var(--surface-active)] text-[var(--text-primary)] border border-[var(--border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Drawer items */}
        <div className="pt-4 border-t border-[var(--border)] space-y-3">
          <ThemeSelector isCollapsed={false} />
          <div className="p-2 rounded-md bg-[var(--surface-elevated)] border border-[var(--border)]">
            <p className="text-xs font-medium text-[var(--text-primary)] truncate">{user.name}</p>
            <p className="text-[10px] text-[var(--text-muted)] truncate">{user.department}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
