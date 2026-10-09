import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  isMonospace?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  isMonospace = false,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-[11px] px-2 py-0.5 gap-1.5',
  }[size];

  const variantStyles = {
    default:
      'bg-white/5 text-[var(--text-secondary)] border-white/10 backdrop-blur-sm',
    primary:
      'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/30 backdrop-blur-sm',
    success:
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 backdrop-blur-sm',
    warning:
      'bg-amber-500/10 text-amber-400 border-amber-500/30 backdrop-blur-sm',
    danger:
      'bg-rose-500/10 text-rose-400 border-rose-500/30 backdrop-blur-sm',
    info:
      'bg-blue-500/10 text-blue-400 border-blue-500/30 backdrop-blur-sm',
    neutral:
      'bg-white/5 text-[var(--text-muted)] border-[var(--border-subtle)] backdrop-blur-sm',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-[6px] border select-none whitespace-nowrap shrink-0 ${sizeStyles} ${variantStyles} ${
        isMonospace ? 'font-mono' : ''
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
