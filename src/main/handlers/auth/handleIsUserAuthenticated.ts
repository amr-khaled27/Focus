import { ipcMain } from "electron";
import { getSession } from "@main/db/index";
import { User } from "@shared/types/User";
import isTrustedSender from "@main/utils/isTrustedSender";

export function handleIsUserAuthenticated(
  mainWindow: Electron.BrowserWindow | null,
) {
  ipcMain.handle("isUserAuthenticated", async (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    const user: Omit<User, "pin"> | null = await getSession();

    if (user) {
      return { authenticated: true, user };
    } else {
      return { authenticated: false, user: null };
    }
  });
}
