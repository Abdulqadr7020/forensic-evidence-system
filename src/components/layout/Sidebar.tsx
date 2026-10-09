import React from 'react';
import { Logo } from './Logo';
import { NAV_ITEMS, NavItem } from './navConfig';
import { useAuth } from '../../context/AuthContext';
import { ThemeSelector } from './ThemeSelector';
import { ChevronLeft, ChevronRight, UserCircle, Shield, ChevronDown } from 'lucide-react';
import { UserRole } from '../../types/auth';
import { Dropdown, DropdownMenuItem } from '../ui/Dropdown';

export interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user, switchRole } = useAuth();

  // Filter items permitted for the user's role
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(user.role)
  );

  const roleOptions: { role: UserRole; title: string }[] = [
    { role: 'police', title: 'Police / Investigating Officer' },
    { role: 'forensic', title: 'Forensic Laboratory Specialist' },
    { role: 'prosecutor', title: 'Public Prosecutor' },
    { role: 'admin', title: 'System Administrator' },
    { role: 'auditor', title: 'Independent Judicial Auditor' },
  ];

  const roleMenuItems: DropdownMenuItem[] = roleOptions.map((opt) => ({
    id: opt.role,
    label: opt.title,
    icon: <Shield className="w-3.5 h-3.5 text-current" />,
    onClick: () => switchRole(opt.role),
  }));

  return (
    <aside
      className={`hidden md:flex flex-col justify-between border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-200 select-none z-30 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
      style={{ height: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Top Section: Branding */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] min-h-[57px]">
          <Logo isCollapsed={isCollapsed} />
        </div>

        {/* Role Switcher in Sidebar */}
        {!isCollapsed && (
          <div className="px-3 pt-3">
            <Dropdown
              align="left"
              trigger={
                <div className="flex items-center justify-between p-2 rounded-md bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <Shield className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    <span className="truncate font-medium capitalize">{user.role} Portal</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                </div>
              }
              items={roleMenuItems}
              className="w-full"
            />
          </div>
        )}

        {/* Main Navigation */}
        <nav className="p-2 space-y-1 mt-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] ${
                  isActive
                    ? 'bg-[var(--surface-active)] text-[var(--text-primary)] border border-[var(--border)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Theme, User Profile, Collapse Toggle */}
      <div className="p-3 border-t border-[var(--border)] space-y-3 bg-[var(--surface)]">
        {/* Theme Selector */}
        <ThemeSelector isCollapsed={isCollapsed} />

        {/* User Card */}
        <div
          className={`flex items-center gap-2.5 p-2 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] text-left ${
            isCollapsed ? 'justify-center p-2' : ''
          }`}
          title={`${user.name} (${user.department})`}
        >
          <div className="w-7 h-7 rounded-full bg-[var(--surface-active)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-primary)] shrink-0 text-xs font-semibold">
            {user.name.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate font-mono">
                {user.badgeNumber || user.role}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-1.5 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] transition-colors cursor-pointer"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[11px]">Collapse View</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
