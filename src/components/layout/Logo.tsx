import React from 'react';

export const Logo: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed = false }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-7 h-7 rounded-md bg-[var(--text-primary)] text-[var(--bg-app)] flex items-center justify-center shrink-0 font-bold shadow-xs">
        {/* Minimal geometric shield / document symbol */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>

      {!isCollapsed && (
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-xs tracking-tight text-[var(--text-primary)] uppercase">
            Sentinel
          </span>
          <span className="text-[10px] font-mono font-medium px-1 py-0.2 rounded border border-[var(--border-strong)] text-[var(--text-secondary)]">
            DMS
          </span>
        </div>
      )}
    </div>
  );
};
