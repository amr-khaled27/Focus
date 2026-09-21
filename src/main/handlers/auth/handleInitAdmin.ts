import { ipcMain } from "electron";
import { getAdminInitialized, addUser, createSession } from "@main/db";
import { randomBytes } from "crypto";
import isTrustedSender from "@main/utils/isTrustedSender";
import { hashPIN } from "@main/utils/PINHashing";

export function handleInitAdmin(mainWindow: Electron.BrowserWindow | null) {
  ipcMain.handle("initAdmin", async (_, payload) => {
    if (!isTrustedSender(_, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      const adminInitialized = await getAdminInitialized();
      if (adminInitialized) {
        return { success: false, error: "Admin is already initialized" };
      }

      const hashedPIN = await hashPIN(payload.pin);

      const adminUser = await addUser({
        name: payload.name,
        email: payload.email,
        pin: hashedPIN,
        role: "admin",
        createdAt: new Date().toISOString(),
      });

      const sessionId = randomBytes(32).toString("hex");
      await createSession(sessionId, adminUser.id);

      console.log("admin is now initialized!");

      return {
        success: true,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to initialize admin:", error);
        return {
          success: false,
          error: error.message || "Initialization failed",
        };
      } else {
        return { success: false, error: "Initialization failed" };
      }
    }
  });
}
