import { ipcMain } from "electron";
import { getSession } from "@main/db/index";
import { User } from "@shared/types/User";

export function handleIsUserAuthenticated() {
  ipcMain.handle("isUserAuthenticated", async () => {
    const user: Omit<User, "pin"> | null = await getSession();

    if (user) {
      return { authenticated: true, user };
    } else {
      return { authenticated: false, user: null };
    }
  });
}
