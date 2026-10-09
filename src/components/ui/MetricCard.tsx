import React from 'react';
import { GlassPanel } from './GlassPanel';

export interface MetricCardProps {
  label: string;
  value: string | number;
  supportingText?: string;
  icon?: React.ReactNode;
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  alertBadge?: React.ReactNode;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  supportingText,
  icon,
  trendText,
  trendDirection = 'neutral',
  alertBadge,
  onClick,
}) => {
  return (
    <GlassPanel
      {...(onClick ? { onClick } : {})}
      className={`flex flex-col justify-between p-4 sm:p-5 transition-all duration-150 ${
        onClick
          ? 'hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] cursor-pointer'
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--text-secondary)] tracking-tight">
          {label}
        </span>
        {icon && (
          <div className="text-[var(--text-muted)] shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="my-2 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] font-mono tabular-nums">
          {value}
        </div>
        {alertBadge && <div>{alertBadge}</div>}
      </div>

      {(supportingText || trendText) && (
        <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
          {supportingText && <span>{supportingText}</span>}
          {trendText && (
            <span
              className={`font-medium ${
                trendDirection === 'up'
                  ? 'text-emerald-500'
                  : trendDirection === 'down'
                  ? 'text-amber-500'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              {trendText}
            </span>
          )}
        </div>
      )}
    </GlassPanel>
  );
};
