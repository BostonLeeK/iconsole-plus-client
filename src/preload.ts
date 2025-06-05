import { contextBridge, ipcRenderer } from "electron";
import type { ElectronAPI } from "./types/bluetooth";

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
    setResistanceLevel: (level: number) =>
      ipcRenderer.invoke("bluetooth:set-resistance-level", level),
  },
  settings: {
    getClaudeApiKey: () => ipcRenderer.invoke("settings:get-claude-api-key"),
    setClaudeApiKey: (apiKey: string) =>
      ipcRenderer.invoke("settings:set-claude-api-key", apiKey),
    clearClaudeApiKey: () =>
      ipcRenderer.invoke("settings:clear-claude-api-key"),
  },
  aiService: {
    analyzeWorkout: (request: any, apiKey: string) =>
      ipcRenderer.invoke("ai:analyze-workout", request, apiKey),
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

const windowAPI = {
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  close: () => ipcRenderer.invoke("window:close"),
  isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
contextBridge.exposeInMainWorld("windowAPI", windowAPI);

export type ElectronAPIType = typeof electronAPI;
