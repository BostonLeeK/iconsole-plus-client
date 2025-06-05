import { ElectronSettingsAPI } from "./settings";

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
  time: number;
  speed: number;
  rpm: number;
  distance: number;
  calories: number;
  heartRate: number;
  watt: number;
  resistance: number;
}

export interface WorkoutSession {
  id: string;
  deviceName: string;
  startTime: string;
  endTime: string;
  duration: number;
  data: WorkoutData[];
  summary: {
    totalDistance: number;
    averageSpeed: number;
    maxSpeed: number;
    totalCalories: number;
    averageHeartRate: number;
    maxHeartRate: number;
    averageWatt: number;
    maxWatt: number;
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

interface TTSService {
  speak(text: string, apiKey: string): Promise<Buffer>;
}

export interface ElectronAPI extends ElectronSettingsAPI {
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
  aiService: {
    analyzeWorkout(
      request: any,
      apiKey: string
    ): Promise<{
      newResistance: number;
      advice: string;
      inputTokens?: number;
      outputTokens?: number;
    }>;
    analyzeWorkoutSession(
      session: any,
      apiKey: string
    ): Promise<{
      analysis: string;
      recommendations: string[];
      performance_score: number;
      zones_analysis: any;
    }>;
  };
  ttsService: {
    speak(text: string, apiKey: string): Promise<Buffer>;
  };
  saveWorkoutSession(session: WorkoutSession): Promise<void>;
  saveAISession(aiSession: any): Promise<void>;
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
