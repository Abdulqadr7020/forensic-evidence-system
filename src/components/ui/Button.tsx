import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-app)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0';

    const sizeStyles = {
      sm: 'h-7 px-2.5 text-xs gap-1.5',
      md: 'h-9 px-3.5 text-xs gap-2',
      lg: 'h-10 px-4 text-sm gap-2',
      icon: 'h-9 w-9 p-0 justify-center',
    }[size];

    const variantStyles = {
      primary:
        'bg-[var(--accent-blue)] text-white shadow-[0_0_15px_rgba(14,165,233,0.4)] border border-transparent hover:opacity-90 active:scale-[0.99]',
      secondary:
        'bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md text-[var(--text-primary)] active:bg-white/20',
      outline:
        'bg-transparent text-[var(--accent-purple)] border border-[var(--accent-purple)] hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:bg-[var(--accent-purple)] hover:bg-opacity-10',
      ghost:
        'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]',
      destructive:
        'bg-transparent text-rose-500 border border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500/50 active:bg-rose-500/20',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
