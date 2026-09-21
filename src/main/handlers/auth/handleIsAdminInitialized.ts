import { checkAdminInitialized } from "@main/utils/checkAdminInitialized";
import { ipcMain } from "electron";
import isTrustedSender from "@main/utils/isTrustedSender";

export function handleIsAdminInitialized(
  mainWindow: Electron.BrowserWindow | null,
) {
  ipcMain.handle("isAdminInitialized", async (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return await checkAdminInitialized();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to check admin initialization:", error);
        return {
          success: false,
          error: error.message,
        };
      } else {
        return {
          success: false,
          error: "Failed to check admin initialization",
        };
      }
    }
  });
}
