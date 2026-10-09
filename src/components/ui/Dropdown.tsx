import React, { useEffect, useRef, useState } from 'react';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  isDestructive?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={`absolute z-50 mt-1.5 w-48 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-1 shadow-xl outline-none focus:outline-none transition-all duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setIsOpen(false);
                }
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-md transition-colors text-left cursor-pointer outline-none focus-visible:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed ${
                item.isDestructive
                  ? 'text-rose-500 hover:bg-rose-500/10'
                  : 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {item.icon && <span className="shrink-0 text-current">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
