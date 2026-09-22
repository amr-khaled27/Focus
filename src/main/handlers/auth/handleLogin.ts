import { authenticateUser, createSession } from "@main/db";
import { randomBytes } from "crypto";
import isTrustedSender from "@main/utils/isTrustedSender";
import { handle } from "@main/utils/handle";

export function handleLogin(mainWindow: Electron.BrowserWindow | null) {
  handle(mainWindow, "login", async (event, ...args: unknown[]) => {
    const payload = args[0] as {
      userId: number;
      pin: string;
    };

    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }

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
  });
}
