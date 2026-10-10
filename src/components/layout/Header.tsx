import React, { useState } from 'react';
import { Bell, Menu, Shield, Check, LogOut, AlertCircle, X, Loader2 } from 'lucide-react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { Dropdown, DropdownMenuItem } from '../ui/Dropdown';
import { SearchModal } from '../ui/SearchModal';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

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
  const {
    user,
    isAuthenticated,
    loading,
    authError,
    clearAuthError,
    signInWithGoogle,
    signOut,
  } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch {
      // Error is captured in AuthContext
    } finally {
      setIsSigningIn(false);
    }
  };

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

        {/* Right: Actions, Auth, Search & Notifications */}
        <div className="flex items-center gap-2 shrink-0">
          {/* OAuth Error Banner / Pill */}
          {authError && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[200px]" title={authError}>{authError}</span>
              <button
                onClick={clearAuthError}
                className="p-0.5 hover:text-white rounded"
                aria-label="Dismiss error"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

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

          {/* Google OAuth Trigger / Auth Status */}
          {loading ? (
            <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-muted)] text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span className="hidden sm:inline font-mono text-[11px]">Syncing...</span>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* User Profile Pill */}
              <div className="flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-xs">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="hidden md:inline font-medium text-[var(--text-primary)] truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="hidden lg:inline text-[10px] text-emerald-400 font-mono px-1 py-0.2 rounded bg-emerald-500/10">
                  Google
                </span>
              </div>

              {/* Sign Out Action */}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 h-8 px-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer focus-glow text-xs"
                title="Sign out of Supabase"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-2 h-8 px-2.5 sm:px-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-300 hover:text-cyan-200 text-xs font-medium transition-all shadow-[0_0_12px_rgba(6,182,212,0.12)] cursor-pointer select-none focus-glow disabled:opacity-50"
              aria-label="Sign in with Google"
            >
              {isSigningIn ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <GoogleIcon className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Continue with Google</span>
              <span className="sm:hidden">Google</span>
            </button>
          )}

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
