import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import LoadingIndicator from "./components/LoadingIndicator.jsx";
import "./styles/global.css";
//import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          throw new Error("Gagal memuat sesi: " + error.message);
        }
        if (isMounted) {
          console.log("Initial session:", session); // Debugging
          setSession(session);
        }
      } catch (err) {
        console.error("Error checking session:", err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        console.log("Auth state changed:", session); // Debugging
        setSession(session);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <LoadingIndicator isLoading={true} />;
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0D0D0F] text-white">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary>
          {session ? <Home session={session} /> : <Login />}
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
