import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, helperText, error, id, className = '', disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-[var(--text-secondary)] select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full h-9 pl-3 pr-8 rounded-md border text-xs bg-white/5 backdrop-blur-sm border-white/10 text-[var(--text-primary)] transition-colors duration-150 outline-none appearance-none cursor-pointer
              ${
                error
                  ? 'border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)]'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 text-[var(--text-muted)] pointer-events-none shrink-0 flex items-center">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
        {error ? (
          <p className="text-[11px] text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
