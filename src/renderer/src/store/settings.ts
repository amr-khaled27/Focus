import { create } from "zustand";
import SettingsState from "@renderer/interfaces/SettingsInterface";

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
      const res = await window.api.isAdminInitialized();
      console.log("isAdminInitialized:", res.isInitialized);
      set({ isAdminInitialized: res.isInitialized });

      if (!res.isInitialized) {
        set({ user: null, isAuthenticated: false, isChecking: false });
        return;
      }

      const session = await window.api.isUserAuthenticated();
      console.log("isUserAuthenticated:", session.authenticated);
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
