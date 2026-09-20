import { ipcMain } from "electron";
import { clearSession } from "@main/db/index";

export function handleLogout() {
  ipcMain.handle("logout", async () => {
    try {
      await clearSession();
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to logout:", error);
        return {
          success: false,
          error: error.message,
        };
      } else {
        return { success: false, error: "Logout failed" };
      }
    }
  });
}
