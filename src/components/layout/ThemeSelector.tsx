import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeMode } from '../../types/auth';

export const ThemeSelector: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed = false }) => {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { mode: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { mode: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  if (isCollapsed) {
    const nextMode: ThemeMode = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    const currentIcon =
      theme === 'dark' ? (
        <Moon className="w-4 h-4" />
      ) : theme === 'light' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Monitor className="w-4 h-4" />
      );

    return (
      <button
        onClick={() => setTheme(nextMode)}
        title={`Theme: ${theme}. Click to switch.`}
        className="w-9 h-9 flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
        aria-label="Toggle theme mode"
      >
        {currentIcon}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-md w-full">
      {options.map((opt) => {
        const isActive = theme === opt.mode;
        return (
          <button
            key={opt.mode}
            onClick={() => setTheme(opt.mode)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] ${
              isActive
                ? 'bg-[var(--surface-active)] text-[var(--text-primary)] border border-[var(--border)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
