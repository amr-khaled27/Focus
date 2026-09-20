import { ElectronAPI } from "@electron-toolkit/preload";
import { User } from "@shared/types/User";

type unsubscribe = () => void;

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getUsers: () => Promise<Omit<User, "pin">[]>;
      isAdminInitialized: () => Promise<boolean>;
      initAdmin: (payload: {
        name: string;
        email: string;
        pin: string;
      }) => Promise<
        | {
            success: true;
            user: Pick<User, "id" | "name" | "email" | "role">;
          }
        | { success: false; error: string }
      >;
      isUserAuthenticated: () => Promise<{
        authenticated: boolean;
        user: Omit<User, "pin"> | null;
      }>;
      login: (payload: { userId: number; pin: string }) => Promise<
        | {
            success: true;
            user: Pick<User, "id" | "name" | "email" | "role">;
          }
        | { success: false; error: string }
      >;
      logout: () => Promise<{ success: boolean }>;
    };
  }
}
