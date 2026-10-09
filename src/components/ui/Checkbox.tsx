import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, checked, disabled, className = '', id, onChange, ...props }, ref) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={checkboxId}
        className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div className="w-4 h-4 rounded border border-white/10 bg-white/5 backdrop-blur-sm transition-all peer-checked:bg-[var(--accent-blue)] peer-checked:border-[var(--accent-blue)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-blue)] flex items-center justify-center">
            {checked && (
              <Check className="w-3 h-3 text-white stroke-[3]" />
            )}
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col text-xs leading-tight">
            {label && <span className="font-medium text-[var(--text-primary)]">{label}</span>}
            {description && (
              <span className="text-[11px] text-[var(--text-muted)] mt-0.5">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
