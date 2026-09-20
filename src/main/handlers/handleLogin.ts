import { ipcMain } from "electron";
import { authenticateUser, createSession } from "@main/db";
import { randomBytes } from "crypto";

export function handleLogin() {
  ipcMain.handle(
    "login",
    async (_, payload: { userId: number; pin: string }) => {
      try {
        const user = await authenticateUser(payload.userId, payload.pin);

        if (!user) {
          return { success: false, error: "رمز ال PIN خاطئ" };
        }

        const sessionId = randomBytes(32).toString("hex");
        await createSession(sessionId, user.id);

        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to login:", error);
          return {
            success: false,
            error: error.message,
          };
        } else {
          return { success: false, error: "Login failed" };
        }
      }
    },
  );
}
