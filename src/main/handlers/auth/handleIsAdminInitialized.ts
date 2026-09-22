import { checkAdminInitialized } from "@main/utils/checkAdminInitialized";
import isTrustedSender from "@main/utils/isTrustedSender";
import { handle } from "@main/utils/handle";

export function handleIsAdminInitialized(
  mainWindow: Electron.BrowserWindow | null,
) {
  handle(mainWindow, "isAdminInitialized", async (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, isInitialized: false, error: "طلب غير موثوق" };
    }
    try {
      const isInitialized = await checkAdminInitialized();
      console.log("isAdminInitialized:", isInitialized);
      return { success: true, isInitialized };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          isInitialized: false,
          error: error.message,
        };
      } else {
        return {
          success: false,
          isInitialized: false,
          error: "Failed to check admin initialization",
        };
      }
    }
  });
}
