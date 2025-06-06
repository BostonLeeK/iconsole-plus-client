import { createMemo, createSignal } from "solid-js";
import type { BluetoothDevice, WorkoutData } from "../../types/bluetooth";

export type AppScreen =
  | "dashboard"
  | "settings"
  | "workout-history"
  | "planner";

const [currentScreen, setCurrentScreen] = createSignal<AppScreen>("dashboard");
const [isScanning, setIsScanning] = createSignal(false);
const [isConnected, setIsConnected] = createSignal(false);
const [devices, setDevices] = createSignal<BluetoothDevice[]>([]);
const [selectedDeviceId, setSelectedDeviceId] = createSignal<string | null>(
  null
);
const [workoutData, setWorkoutData] = createSignal<WorkoutData>({
  time: 0,
  speed: 0,
  rpm: 0,
  distance: 0,
  calories: 0,
  heartRate: 0,
  watt: 0,
  resistance: 0,
});

export const appState = createMemo(() => ({
  currentScreen: currentScreen(),
  isScanning: isScanning(),
  isConnected: isConnected(),
  devices: devices(),
  selectedDeviceId: selectedDeviceId(),
  workoutData: workoutData(),
}));

export const appActions = {
  setCurrentScreen,
  setIsScanning,
  setIsConnected,
  setDevices,
  setSelectedDeviceId,
  setWorkoutData,
  addDevice: (device: BluetoothDevice) => {
    setDevices((prev) => {
      const exists = prev.find((d) => d.id === device.id);
      if (exists) return prev;
      return [...prev, device];
    });
  },
  resetDevices: () => setDevices([]),
  navigateToSettings: () => setCurrentScreen("settings"),
  navigateToDashboard: () => setCurrentScreen("dashboard"),
  navigateToWorkoutHistory: () => setCurrentScreen("workout-history"),
  navigateToPlanner: () => setCurrentScreen("planner"),
};
