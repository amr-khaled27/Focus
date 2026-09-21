import { getLoginUsers } from "@main/db";
import { BrowserWindow, ipcMain } from "electron/main";
import isTrustedSender from "@main/utils/isTrustedSender";

export default function handleGetUsers(mainWindow: BrowserWindow | null) {
  ipcMain.handle("getUsers", (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }

    try {
      return getLoginUsers();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to get users:", error);
        return {
          success: false,
          error: error.message,
        };
      } else {
        return { success: false, error: "Failed to get users" };
      }
    }
  });
}
