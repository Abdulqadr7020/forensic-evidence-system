import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  children,
}) => {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
};
