import { Component } from "react";

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-[#0D0D0F] text-white flex-col">
          <h1 className="text-2xl font-bold mb-4">Terjadi Kesalahan</h1>
          <p className="text-red-500 mb-4">
            {this.state.error?.message || "Unknown error"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#7c3aed]"
          >
            Muat Ulang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
