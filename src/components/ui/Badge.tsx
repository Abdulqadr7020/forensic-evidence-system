import React from 'react';
import { HTMLMotionProps, motion } from 'framer-motion';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps extends HTMLMotionProps<"div"> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  isMonospace?: boolean;
  children?: React.ReactNode;
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
      'bg-white/5 text-[var(--text-secondary)] border-white/10 backdrop-blur-sm hover:bg-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]',
    primary:
      'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/30 backdrop-blur-sm hover:shadow-[0_0_8px_rgba(14,165,233,0.3)]',
    success:
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 backdrop-blur-sm hover:shadow-[0_0_8px_rgba(16,185,129,0.3)]',
    warning:
      'bg-amber-500/10 text-amber-400 border-amber-500/30 backdrop-blur-sm hover:shadow-[0_0_8px_rgba(245,158,11,0.3)]',
    danger:
      'bg-rose-500/10 text-rose-400 border-rose-500/30 backdrop-blur-sm hover:shadow-[0_0_8px_rgba(244,63,94,0.3)]',
    info:
      'bg-blue-500/10 text-blue-400 border-blue-500/30 backdrop-blur-sm hover:shadow-[0_0_8px_rgba(59,130,246,0.3)]',
    neutral:
      'bg-white/5 text-[var(--text-muted)] border-[var(--border-subtle)] backdrop-blur-sm hover:bg-white/10',
  }[variant];

  return (
    <motion.div
      className={`inline-flex items-center font-medium rounded-[6px] border select-none whitespace-nowrap shrink-0 transition-colors duration-150 focus-glow ${sizeStyles} ${variantStyles} ${
        isMonospace ? 'font-mono' : ''
      } ${className}`}
      whileHover={props.onClick ? { scale: 1.02 } : undefined}
      whileTap={props.onClick ? { scale: 0.98 } : undefined}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.div>
  );
};
