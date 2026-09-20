import { ipcMain } from "electron";
import { getAdminInitialized, addUser, createSession } from "@main/db";
import { randomBytes } from "crypto";

export function handleInitAdmin() {
  ipcMain.handle("initAdmin", async (_, payload) => {
    try {
      const adminInitialized = await getAdminInitialized();
      if (adminInitialized) {
        return { success: false, error: "Admin is already initialized" };
      }

      const adminUser = await addUser({
        name: payload.name,
        email: payload.email,
        pin: payload.pin,
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
