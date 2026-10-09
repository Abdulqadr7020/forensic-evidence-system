import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-elevated)] ${className}`}
    >
      <div className="p-3 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-muted)] mb-3">
        {icon}
      </div>
      <h3 className="text-xs font-semibold text-[var(--text-primary)] tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
