import isTrustedSender from "@main/utils/isTrustedSender";
import { finalizeDraftOrder } from "@main/db";
import { handle } from "@main/utils/handle";

export default function handleFinalizeOrder(
  mainWindow: Electron.BrowserWindow | null,
) {
  handle(mainWindow, "finalizeOrder", async (event, ...args: unknown[]) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }

    const payload = args[0] as { customerPaid: number };
    try {
      const order = await finalizeDraftOrder(payload);
      return {
        success: true,
        order: {
          id: order.id,
          itemCount: order.itemCount,
          total: order.total,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل إنهاء الطلب",
      };
    }
  });
}
