import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load records',
  description,
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-6 text-center rounded-lg border border-rose-500/20 bg-rose-500/5 ${className}`}
    >
      <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-500 mb-2.5">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-xs font-semibold text-rose-500 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <div className="mt-3">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={onRetry}
          >
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
};
