import { useState, useEffect, useCallback } from "react";
import { Mail, LogIn, Smartphone, Monitor, Loader2, X } from "lucide-react";
import { supabase } from "../supabaseClient"; // Adjust path as needed

export default function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Detect if device is mobile
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    // Trigger animations after initial render
    setTimeout(() => {
      setShowAnimation(true);
    }, 300);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const handleLoginEmail = useCallback(async () => {
    if (!email || !email.includes("@")) {
      setMessage("Silakan masukkan email yang valid");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      setMessage(
        error
          ? error.message
          : "Link login telah dikirim ke email Anda. Silakan cek inbox Anda."
      );
    } catch (err) {
      setMessage("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleLoginGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({ provider: "google" });
    } catch (err) {
      setMessage(
        "Terjadi kesalahan saat login dengan Google. Silakan coba lagi."
      );
      setLoading(false);
    }
  }, []);

  const dismissviper = useCallback(() => {
    setMessage("");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Background glow circle */}
        <div
          className={`absolute top-1/4 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full filter blur-3xl opacity-20 ${
            showAnimation ? "animate-pulse-slow" : ""
          }`}
        ></div>
        <div
          className={`absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 ${
            showAnimation ? "animate-pulse-slow" : ""
          }`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10 ${
            showAnimation ? "animate-pulse-slow" : ""
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/4 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl opacity-10 ${
            showAnimation ? "animate-pulse-slow" : ""
          }`}
        ></div>
      </div>

      {/* Animated particles (reduced on mobile) */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: isMobile ? 10 : 20 }).map((_, index) => (
          <div
            key={index}
            className={`absolute w-1 h-1 bg-white rounded-full opacity-20 ${
              showAnimation ? "animate-float" : ""
            }`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Device indicator */}
      <div
        className={`absolute ${
          isMobile ? "top-4 right-4" : "top-6 right-6"
        } flex items-center text-gray-400 z-10 ${
          showAnimation
            ? "opacity-100 transition-opacity duration-1000"
            : "opacity-0"
        }`}
      >
        {isMobile ? (
          <Smartphone className="w-4 h-4 mr-1" />
        ) : (
          <Monitor className="w-4 h-4 mr-1" />
        )}
        <span className="text-xs">{isMobile ? "Mobile" : "Desktop"}</span>
      </div>

      {/* Login form */}
      <div
        className={`w-full max-w-md p-6 sm:p-8 space-y-6 z-10 ${
          showAnimation
            ? "translate-y-0 opacity-100 transition-all duration-1000"
            : "translate-y-8 opacity-0"
        }`}
      >
        <div className="text-center">
          <h2
            className={`text-2xl sm:text-3xl font-bold text-white ${
              showAnimation ? "animate-fade-in" : ""
            }`}
          >
            {isMobile ? "Nexora Login" : "Selamat Datang di Nexora"}
          </h2>
          <p
            className={`mt-2 text-gray-400 transition-all duration-500 ${
              showAnimation ? "animate-fade-in" : ""
            }`}
            style={{ animationDelay: "200ms" }}
          >
            {isMobile
              ? "Silakan masuk ke akun Anda"
              : "Masuk untuk melanjutkan percakapan AI Anda"}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div
              className={`${showAnimation ? "animate-slide-right" : ""}`}
              style={{ animationDelay: "400ms" }}
            >
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-10 py-3 border bg-gray-800/50 backdrop-blur-sm border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-300"
                  placeholder="Alamat email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={message ? "email-error" : undefined}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleLoginEmail}
              disabled={loading}
              className={`relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all duration-300 ${
                showAnimation ? "animate-slide-left" : ""
              }`}
              style={{ animationDelay: "600ms" }}
              aria-label="Login dengan Email"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login dengan Email
                </span>
              )}
            </button>

            <div
              className={`flex items-center ${
                showAnimation ? "animate-fade-in" : ""
              }`}
              style={{ animationDelay: "800ms" }}
            >
              <div className="flex-grow h-px bg-gray-800"></div>
              <div className="px-4 text-sm text-gray-500">atau</div>
              <div className="flex-grow h-px bg-gray-800"></div>
            </div>

            <button
              onClick={handleLoginGoogle}
              disabled={loading}
              className={`relative w-full flex justify-center py-3 px-4 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all duration-300 ${
                showAnimation ? "animate-slide-right" : ""
              }`}
              style={{ animationDelay: "1000ms" }}
              aria-label="Login dengan Google"
            >
              <span className="flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  className="mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path
                      fill="#4285F4"
                      d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                    />
                  </g>
                </svg>
                Login dengan Google
              </span>
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm backdrop-blur-sm flex items-center justify-between ${
              message.includes("kesalahan")
                ? "bg-red-900/30 text-red-300 border border-red-800/50"
                : "bg-blue-900/30 text-blue-300 border border-blue-800/50"
            } animate-fade-in`}
            id="email-error"
          >
            <span>{message}</span>
            <button
              onClick={dismissMessage}
              className="ml-2 text-gray-400 hover:text-white focus:outline-none"
              aria-label="Tutup pesan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div
          className={`mt-6 ${showAnimation ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "1200ms" }}
        >
          <p className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Nexora. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
