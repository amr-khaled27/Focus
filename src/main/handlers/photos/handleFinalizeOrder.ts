import isTrustedSender from "@main/utils/isTrustedSender";
import { finalizeDraftOrder } from "@main/db";
import { ipcMain } from "electron";

export default function handleFinalizeOrder(
  mainWindow: Electron.BrowserWindow | null,
) {
  ipcMain.handle("finalizeOrder", async (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return { success: true, order: await finalizeDraftOrder() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل إنهاء الطلب",
      };
    }
  });
}
