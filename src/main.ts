import { app, BrowserWindow, ipcMain } from "electron";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { BluetoothService } from "./services/bluetooth.service";
import settingsService from "./services/settings.service";
import { WorkoutSession } from "./types/bluetooth";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;
const bluetoothService = new BluetoothService();

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  bluetoothService.disconnectDevice().catch();

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async () => {
  try {
    await bluetoothService.disconnectDevice();
  } catch (error) {}
});

ipcMain.handle("bluetooth:start-scanning", async () => {
  try {
    await bluetoothService.startScanning();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle("bluetooth:stop-scanning", async () => {
  try {
    await bluetoothService.stopScanning();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle("bluetooth:connect-device", async (event, deviceId: string) => {
  try {
    await bluetoothService.connectToDevice(deviceId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle("bluetooth:disconnect-device", async () => {
  try {
    await bluetoothService.disconnectDevice();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle("bluetooth:get-workout-state", async () => {
  try {
    return await bluetoothService.getWorkoutState();
  } catch (error) {
    return null;
  }
});

ipcMain.handle("bluetooth:check-connection-status", async () => {
  try {
    return await bluetoothService.checkConnectionStatus();
  } catch (error) {
    return { isConnected: false };
  }
});

ipcMain.handle(
  "bluetooth:set-resistance-level",
  async (event, level: number) => {
    try {
      await bluetoothService.setResistanceLevel(level);
    } catch (error) {
      throw error;
    }
  }
);

ipcMain.handle("settings:get-claude-api-key", async () => {
  try {
    return settingsService.getClaudeApiKey();
  } catch (error) {
    return undefined;
  }
});

ipcMain.handle("settings:set-claude-api-key", async (event, apiKey: string) => {
  try {
    settingsService.setClaudeApiKey(apiKey);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle("settings:clear-claude-api-key", async () => {
  try {
    settingsService.clearClaudeApiKey();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle(
  "save-workout-session",
  async (event, session: WorkoutSession) => {
    try {
      const userDataPath = app.getPath("userData");
      const recordsDir = path.join(userDataPath, "data_records");

      if (!existsSync(recordsDir)) {
        mkdirSync(recordsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `workout-session-${timestamp}.json`;
      const filepath = path.join(recordsDir, filename);

      writeFileSync(filepath, JSON.stringify(session, null, 2));
      return { success: true, filepath };
    } catch (error) {
      console.error("Failed to save workout session:", error);
      throw error;
    }
  }
);

bluetoothService.on("deviceDiscovered", (device) => {
  mainWindow?.webContents.send("device-discovered", device);
});

bluetoothService.on("deviceConnected", () => {
  mainWindow?.webContents.send("device-connected");
});

bluetoothService.on("disconnected", () => {
  mainWindow?.webContents.send("device-disconnected");
});

bluetoothService.on("dataReceived", (data) => {
  if (mainWindow?.webContents) {
    mainWindow.webContents.send("data-received", data);
  }
});

bluetoothService.on("rawDataReceived", (rawBytes) => {
  mainWindow?.webContents.send("raw-data-received", rawBytes);
});

bluetoothService.on("error", (error) => {
  mainWindow?.webContents.send("bluetooth-error", error.message);
});

process.on("uncaughtException", (error) => {});

process.on("unhandledRejection", (reason, promise) => {});

// Window control handlers for custom title bar
ipcMain.handle("window:minimize", () => {
  mainWindow?.minimize();
});

ipcMain.handle("window:maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle("window:close", () => {
  mainWindow?.close();
});

ipcMain.handle("window:is-maximized", () => {
  return mainWindow?.isMaximized() || false;
});
