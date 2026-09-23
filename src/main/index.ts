import { app, shell, BrowserWindow } from "electron";
import { join } from "path";
import { pathToFileURL } from "url";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "@resources/icon.png?asset";
import { initializeDatabase } from "@main/db";
import { handleIsAdminInitialized } from "./handlers/auth/handleIsAdminInitialized";
import { handleInitAdmin } from "./handlers/auth/handleInitAdmin";
import { handleIsUserAuthenticated } from "./handlers/auth/handleIsUserAuthenticated";
import { handleLogout } from "./handlers/auth/handleLogout";
import { handleLogin } from "./handlers/auth/handleLogin";
import handleGetUsers from "./handlers/auth/handleGetUsers";
import handlePhotoCatalog from "./handlers/photos/handlePhotoCatalog";
import handlePaperCatalog from "./handlers/paper/handlePaperCatalog";
import handleFinalizeOrder from "./handlers/orders/handleFinalizeOrder";
import { store } from "./store";

let splashWindow: BrowserWindow | null = null;

function createSplashWindow(theme: "light" | "dark") {
  splashWindow = new BrowserWindow({
    width: 112,
    height: 112,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    show: false,
    alwaysOnTop: true,
    backgroundColor: theme === "dark" ? "#111827" : "#f7f9fc",
    webPreferences: {
      sandbox: true,
    },
  });

  splashWindow.setMenu(null);
  const splashUrl = pathToFileURL(
    join(app.getAppPath(), "resources", "splasher.html"),
  );
  splashUrl.searchParams.set("theme", theme);
  splashWindow.loadURL(splashUrl.toString());
  splashWindow.once("ready-to-show", () => {
    splashWindow?.show();
  });
}

function destroySplashWindow() {
  if (!splashWindow || splashWindow.isDestroyed()) {
    return;
  }

  splashWindow.destroy();
  splashWindow = null;
}

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    destroySplashWindow();
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  const theme = store.get("theme") === "dark" ? "dark" : "light";
  createSplashWindow(theme);
  await initializeDatabase();
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const mainWindow = createWindow();

  handleIsAdminInitialized(mainWindow);
  handleInitAdmin(mainWindow);
  handleIsUserAuthenticated(mainWindow);
  handleLogout(mainWindow);
  handleLogin(mainWindow);
  handleGetUsers(mainWindow);
  handlePhotoCatalog(mainWindow);
  handleFinalizeOrder(mainWindow);
  handlePaperCatalog(mainWindow);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
