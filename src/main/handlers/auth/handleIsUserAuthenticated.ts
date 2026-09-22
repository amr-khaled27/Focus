import { getSession } from "@main/db/index";
import { User } from "@shared/types/User";
import isTrustedSender from "@main/utils/isTrustedSender";
import { handle } from "@main/utils/handle";

export function handleIsUserAuthenticated(
  mainWindow: Electron.BrowserWindow | null,
) {
  handle(mainWindow, "isUserAuthenticated", async (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return {
        success: false,
        authenticated: false,
        user: null,
        error: "طلب غير موثوق",
      };
    }

    try {
      const user: Omit<User, "pin"> | null = await getSession();

      if (user) {
        return { success: true, authenticated: true, user };
      } else {
        return { success: true, authenticated: false, user: null };
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          authenticated: false,
          user: null,
          error: error.message,
        };
      } else {
        return {
          success: false,
          authenticated: false,
          user: null,
          error: "Failed to check user authentication",
        };
      }
    }
  });
}
