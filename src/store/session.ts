import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Role } from "@/types";
import { MOCK_USERS } from "@/lib/mock-data";
import { login as apiLogin } from "@/lib/api";

interface SessionState {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (email: string, password?: string, role?: Role) => Promise<User>;
  logout: () => void;
  switchRole: (role: Role) => void;
  setUser: (user: User, token?: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      currentUser: null,
      token: null,
      isLoading: false,
      hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),

      login: async (email: string, _password?: string, role?: Role) => {
        set({ isLoading: true });
        try {
          const res = await apiLogin(email);
          let userToSet = res.user;

          if (role) {
            const matched = MOCK_USERS.find((u) => u.role === role);
            if (matched) {
              userToSet = matched;
            }
          }

          const tokenToSet = `mock-jwt-token-${userToSet.id}`;
          set({ currentUser: userToSet, token: tokenToSet, isLoading: false });
          return userToSet;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({ currentUser: null, token: null });
      },

      switchRole: (role: Role) => {
        const targetUser = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
        set({ currentUser: targetUser, token: `mock-jwt-token-${targetUser.id}` });
      },

      setUser: (user: User, token?: string) => {
        set({ currentUser: user, token: token || `mock-jwt-token-${user.id}` });
      },
    }),
    {
      name: "innovategov-session",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
