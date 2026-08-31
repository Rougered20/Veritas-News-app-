import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Frontend ErrorBoundary caught error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div id="error-boundary-container" className="p-8 my-8 max-w-xl mx-auto bg-amber-50/70 border border-amber-200 rounded-xl text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-800">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Resilient Self-Healing Mode Active</h3>
          <p className="text-sm text-slate-600 mb-4">
            A component encounter was gracefully isolated. The underlying verified news stream remains protected.
          </p>
          <button
            id="retry-error-boundary-btn"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Restore Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
