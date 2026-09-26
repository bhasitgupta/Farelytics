import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[250px] flex flex-col items-center justify-center p-8 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-center">
          <h3 className="text-lg font-semibold text-rose-400">View Rendering Error</h3>
          <p className="mt-2 text-sm text-white/60 max-w-md">
            An unexpected error occurred while rendering this component.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
          >
            Retry View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
