import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'danger' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id'>) => void;
  success: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...msg, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((title: string, description?: string) => {
    toast({ type: 'success', title, description });
  }, [toast]);

  const warning = useCallback((title: string, description?: string) => {
    toast({ type: 'warning', title, description });
  }, [toast]);

  const error = useCallback((title: string, description?: string) => {
    toast({ type: 'danger', title, description });
  }, [toast]);

  const info = useCallback((title: string, description?: string) => {
    toast({ type: 'info', title, description });
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, warning, error, info }}>
      {children}
      {/* Toast viewport */}
      <div 
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-3 rounded-lg border shadow-lg transition-all duration-200"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
              {t.type === 'danger' && <AlertCircle className="w-4 h-4 text-rose-500" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-tight">{t.title}</p>
              {t.description && (
                <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--text-muted)' }}>
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 rounded hover:bg-neutral-500/10 text-neutral-400 hover:text-neutral-200 transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
