import { create } from "zustand";
import type { AuthResponse, User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  /** True until we've checked whether a stored token is still valid. */
  loading: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),

  // A page refresh keeps the token but loses the user object, so the app
  // starts in "checking" state and restores the profile from /auth/profile.
  // Without this the UI flashes logged-out on every reload, and admin
  // routes would bounce a real admin to the login page.
  loading: Boolean(localStorage.getItem("token")),

  login: (data) => {
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token, loading: false });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, loading: false });
  },

  setUser: (user) => set({ user }),

  setLoading: (loading) => set({ loading }),
}));

export const isAdmin = (user: User | null) => user?.role === "ADMIN";
