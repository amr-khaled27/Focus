import { checkAdminInitialized } from "@main/utils/checkAdminInitialized";
import { ipcMain } from "electron";

export function handleIsAdminInitialized() {
  ipcMain.handle("isAdminInitialized", async () => {
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
