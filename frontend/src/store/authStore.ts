import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  id: number;
  username: string;
  role: "user" | "admin";
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isAdminMode: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  toggleAdminMode: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAdminMode: false,
      login: (token, user) => set({ token, user, isAdminMode: false }),
      logout: () => set({ token: null, user: null, isAdminMode: false }),
      toggleAdminMode: () => set((state) => ({ isAdminMode: !state.isAdminMode })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
