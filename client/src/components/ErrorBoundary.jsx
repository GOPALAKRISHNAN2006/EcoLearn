import React from "react";
import { AlertTriangle, RefreshCw, Home, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    // If it was a chunk loading error, a hard reload fetches the fresh bundles
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.message?.includes("dynamically imported module") ||
        this.state.error?.message?.includes("Loading chunk");

      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              {isChunkError ? (
                <RefreshCw className="w-8 h-8 animate-spin" style={{ animationDuration: "6s" }} />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isChunkError ? "Page Update Available" : "Something went wrong"}
              </h2>
              <p className="text-sm text-slate-400">
                {isChunkError
                  ? "A new version of EcoLearn is available or a connection hiccup occurred. Please refresh to load the latest page."
                  : "An unexpected error occurred while rendering this page. You can reload or return to the homepage."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={this.handleReload}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex-1 shadow-lg shadow-emerald-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2 flex-1"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
