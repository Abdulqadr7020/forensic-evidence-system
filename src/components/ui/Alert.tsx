import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) => {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    danger: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
  };

  const variantStyles = {
    success: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    warning: 'bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-300',
    danger: 'bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-300',
    info: 'bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-300',
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3 rounded-lg border text-xs leading-relaxed transition-all duration-150 ${variantStyles[variant]} ${className}`}
    >
      <div className="mt-0.5">{icons[variant]}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-xs mb-0.5 text-current">{title}</h4>}
        <div className="opacity-90">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded text-current opacity-70 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
