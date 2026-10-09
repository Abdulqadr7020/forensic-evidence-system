import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 border-b border-[var(--border)] overflow-x-auto scrollbar-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 py-2 px-3 text-xs font-medium border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] ${
              isActive
                ? 'border-[var(--accent-blue)] text-[var(--accent-blue)] shadow-[0_4px_10px_-5px_var(--accent-blue)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-white hover:border-white/20'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full border ${
                  isActive
                    ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/30'
                    : 'bg-white/5 text-[var(--text-muted)] border-white/10'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
