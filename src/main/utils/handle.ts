import { ipcMain } from "electron/main";
import { EventPayloadMapping } from "@shared/types/EventPayloadMapping";
import isTrustedSender from "./isTrustedSender";

export function handle<K extends keyof EventPayloadMapping>(
  mainWindow: Electron.BrowserWindow | null,
  channel: K,
  handler: (
    event: Electron.IpcMainInvokeEvent,
    ...args: unknown[]
  ) => Promise<EventPayloadMapping[K]> | EventPayloadMapping[K],
) {
  ipcMain.handle(channel, async (event, ...args) => {
    if (!isTrustedSender(event, mainWindow)) {
      return {
        success: false,
        error: "طلب غير موثوق",
      } as EventPayloadMapping[K];
    }

    try {
      const result = await handler(event, ...args);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to handle ${channel}:`, error);
        return {
          success: false,
          error: error.message,
        } as EventPayloadMapping[K];
      } else {
        console.error(`Failed to handle ${channel}:`, error);
        return {
          success: false,
          error: `Failed to handle ${channel}`,
        } as EventPayloadMapping[K];
      }
    }
  });
}
