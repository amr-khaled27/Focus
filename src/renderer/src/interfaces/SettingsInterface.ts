import { User } from "@shared/types/User";

type AuthenticatedUser = Pick<User, "id" | "name" | "email" | "role">;

export default interface SettingsState {
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
