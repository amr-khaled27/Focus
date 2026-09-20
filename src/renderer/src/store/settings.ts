import { create } from "zustand";
import { User } from "@shared/types/User";

type AuthenticatedUser = Pick<User, "id" | "name" | "email" | "role">;

interface SettingsState {
  isAdminInitialized: boolean | null;
  isChecking: boolean;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  checkAppState: () => Promise<void>;
  checkAdminStatus: () => Promise<void>;
  setIsAdminInitialized: (status: boolean) => void;
  setUser: (user: AuthenticatedUser) => void;
  clearUser: () => void;
}

const useSettingsStore = create<SettingsState>((set, get) => ({
  isAdminInitialized: null,
  isChecking: false,
  user: null,
  isAuthenticated: false,

  checkAppState: async () => {
    if (get().isChecking) {
      return;
    }

    set({ isChecking: true });

    try {
      const isAdminInitialized = await window.api.isAdminInitialized();
      set({ isAdminInitialized });

      if (!isAdminInitialized) {
        set({ user: null, isAuthenticated: false, isChecking: false });
        return;
      }

      const session = await window.api.isUserAuthenticated();
      set({
        user: session.user,
        isAuthenticated: session.authenticated,
        isChecking: false,
      });
    } catch (error) {
      console.error("Failed to check app state:", error);
      set({
        isAdminInitialized: false,
        user: null,
        isAuthenticated: false,
        isChecking: false,
      });
    }
  },

  checkAdminStatus: async () => {
    await get().checkAppState();
  },

  setIsAdminInitialized: (status: boolean) =>
    set({ isAdminInitialized: status }),

  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));

useSettingsStore.getState().checkAppState();

export default useSettingsStore;
