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
}

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
};

export const [appState, setAppState] = createStore<AppState>(initialState);

export const updateAppState = (updates: Partial<AppState>) => {
  setAppState(updates);
};

export const addDevice = (device: BluetoothDevice) => {
  const existingDevice = appState.devices.find((d) => d.id === device.id);
  if (existingDevice) {
    return;
  }

  setAppState("devices", [...appState.devices, device]);
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
