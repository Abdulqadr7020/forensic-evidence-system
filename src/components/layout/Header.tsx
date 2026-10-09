import React, { useState } from 'react';
import { Bell, Menu, Shield, Check } from 'lucide-react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { Dropdown, DropdownMenuItem } from '../ui/Dropdown';
import { SearchModal } from '../ui/SearchModal';

export interface HeaderProps {
  breadcrumbs: string[];
  onOpenMobileNav: () => void;
  onNavigateToDocument?: (docId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  breadcrumbs,
  onOpenMobileNav,
  onNavigateToDocument,
}) => {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Tampering Detected in Evidence #DOC-8802',
      desc: 'Ciphertext SHA-256 hash mismatch detected during periodic verification.',
      time: '12m ago',
      isCritical: true,
    },
    {
      id: 'notif-2',
      title: 'Evidence Transfer Request',
      desc: 'Forensic Lab assigned to FIR-2026-0881 by CCB Inspector Rathore.',
      time: '45m ago',
      isCritical: false,
    },
    {
      id: 'notif-3',
      title: 'Signed Merkle Checkpoint #104 Committed',
      desc: 'Ed25519 root signature verified by judicial hardware module.',
      time: '2h ago',
      isCritical: false,
    },
  ];

  const notificationItems: DropdownMenuItem[] = [
    ...notifications.map((n) => ({
      id: n.id,
      label: n.title,
      icon: <span className={`w-2 h-2 rounded-full ${n.isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`} />,
      onClick: () => {
        setHasUnreadAlerts(false);
      },
    })),
    {
      id: 'mark-all-read',
      label: 'Mark All as Acknowledged',
      icon: <Check className="w-3.5 h-3.5" />,
      onClick: () => setHasUnreadAlerts(false),
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 h-14 px-4 sm:px-6 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md select-none">
        {/* Left: Mobile Nav Toggle + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileNav}
            className="md:hidden p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] focus-glow"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs truncate">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[var(--text-muted)]">/</span>}
                <span
                  className={
                    idx === breadcrumbs.length - 1
                      ? 'font-medium text-[var(--text-primary)] truncate'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors'
                  }
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right: Search trigger + Notifications + User Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Trigger Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 h-8 px-2.5 sm:px-3 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs transition-colors cursor-pointer select-none focus-glow"
            aria-label="Search records"
          >
            <MagnifyingGlass className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
            <span className="hidden sm:inline text-xs font-normal">Search cases, evidence, personnel...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-black/[0.08] bg-black/[0.03] dark:border-white/[0.08] dark:bg-white/[0.06] px-1.5 py-0.5 font-sans text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
              <span className="text-[12px] leading-none">⌘</span>K
            </kbd>
          </button>

          {/* Notifications Dropdown */}
          <Dropdown
            align="right"
            trigger={
              <button
                className="relative p-2 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer focus-glow"
                aria-label="View notifications"
              >
                <Bell className="w-3.5 h-3.5" />
                {hasUnreadAlerts && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            }
            items={notificationItems}
          />

          {/* Role Badge Indicator */}
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface-elevated)] text-[11px] text-[var(--text-secondary)] font-mono">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span className="capitalize">{user.role}</span>
          </div>
        </div>
      </header>

      {/* Modern Minimalist Command Palette Search Modal */}
      <SearchModal
        modal
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectResult={(res) => {
          setIsSearchOpen(false);
          if (onNavigateToDocument) onNavigateToDocument(res.name);
        }}
      />
    </>
  );
};
