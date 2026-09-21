import { ipcMain } from "electron";
import { clearSession } from "@main/db/index";
import isTrustedSender from "@main/utils/isTrustedSender";

export function handleLogout(mainWindow: Electron.BrowserWindow | null) {
  ipcMain.handle("logout", async (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      console.log("logging user out");
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
