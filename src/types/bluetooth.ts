export interface BluetoothDevice {
  id: string;
  name: string;
  localName: string;
  address: string;
  addressType: string;
  connectable: boolean;
  serviceUuids: string[];
  rssi: number;
}

export interface WorkoutData {
  speed: number;
  heartRate: number;
  rpm: number;
  resistance: number;
  distance: number;
  calories: number;
  watt: number;
  time: number;
  timestamp?: number;
}

export interface WorkoutSession {
  startTime: string;
  endTime: string;
  duration: number;
  data: WorkoutData[];
  summary: {
    maxSpeed: number;
    avgSpeed: number;
    maxPower: number;
    avgPower: number;
    totalDistance: number;
    totalCalories: number;
    maxHeartRate: number;
    avgHeartRate: number;
  };
}

export interface IConsoleResponse {
  data: Buffer;
  getValue8(offset: number): number;
  getValue16(offset: number): number;
}

export interface BluetoothServiceInterface {
  isInitialized: boolean;
  startScanning(): Promise<void>;
  stopScanning(): Promise<void>;
  connectToDevice(deviceId: string): Promise<void>;
  disconnectDevice(): Promise<void>;
  getWorkoutState(): Promise<WorkoutData | null>;
  checkConnectionStatus(): Promise<{
    isConnected: boolean;
    device?: BluetoothDevice;
  }>;
  setResistanceLevel(level: number): Promise<void>;
}

export interface ElectronAPI {
  bluetoothService: {
    startScanning(): Promise<void>;
    stopScanning(): Promise<void>;
    connectToDevice(deviceId: string): Promise<void>;
    disconnectDevice(): Promise<void>;
    getWorkoutState(): Promise<WorkoutData | null>;
    checkConnectionStatus(): Promise<{
      isConnected: boolean;
      device?: BluetoothDevice;
    }>;
    setResistanceLevel(level: number): Promise<void>;
  };
  saveWorkoutSession(session: WorkoutSession): Promise<void>;
  windowControls: {
    minimize(): Promise<void>;
    maximize(): Promise<void>;
    close(): Promise<void>;
    isMaximized(): Promise<boolean>;
  };
  on(channel: string, callback: (...args: any[]) => void): void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
