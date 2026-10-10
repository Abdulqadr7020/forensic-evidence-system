import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Shield, AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ForenCrypt uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-black text-white">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl border border-rose-500/20 bg-[#0c1017]/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-4 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-semibold tracking-tight text-white mb-1">
              Application Notice
            </h2>

            <p className="text-xs text-neutral-400 font-mono mb-4">
              A runtime interruption occurred. Security boundary preserved.
            </p>

            <div className="p-3 mb-6 rounded-lg bg-black/40 border border-white/5 text-left">
              <p className="text-xs text-rose-300 font-mono break-words">
                {this.state.error?.message || 'Unknown runtime error'}
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black text-xs font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
