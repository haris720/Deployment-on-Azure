import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "@/routes/AppRoutes";
import { useAuth } from "@/store/auth.store";
import api from "@/api/axios";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * A page refresh keeps the token in localStorage but loses the user
 * object held in memory. This restores it from /auth/profile once at
 * startup, and clears a token the server no longer accepts.
 */
function SessionLoader({ children }: { children: ReactNode }) {
  const token = useAuth((s) => s.token);
  const setUser = useAuth((s) => s.setUser);
  const logout = useAuth((s) => s.logout);
  const setLoading = useAuth((s) => s.setLoading);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    api
      .get("/auth/profile")
      .then(({ data }) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Runs once at startup; login() sets the user directly afterwards.
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionLoader>
        <AppRoutes />
      </SessionLoader>
    </QueryClientProvider>
  );
}
