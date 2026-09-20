import { getLoginUsers } from "@main/db";
import { ipcMain } from "electron/main";

export default function handleGetUsers() {
  ipcMain.handle("getUsers", () => {
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
