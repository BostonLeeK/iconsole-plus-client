import { app, BrowserWindow, ipcMain, powerSaveBlocker, shell } from "electron";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import path from "path";
import { AIPromptData, AIPromptsService } from "./services/ai-prompts.service";
import { BluetoothService } from "./services/bluetooth.service";
import settingsService from "./services/settings.service";
import { WorkoutSession } from "./types/bluetooth";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;
const bluetoothService = new BluetoothService();
let powerSaveBlockerId: number | null = null;

if (require("electron-squirrel-startup")) app.quit();

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    titleBarStyle: "hidden",
    icon: path.join(__dirname, "../resources/icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      const cspPolicy =
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; media-src 'self' blob: data:; img-src 'self' data: blob:; connect-src 'self' ws: wss:;";

      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [cspPolicy],
        },
      });
    }
  );

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();
  powerSaveBlockerId = powerSaveBlocker.start("prevent-app-suspension");

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  bluetoothService.disconnectDevice().catch();

  if (powerSaveBlockerId !== null) {
    powerSaveBlocker.stop(powerSaveBlockerId);
    powerSaveBlockerId = null;
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async () => {
  try {
    await bluetoothService.disconnectDevice();
  } catch (error) {}

  if (powerSaveBlockerId !== null) {
    powerSaveBlocker.stop(powerSaveBlockerId);
    powerSaveBlockerId = null;
  }
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

ipcMain.handle("bluetooth:start-new-session", async () => {
  try {
    bluetoothService.startNewSession();
    return { success: true };
  } catch (error) {
    throw error;
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

ipcMain.handle("settings:get-openai-api-key", async () => {
  try {
    return settingsService.getOpenAIApiKey();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle("settings:set-openai-api-key", async (event, apiKey: string) => {
  try {
    settingsService.setOpenAIApiKey(apiKey);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle("settings:clear-openai-api-key", async () => {
  try {
    settingsService.clearOpenAIApiKey();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle("settings:get-ai-analysis-interval", async () => {
  try {
    return settingsService.getAIAnalysisInterval();
  } catch (error) {
    return 30;
  }
});

ipcMain.handle(
  "settings:set-ai-analysis-interval",
  async (event, interval: number) => {
    try {
      settingsService.setAIAnalysisInterval(interval);
    } catch (error) {
      throw error;
    }
  }
);

ipcMain.handle("ai:analyze-workout", async (event, request, apiKey) => {
  try {
    const API_URL = "https://api.anthropic.com/v1/messages";

    const promptData: AIPromptData = {
      goal: request.goal,
      style: request.rideStyle,
      sessionDuration: request.sessionDuration,
      workoutData: request.workoutData,
      adviceHistory: request.adviceHistory,
    };

    const prompt = AIPromptsService.generateTrainingPrompt(promptData);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API Error:", errorText);
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;

    const responseText = data.content[0].text;
    const jsonMatch = responseText.match(/\{[^}]+\}/);

    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Ensure resistance is a reasonable number and different from current
    let newResistance =
      parsed.resistance || request.workoutData.currentResistance || 5;

    // Apply smart fallback logic if AI gives the same resistance
    if (newResistance === request.workoutData.currentResistance) {
      const rpm = request.workoutData.rpm || 50;
      const heartRate = request.workoutData.heartRate || 0;
      const currentResistance = request.workoutData.currentResistance || 5;

      // Apply basic training logic
      if (request.goal === "weight_loss" && heartRate < 120 && heartRate > 0) {
        newResistance = Math.min(20, currentResistance + 2); // Increase for fat burn
      } else if (request.goal === "casual" && rpm > 70) {
        newResistance = Math.max(1, currentResistance - 1); // Decrease for comfort
      } else if (rpm > 80) {
        newResistance = Math.min(20, currentResistance + 1); // Increase if spinning too fast
      } else if (rpm < 40 && rpm > 0) {
        newResistance = Math.max(1, currentResistance - 1); // Decrease if too slow
      } else if (
        request.sessionDuration > 0 &&
        request.sessionDuration % 60 === 0
      ) {
        // Change resistance every minute for variety
        newResistance = currentResistance + (Math.random() > 0.5 ? 1 : -1);
      }
    }

    const result = {
      newResistance: Math.max(1, Math.min(20, Math.round(newResistance))),
      advice: parsed.advice || "Continue your workout",
      action: parsed.action || "Keep it up!",
      inputTokens,
      outputTokens,
    };

    return result;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
});

ipcMain.handle("tts:speak", async (event, text: string, apiKey: string) => {
  try {
    const API_URL = "https://api.openai.com/v1/audio/speech";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "nova",
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS Error:", errorText);
      throw new Error(`TTS API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return Buffer.from(audioBuffer);
  } catch (error) {
    console.error("TTS Service Error:", error);
    throw new Error(`TTS synthesis failed: ${error.message}`);
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

ipcMain.handle("save-ai-session", async (event, aiSession: any) => {
  try {
    const userDataPath = app.getPath("userData");
    const recordsDir = path.join(userDataPath, "data_records");

    if (!existsSync(recordsDir)) {
      mkdirSync(recordsDir, { recursive: true });
    }

    let filepath;
    if (aiSession.sessionInfo?.filename) {
      filepath = path.join(recordsDir, aiSession.sessionInfo.filename);
    } else {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `ai-session-${timestamp}.json`;
      filepath = path.join(recordsDir, filename);
    }

    writeFileSync(filepath, JSON.stringify(aiSession, null, 2));
    return { success: true, filepath };
  } catch (error) {
    console.error("MAIN: Failed to save AI session:", error);
    throw error;
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

ipcMain.handle("settings:open-logs-directory", () => {
  const userDataPath = app.getPath("userData");
  const logsDir = path.join(userDataPath, "data_records");
  shell.openPath(logsDir);
});

ipcMain.handle("settings:get-workout-sessions", async () => {
  try {
    const userDataPath = app.getPath("userData");
    const recordsDir = path.join(userDataPath, "data_records");

    if (!existsSync(recordsDir)) {
      return [];
    }

    const files = readdirSync(recordsDir);
    const workoutFiles = files.filter(
      (file) => file.startsWith("workout-session-") && file.endsWith(".json")
    );

    const sessions = [];
    for (const file of workoutFiles) {
      try {
        const filepath = path.join(recordsDir, file);
        const content = readFileSync(filepath, "utf8");
        const sessionData = JSON.parse(content);

        sessions.push({
          filename: file,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
          duration: sessionData.duration,
          summary: sessionData.summary,
        });
      } catch (error) {
        console.error(`Failed to read session file ${file}:`, error);
      }
    }

    return sessions.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  } catch (error) {
    console.error("Failed to get workout sessions:", error);
    return [];
  }
});

ipcMain.handle(
  "settings:get-workout-session-data",
  async (event, filename: string) => {
    try {
      const userDataPath = app.getPath("userData");
      const recordsDir = path.join(userDataPath, "data_records");
      const filepath = path.join(recordsDir, filename);

      if (!existsSync(filepath)) {
        throw new Error("Session file not found");
      }

      const content = readFileSync(filepath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      console.error(
        `Failed to get workout session data for ${filename}:`,
        error
      );
      throw error;
    }
  }
);

ipcMain.handle(
  "settings:save-workout-session-analysis",
  async (event, session: any, filename?: string) => {
    try {
      const userDataPath = app.getPath("userData");
      const recordsDir = path.join(userDataPath, "data_records");

      let targetFilename = filename;
      if (!targetFilename) {
        const startTime = new Date(session.startTime)
          .toISOString()
          .replace(/[:.]/g, "-");
        targetFilename = `workout-session-${startTime}.json`;
      }

      const filepath = path.join(recordsDir, targetFilename);

      writeFileSync(filepath, JSON.stringify(session, null, 2));
      return { success: true };
    } catch (error) {
      console.error("Failed to save workout session analysis:", error);
      throw error;
    }
  }
);

ipcMain.handle(
  "ai:analyze-workout-session",
  async (event, session: any, apiKey: string) => {
    try {
      const API_URL = "https://api.anthropic.com/v1/messages";

      const prompt = AIPromptsService.generateWorkoutAnalysisPrompt(session);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Analysis Error:", errorText);
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const responseText = data.content[0].text;

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const analysis = JSON.parse(jsonMatch[0]);
      return analysis;
    } catch (error) {
      console.error("AI Workout Analysis Error:", error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }
);

ipcMain.handle(
  "settings:delete-workout-session",
  async (event, filename: string) => {
    try {
      const userDataPath = app.getPath("userData");
      const recordsDir = path.join(userDataPath, "data_records");
      const filepath = path.join(recordsDir, filename);

      if (!existsSync(filepath)) {
        throw new Error("Session file not found");
      }

      const { unlinkSync } = require("fs");
      unlinkSync(filepath);
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete workout session ${filename}:`, error);
      throw error;
    }
  }
);

process.on("uncaughtException", (error) => {});

process.on("unhandledRejection", (reason, promise) => {});

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

ipcMain.handle("power:prevent-sleep", async (event, enable: boolean) => {
  try {
    if (enable) {
      if (powerSaveBlockerId === null) {
        powerSaveBlockerId = powerSaveBlocker.start("prevent-app-suspension");
      }
    } else {
      if (powerSaveBlockerId !== null) {
        powerSaveBlocker.stop(powerSaveBlockerId);
        powerSaveBlockerId = null;
      }
    }
    return { success: true, isActive: powerSaveBlockerId !== null };
  } catch (error) {
    console.error("Power save blocker error:", error);
    throw error;
  }
});

ipcMain.handle("power:is-sleep-prevented", () => {
  return {
    isActive: powerSaveBlockerId !== null,
    isStarted:
      powerSaveBlockerId !== null
        ? powerSaveBlocker.isStarted(powerSaveBlockerId)
        : false,
  };
});

ipcMain.handle("storage:save", async (event, key: string, data: any) => {
  try {
    const userDataPath = app.getPath("userData");
    const storageDir = path.join(userDataPath, "storage");

    if (!existsSync(storageDir)) {
      mkdirSync(storageDir, { recursive: true });
    }

    const filepath = path.join(storageDir, `${key}.json`);
    writeFileSync(filepath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error("Storage save error:", error);
    throw error;
  }
});

ipcMain.handle("storage:load", async (event, key: string) => {
  try {
    const userDataPath = app.getPath("userData");
    const filepath = path.join(userDataPath, "storage", `${key}.json`);

    if (!existsSync(filepath)) {
      return null;
    }

    const content = readFileSync(filepath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Storage load error:", error);
    return null;
  }
});

ipcMain.handle("storage:remove", async (event, key: string) => {
  try {
    const userDataPath = app.getPath("userData");
    const filepath = path.join(userDataPath, "storage", `${key}.json`);

    if (existsSync(filepath)) {
      const fs = require("fs");
      fs.unlinkSync(filepath);
    }
    return { success: true };
  } catch (error) {
    console.error("Storage remove error:", error);
    throw error;
  }
});

ipcMain.handle(
  "ai:generate-workout-plan",
  async (event, request: any, apiKey: string) => {
    try {
      const API_URL = "https://api.anthropic.com/v1/messages";

      const prompt = AIPromptsService.generateWorkoutPlanPrompt(request);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Workout Plan Error:", errorText);
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const responseText = data.content[0].text;

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const planData = JSON.parse(jsonMatch[0]);
      return planData;
    } catch (error) {
      console.error("AI Workout Plan Generation Error:", error);
      throw new Error(`Workout plan generation failed: ${error.message}`);
    }
  }
);
