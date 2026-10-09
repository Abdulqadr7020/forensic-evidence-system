import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, id, className = '', disabled, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium text-[var(--text-secondary)] select-none"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={`w-full p-3 rounded-md border text-xs bg-white/5 backdrop-blur-sm border-white/10 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors duration-150 outline-none min-h-[80px] resize-y
            ${
              error
                ? 'border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error ? (
          <p className="text-[11px] text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
