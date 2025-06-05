import { contextBridge, ipcRenderer } from "electron";
import { ElectronAPI } from "./types/bluetooth";

const electronAPI: ElectronAPI = {
  bluetoothService: {
    startScanning: () => ipcRenderer.invoke("bluetooth:start-scanning"),
    stopScanning: () => ipcRenderer.invoke("bluetooth:stop-scanning"),
    connectToDevice: (deviceId: string) =>
      ipcRenderer.invoke("bluetooth:connect-device", deviceId),
    disconnectDevice: () => ipcRenderer.invoke("bluetooth:disconnect-device"),
    getWorkoutState: () => ipcRenderer.invoke("bluetooth:get-workout-state"),
    checkConnectionStatus: () =>
      ipcRenderer.invoke("bluetooth:check-connection-status"),
  },
  saveWorkoutSession: (session) =>
    ipcRenderer.invoke("save-workout-session", session),
  windowControls: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize"),
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = [
      "device-discovered",
      "device-connected",
      "device-disconnected",
      "data-received",
      "raw-data-received",
      "bluetooth-error",
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
