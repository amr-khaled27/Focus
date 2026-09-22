import { getLoginUsers } from "@main/db";
import { BrowserWindow } from "electron/main";
import isTrustedSender from "@main/utils/isTrustedSender";
import { handle } from "@main/utils/handle";

export default function handleGetUsers(mainWindow: BrowserWindow | null) {
  handle(mainWindow, "getUsers", async (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return {
        success: false,
        error: "طلب غير موثوق",
      };
    }

    try {
      const users = await getLoginUsers();
      return {
        success: true,
        users,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to get users:", error);
        return {
          success: false,
          error: error.message,
        };
      } else {
        console.error("Failed to get users:", error);
        return {
          success: false,
          error: "فشل في جلب المستخدمين",
        };
      }
    }
  });
}
