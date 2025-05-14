import React, { Component } from "react";
import { toast } from "react-toastify";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    this.setState({
      errorInfo: errorInfo,
    });

    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Show a toast notification
    if (error.message && error.message.includes("CORS")) {
      toast.error(
        "A network error occurred. API access is blocked due to CORS restrictions."
      );
    } else {
      toast.error("An error occurred while loading this component");
    }
  }

  render() {
    if (this.state.hasError) {
      const isCorsError =
        this.state.error &&
        (this.state.error.message.includes("CORS") ||
          this.state.error.message.includes("cross-origin") ||
          this.state.error.message.includes("network error"));

      // You can render any custom fallback UI
      return (
        <div className="p-8 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
          <h2 className="text-2xl text-red-400 font-bold mb-4">
            {isCorsError ? "API Connection Error" : "Something went wrong"}
          </h2>

          <div className="bg-slate-900 p-4 rounded mb-4 text-slate-300">
            {isCorsError ? (
              <div>
                <p className="mb-3">
                  We're experiencing issues connecting to the server due to CORS
                  restrictions.
                </p>
                <p className="mb-3">
                  This usually happens when the server isn't configured to
                  accept requests from this domain.
                </p>
                <h3 className="text-yellow-400 font-semibold mt-4 mb-2">
                  Potential Solutions:
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Refresh the page and try again</li>
                  <li>Check if you're using the correct API endpoint</li>
                  <li>
                    Contact the server administrator to whitelist this domain
                  </li>
                </ul>
              </div>
            ) : (
              <p>{this.state.error?.message || "An unknown error occurred"}</p>
            )}
          </div>

          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>

          {/* Only show this in development */}
          {process.env.NODE_ENV !== "production" && this.state.errorInfo && (
            <details className="mt-4 bg-slate-900 p-4 rounded text-slate-300">
              <summary className="cursor-pointer text-blue-400">
                Stack Trace
              </summary>
              <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
