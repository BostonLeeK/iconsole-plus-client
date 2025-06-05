import { app, BrowserWindow, ipcMain, shell } from "electron";
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

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      const isDevelopment = process.env.NODE_ENV === "development";
      const cspPolicy = isDevelopment
        ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; media-src 'self' blob: data:; img-src 'self' data: blob:; connect-src 'self' ws: wss:;"
        : "default-src 'self' 'unsafe-inline' data: blob:; media-src 'self' blob: data:; img-src 'self' data: blob:;";

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

ipcMain.handle("ai:analyze-workout", async (event, request, apiKey) => {
  try {
    const API_URL = "https://api.anthropic.com/v1/messages";

    // Build prompt
    const RIDE_STYLES = [
      {
        id: "city",
        name: "City",
        description: "Frequent stops, variable pace",
      },
      {
        id: "suburban",
        name: "Suburban",
        description: "Steady pace, small hills",
      },
      {
        id: "countryside",
        name: "Countryside",
        description: "Long distances, varied terrain",
      },
      {
        id: "track",
        name: "Track",
        description: "Speed, intensity",
      },
    ];

    const TRAINING_GOALS = [
      {
        id: "casual",
        name: "Casual",
        description: "Light workout, relaxation",
      },
      {
        id: "weight_loss",
        name: "Weight Loss",
        description: "Burn calories, cardio",
      },
      {
        id: "warmup",
        name: "Warm-up",
        description: "Preparation for training",
      },
      {
        id: "endurance",
        name: "Endurance",
        description: "Long-duration workouts",
      },
    ];

    const style =
      RIDE_STYLES.find((s) => s.id === request.rideStyle)?.name ||
      request.rideStyle;
    const goal =
      TRAINING_GOALS.find((g) => g.id === request.goal)?.name || request.goal;

    const prompt = `You are a smart cycling trainer AI. Analyze data and provide resistance recommendations (1-20) and advice.

CONTEXT:
- Ride style: ${style}
- Training goal: ${goal}
- Session duration: ${request.sessionDuration} seconds
- Current metrics:
  * Speed: ${request.workoutData.speed} km/h
  * Cadence: ${request.workoutData.rpm} rpm
  * Power: ${request.workoutData.power} W
  * Heart rate: ${request.workoutData.heartRate} bpm
  * Current resistance: ${request.workoutData.currentResistance}/20

RESISTANCE CHANGE RULES:
- For WEIGHT LOSS: maintain heart rate 120-140, increase resistance if heart rate is low
- For CASUAL: light resistance 3-8, comfort is more important than intensity
- For WARM-UP: gradually increase resistance every 30 sec by 1-2 levels
- For ENDURANCE: medium resistance 8-15, maintain steady pace

LOGIC:
- If RPM > 80: increase resistance (+2-3)
- If RPM < 40: decrease resistance (-1-2)
- If heart rate < 100 and goal is active: increase resistance
- If heart rate > 160: decrease resistance
- For city: frequently change resistance (simulate traffic lights)
- For track: maintain high resistance (12-18)

Respond ONLY JSON: {"resistance": number_1_20, "advice": "specific_advice_in_english"}`;

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
