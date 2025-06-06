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
    startNewSession: () => ipcRenderer.invoke("bluetooth:start-new-session"),
  },
  settings: {
    getClaudeApiKey: () => ipcRenderer.invoke("settings:get-claude-api-key"),
    setClaudeApiKey: (apiKey: string) =>
      ipcRenderer.invoke("settings:set-claude-api-key", apiKey),
    clearClaudeApiKey: () =>
      ipcRenderer.invoke("settings:clear-claude-api-key"),
    getOpenAIApiKey: () => ipcRenderer.invoke("settings:get-openai-api-key"),
    setOpenAIApiKey: (apiKey: string) =>
      ipcRenderer.invoke("settings:set-openai-api-key", apiKey),
    clearOpenAIApiKey: () =>
      ipcRenderer.invoke("settings:clear-openai-api-key"),
    openLogsDirectory: () => ipcRenderer.invoke("settings:open-logs-directory"),
    getWorkoutSessions: () =>
      ipcRenderer.invoke("settings:get-workout-sessions"),
    getWorkoutSessionData: (filename: string) =>
      ipcRenderer.invoke("settings:get-workout-session-data", filename),
    saveWorkoutSessionAnalysis: (session: any, filename?: string) =>
      ipcRenderer.invoke(
        "settings:save-workout-session-analysis",
        session,
        filename
      ),
    deleteWorkoutSession: (filename: string) =>
      ipcRenderer.invoke("settings:delete-workout-session", filename),
  },
  aiService: {
    analyzeWorkout: (request: any, apiKey: string) =>
      ipcRenderer.invoke("ai:analyze-workout", request, apiKey),
    analyzeWorkoutSession: (session: any, apiKey: string) =>
      ipcRenderer.invoke("ai:analyze-workout-session", session, apiKey),
  },
  ttsService: {
    speak: (text: string, apiKey: string) =>
      ipcRenderer.invoke("tts:speak", text, apiKey),
  },
  saveWorkoutSession: (session) =>
    ipcRenderer.invoke("save-workout-session", session),
  saveAISession: (aiSession) =>
    ipcRenderer.invoke("save-ai-session", aiSession),
  windowControls: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize"),
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
  },
  powerManager: {
    preventSleep: (enable: boolean) =>
      ipcRenderer.invoke("power:prevent-sleep", enable),
    isSleepPrevented: () => ipcRenderer.invoke("power:is-sleep-prevented"),
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
