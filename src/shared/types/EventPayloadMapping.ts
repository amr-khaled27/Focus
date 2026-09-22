import { User } from "./User";

export type EventPayloadMapping = {
  // auth routes
  getUsers: { success: boolean; users?: Omit<User, "pin">[]; error?: string };
  initAdmin: {
    success: boolean;
    user?: Omit<User, "pin" | "createdAt">;
    error?: string;
  };
  isAdminInitialized: {
    success: boolean;
    isInitialized: boolean;
    error?: string;
  };
  isUserAuthenticated: {
    success: boolean;
    authenticated: boolean;
    user: Omit<User, "pin"> | null;
    error?: string;
  };
  login: {
    success: boolean;
    user?: Omit<User, "pin" | "createdAt">;
    error?: string;
  };
  logout: { success: boolean; error?: string };

  // photo routes
};
