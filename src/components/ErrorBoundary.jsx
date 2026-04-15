import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#07111f] p-6">
          <div className="text-center max-w-sm">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-white text-xl font-bold mb-2">
              {this.props.title || 'Something went wrong'}
            </h1>
            <p className="text-slate-400 text-sm mb-6">
              {this.props.message || 'Please reload the page'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {this.props.reloadLabel || 'Reload'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
