import { createStore } from "solid-js/store";
import { BluetoothDevice, WorkoutData } from "../../types/bluetooth";

export interface AppState {
  devices: BluetoothDevice[];
  selectedDeviceId: string;
  isScanning: boolean;
  isConnected: boolean;
  workoutData: WorkoutData;
  status: {
    message: string;
    type: "info" | "success" | "warning" | "error";
  };
  rawData: string;
  recording: {
    isRecording: boolean;
    startTime: number;
    sessionData: WorkoutData[];
  };
}

let recordingInterval: NodeJS.Timeout | null = null;

const initialState: AppState = {
  devices: [],
  selectedDeviceId: "",
  isScanning: false,
  isConnected: false,
  workoutData: {
    heartRate: 0,
    watt: 0,
    speed: 0,
    rpm: 0,
    resistance: 0,
    distance: 0,
    calories: 0,
    time: 0,
  },
  status: {
    message: "Ready to scan",
    type: "info",
  },
  rawData: "",
  recording: {
    isRecording: false,
    startTime: 0,
    sessionData: [],
  },
};

export const [appState, setAppState] = createStore<AppState>(initialState);

export const updateAppState = (updates: Partial<AppState>) => {
  setAppState(updates);
};

export const addDevice = (device: BluetoothDevice) => {
  const existingDevice = appState.devices.find((d) => d.id === device.id);
  if (existingDevice) {
    return false;
  }

  setAppState("devices", [...appState.devices, device]);
  return true;
};

export const clearDevices = () => {
  setAppState("devices", []);
  setAppState("selectedDeviceId", "");
};

export const updateStatus = (
  message: string,
  type: AppState["status"]["type"]
) => {
  setAppState("status", { message, type });
};

export const updateWorkoutData = (data: WorkoutData) => {
  setAppState("workoutData", {
    heartRate: data.heartRate,
    watt: data.watt,
    speed: data.speed,
    rpm: data.rpm,
    resistance: data.resistance,
    distance: data.distance,
    calories: data.calories,
    time: data.time,
  });
};

export const setConnectionState = (isConnected: boolean) => {
  setAppState("isConnected", isConnected);
  setAppState("isScanning", false);
};

export const setScanningState = (isScanning: boolean) => {
  setAppState("isScanning", isScanning);
};

export const setSelectedDevice = (deviceId: string) => {
  setAppState("selectedDeviceId", deviceId);
};

export const startRecording = () => {
  setAppState("recording", {
    isRecording: true,
    startTime: Date.now(),
    sessionData: [],
  });

  setAppState("workoutData", {
    heartRate: 0,
    watt: 0,
    speed: 0,
    rpm: 0,
    resistance: 0,
    distance: 0,
    calories: 0,
    time: 0,
  });

  recordingInterval = setInterval(() => {
    if (appState.recording.isRecording) {
      const dataPoint = {
        ...appState.workoutData,
        timestamp: Date.now(),
      };

      setAppState("recording", "sessionData", [
        ...appState.recording.sessionData,
        dataPoint,
      ]);
    }
  }, 1000);

  updateStatus("Recording started", "success");
};

export const stopRecording = async () => {
  if (!appState.recording.isRecording) {
    return;
  }

  if (recordingInterval) {
    clearInterval(recordingInterval);
    recordingInterval = null;
  }

  const cleanData = appState.recording.sessionData.map((item) => ({
    speed: Number(item.speed) || 0,
    heartRate: Number(item.heartRate) || 0,
    rpm: Number(item.rpm) || 0,
    resistance: Number(item.resistance) || 0,
    distance: Number(item.distance) || 0,
    calories: Number(item.calories) || 0,
    watt: Number(item.watt) || 0,
    time: Number(item.time) || 0,
    timestamp: Number(item.timestamp) || Date.now(),
  }));

  const speeds = cleanData
    .map((d) => d.speed)
    .filter((v) => !isNaN(v) && isFinite(v));
  const powers = cleanData
    .map((d) => d.watt)
    .filter((v) => !isNaN(v) && isFinite(v));
  const heartRates = cleanData
    .map((d) => d.heartRate)
    .filter((v) => v > 0 && !isNaN(v) && isFinite(v));

  const sessionSummary = {
    id: Date.now().toString(),
    deviceName:
      appState.devices.find((d) => d.id === appState.selectedDeviceId)?.name ||
      "Unknown Device",
    startTime: new Date(appState.recording.startTime).toISOString(),
    endTime: new Date().toISOString(),
    duration: Date.now() - appState.recording.startTime,
    data: cleanData,
    summary: {
      totalDistance: Number(appState.workoutData.distance) || 0,
      averageSpeed:
        speeds.length > 0
          ? speeds.reduce((sum, v) => sum + v, 0) / speeds.length
          : 0,
      maxSpeed: speeds.length > 0 ? Math.max(...speeds) : 0,
      totalCalories: Number(appState.workoutData.calories) || 0,
      averageHeartRate:
        heartRates.length > 0
          ? heartRates.reduce((sum, v) => sum + v, 0) / heartRates.length
          : 0,
      maxHeartRate: heartRates.length > 0 ? Math.max(...heartRates) : 0,
      averageWatt:
        powers.length > 0
          ? powers.reduce((sum, v) => sum + v, 0) / powers.length
          : 0,
      maxWatt: powers.length > 0 ? Math.max(...powers) : 0,
    },
  };

  try {
    await window.electronAPI.saveWorkoutSession(sessionSummary);
    updateStatus("Session saved successfully", "success");
  } catch (error) {
    updateStatus(`Failed to save session: ${error.message}`, "error");
  }

  setAppState("recording", {
    isRecording: false,
    startTime: 0,
    sessionData: [],
  });
};
