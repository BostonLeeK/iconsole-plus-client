import { BluetoothDevice, WorkoutData } from "../../types/bluetooth";
import {
  addDevice,
  appState,
  clearDevices,
  setAppState,
  setConnectionState,
  setScanningState,
  setSelectedDevice,
  updateStatus,
  updateWorkoutData,
} from "../store/app";

export class BluetoothService {
  private static instance: BluetoothService;

  static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  private constructor() {
    this.setupIPCListeners();
  }

  private setupIPCListeners(): void {
    if (!window.electronAPI) {
      return;
    }

    window.electronAPI.on("device-discovered", (device: BluetoothDevice) => {
      addDevice(device);
      const devicesCount = appState.devices.length + 1;
      updateStatus(`Found ${devicesCount} device(s)`, "info");
    });

    window.electronAPI.on("device-connected", async () => {
      setConnectionState(true);
      updateStatus("Connected successfully!", "success");

      try {
        const status = await this.checkConnectionStatus();
        if (status.isConnected && status.device) {
          setSelectedDevice(status.device);
        }
      } catch (error) {}
    });

    window.electronAPI.on("device-disconnected", () => {
      setConnectionState(false);
      setSelectedDevice(null);
      updateStatus("Disconnected", "warning");
      updateWorkoutData({
        heartRate: 0,
        watt: 0,
        speed: 0,
        rpm: 0,
        resistance: 0,
        distance: 0,
        calories: 0,
        time: 0,
      });
    });

    window.electronAPI.on("data-received", (data: WorkoutData) => {
      updateWorkoutData(data);
    });

    window.electronAPI.on("raw-data-received", (rawBytes: number[]) => {
      const hexString = rawBytes
        .map((b) => `0x${b.toString(16).padStart(2, "0")}`)
        .join(" ");

      setAppState(
        "rawData",
        `Raw bytes: ${hexString}\nLength: ${
          rawBytes.length
        }\nTimestamp: ${new Date().toISOString()}\n\n${appState.rawData}`
      );
    });

    window.electronAPI.on("bluetooth-error", (error: string) => {
      updateStatus(error, "error");
    });
  }

  async startScanning(): Promise<void> {
    try {
      setScanningState(true);
      clearDevices();
      await window.electronAPI.bluetoothService.startScanning();
      updateStatus("Scanning for devices...", "info");
    } catch (error: any) {
      updateStatus(`Failed to start scanning: ${error.message}`, "error");
      setScanningState(false);
      throw error;
    }
  }

  async stopScanning(): Promise<void> {
    try {
      await window.electronAPI.bluetoothService.stopScanning();
      setScanningState(false);
      updateStatus("Scanning stopped", "success");
    } catch (error: any) {
      updateStatus(`Failed to stop scanning: ${error.message}`, "error");
      throw error;
    }
  }

  async connectToDevice(deviceId: string): Promise<void> {
    if (!deviceId) {
      updateStatus("Please select a device to connect", "error");
      return;
    }

    try {
      updateStatus("Connecting...", "info");
      await window.electronAPI.bluetoothService.connectToDevice(deviceId);
    } catch (error: any) {
      updateStatus(`Failed to connect: ${error.message}`, "error");
      throw error;
    }
  }

  async disconnectDevice(): Promise<void> {
    try {
      await window.electronAPI.bluetoothService.disconnectDevice();
      updateStatus("Disconnecting...", "info");
    } catch (error: any) {
      updateStatus(`Failed to disconnect: ${error.message}`, "error");
      throw error;
    }
  }

  async checkConnectionStatus(): Promise<{
    isConnected: boolean;
    device?: any;
  }> {
    try {
      const status =
        await window.electronAPI.bluetoothService.checkConnectionStatus();

      if (status.isConnected && status.device) {
        const existingDevice = appState.devices.find(
          (d) => d.id === status.device.id
        );
        if (!existingDevice) {
          addDevice(status.device);
        }
        setConnectionState(true);
        setSelectedDevice(status.device.id);
        updateStatus(`Reconnected to ${status.device.name}`, "success");

        return { isConnected: true, device: status.device };
      } else {
        setConnectionState(false);
        return { isConnected: false };
      }
    } catch (error: any) {
      updateStatus("Failed to check connection status", "error");
      return { isConnected: false };
    }
  }
}
