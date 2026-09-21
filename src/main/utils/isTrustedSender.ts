import { BrowserWindow, IpcMainInvokeEvent } from "electron";
import { is } from "@electron-toolkit/utils";

export default function isTrustedSender(
  event: IpcMainInvokeEvent,
  mainWindow: BrowserWindow | null,
): boolean {
  const frame = event.senderFrame;

  if (!frame) return false;

  if (!mainWindow || mainWindow.isDestroyed()) return false;

  if (event.sender !== mainWindow.webContents) return false;

  if (frame.parent !== null) return false;

  try {
    const parsed = new URL(frame.url);
    if (is.dev) {
      return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    }

    if (parsed.protocol !== "file:") return false;

    const pageName = parsed.pathname.split("/").pop();
    return pageName === "index.html";
  } catch {
    return false;
  }
}
