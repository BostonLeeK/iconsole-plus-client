import { app, BrowserWindow, ipcMain } from "electron";
import { BluetoothService } from "./services/bluetooth.service";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;
const bluetoothService = new BluetoothService();

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
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
