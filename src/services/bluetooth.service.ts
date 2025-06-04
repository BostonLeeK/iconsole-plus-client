import noble from "@abandonware/noble";
import { EventEmitter } from "events";
import {
  BluetoothDevice,
  BluetoothServiceInterface,
  WorkoutData,
} from "../types/bluetooth";

interface NoblePeripheral extends EventEmitter {
  id: string;
  uuid: string;
  address: string;
  addressType: string;
  connectable: boolean;
  advertisement: {
    localName?: string;
    serviceUuids: string[];
  };
  rssi: number;
  connect(callback?: (error?: Error) => void): void;
  disconnect(callback?: (error?: Error) => void): void;
  discoverServices(
    serviceUuids: string[],
    callback: (error?: Error, services?: any[]) => void
  ): void;
  state: string;
}

interface Characteristic {
  uuid: string;
  properties: string[];
  write(
    data: Buffer,
    withoutResponse: boolean,
    callback?: (error?: Error) => void
  ): void;
  read(callback?: (error?: Error, data?: Buffer) => void): void;
  on(event: string, listener: (...args: any[]) => void): void;
  subscribe(callback?: (error?: Error) => void): void;
  unsubscribe(callback?: (error?: Error) => void): void;
}

interface Service {
  uuid: string;
  discoverCharacteristics(
    characteristicUuids: string[],
    callback: (error?: Error, characteristics?: Characteristic[]) => void
  ): void;
}

interface NobleModule {
  _peripherals: { [uuid: string]: NoblePeripheral };
  startScanning(
    serviceUuids: string[],
    allowDuplicates: boolean,
    callback?: (error?: Error) => void
  ): void;
  stopScanning(callback?: () => void): void;
  on(event: string, listener: (...args: any[]) => void): void;
}

export class BluetoothService
  extends EventEmitter
  implements BluetoothServiceInterface
{
  private noble: NobleModule = noble as any;
  public isInitialized: boolean = false;
  private connectedPeripheral: NoblePeripheral | null = null;
  private dataCharacteristic: Characteristic | null = null;
  private controlCharacteristic: Characteristic | null = null;
  private scanning: boolean = false;
  private discoveredDevices: Set<string> = new Set();
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initialize();
  }

  private initialize(): void {
    this.noble.on("stateChange", (state: string) => {
      this.isInitialized = state === "poweredOn";
    });

    this.noble.on("discover", (peripheral: NoblePeripheral) => {
      const advertisement = peripheral.advertisement;
      const localName = advertisement.localName;

      if (!localName || this.discoveredDevices.has(peripheral.uuid)) return;

      if (
        localName.includes("iConsole") ||
        localName.includes("bike") ||
        localName.includes("Console") ||
        localName.includes("fitness")
      ) {
        this.discoveredDevices.add(peripheral.uuid);

        const device: BluetoothDevice = {
          id: peripheral.uuid,
          name: localName,
          localName: localName,
          address: peripheral.address,
          addressType: peripheral.addressType,
          connectable: peripheral.connectable,
          serviceUuids: advertisement.serviceUuids,
          rssi: peripheral.rssi,
        };

        this.emit("deviceDiscovered", device);
      }
    });

    this.noble.on("scanStop", () => {
      this.scanning = false;
    });
  }

  public async startScanning(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("Bluetooth not initialized");
    }

    this.discoveredDevices.clear();
    this.scanning = true;
    this.noble.startScanning([], false);
  }

  public async stopScanning(): Promise<void> {
    if (this.scanning) {
      return new Promise((resolve) => {
        this.noble.stopScanning(() => {
          this.scanning = false;
          resolve();
        });
      });
    }
  }

  public async connectToDevice(deviceId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const peripheral = this.noble._peripherals[deviceId];
      if (!peripheral) {
        reject(new Error("Device not found"));
        return;
      }

      peripheral.connect((error) => {
        if (error) {
          console.error("❌ Connection failed:", error);
          reject(error);
          return;
        }
        this.connectedPeripheral = peripheral;
        this.emit("deviceConnected");

        this.discoverServices(peripheral)
          .then(() => {
            this.stopScanning();
            resolve();
          })
          .catch((err) => {
            console.error("❌ Service discovery failed:", err);
            reject(err);
          });
      });

      peripheral.on("disconnect", () => {
        this.connectedPeripheral = null;
        this.dataCharacteristic = null;
        this.controlCharacteristic = null;
        this.stopPolling();
        this.emit("disconnected");
      });
    });
  }

  private async discoverServices(peripheral: NoblePeripheral): Promise<void> {
    return new Promise((resolve, reject) => {
      peripheral.discoverServices([], (error, services) => {
        if (error) {
          console.error("❌ Service discovery error:", error);
          reject(error);
          return;
        }

        if (!services || services.length === 0) {
          console.error("❌ No services found on device");
          reject(new Error("No services found"));
          return;
        }

        let targetService: Service | null = null;

        targetService = services.find((s: Service) => s.uuid === "1826");

        if (!targetService) {
          targetService = services.find((s: Service) => s.uuid === "fff0");
        }

        if (!targetService) {
          targetService = services[0] as Service;
        }

        this.discoverCharacteristics(targetService).then(resolve).catch(reject);
      });
    });
  }

  private async discoverCharacteristics(service: Service): Promise<void> {
    return new Promise((resolve, reject) => {
      service.discoverCharacteristics([], (error, characteristics) => {
        if (error) {
          console.error("❌ Characteristic discovery error:", error);
          reject(error);
          return;
        }

        if (!characteristics || characteristics.length === 0) {
          console.error("❌ No characteristics found");
          reject(new Error("No characteristics found"));
          return;
        }

        for (const char of characteristics) {
          if (
            char.properties.includes("notify") ||
            char.properties.includes("indicate")
          ) {
            this.dataCharacteristic = char;
            this.setupDataCharacteristic(char);
          }

          if (
            char.properties.includes("write") ||
            char.properties.includes("writeWithoutResponse")
          ) {
            this.controlCharacteristic = char;
          }
        }
        this.startSimplePolling();

        resolve();
      });
    });
  }

  private setupDataCharacteristic(characteristic: Characteristic): void {
    characteristic.on("data", (data: Buffer) => {
      this.emit("rawDataReceived", Array.from(data));
      this.parseSimpleData(data);
    });

    characteristic.subscribe((error) => {
      if (error) {
        console.error("❌ Error subscribing:", error);
      }
    });
  }

  /**
   * Parses FTMS (Fitness Machine Service) Indoor Bike Data
   *
   * This method handles 21-byte FTMS messages from iConsole+ exercise bikes.
   * The parsing logic was reverse-engineered through extensive testing.
   *
   * Message Structure:
   * - Bytes 0-1: FTMS flags (typically 0x74 0x0b)
   * - Bytes 2-3: Speed (16-bit little endian, divide by 100 for km/h)
   * - Byte 4: Cadence (divide by 2 for realistic RPM)
   * - Byte 6: Distance (divide by 1000 for kilometers)
   * - Byte 9: Resistance level (direct value)
   * - Byte 11: Power output in watts (direct value)
   * - Byte 13: Calories burned (direct value)
   * - Byte 18: Heart rate BPM (when sensor available, 0 otherwise)
   * - Byte 19: Elapsed time in seconds (direct value)
   *
   * @param data - 21-byte Buffer containing FTMS Indoor Bike Data
   * @see FTMS_PARSING.md for detailed documentation
   */
  private parseSimpleData(data: Buffer): void {
    if (data.length < 10) return;

    // Handle 3-byte response messages (status/acknowledgment)
    if (data.length === 3) {
      return;
    }

    // Parse 21-byte FTMS Indoor Bike Data messages
    if (data.length === 21) {

      // Extract time from position 19 (seconds elapsed)
      const timeInSeconds = data[19] || 0;

      // Extract speed from positions 2-3 (16-bit little endian)
      // Formula: (low_byte + high_byte * 256) / 100 = km/h
      const speedRaw = data[2] | (data[3] << 8);

      const workoutData = {
        time: timeInSeconds,
        speed: speedRaw ? speedRaw / 100 : 0, // Convert centimeters/h to km/h
        rpm: data[4] ? Math.round(data[4] / 2) : 0, // Scale down for realistic cadence
        distance: data[6] ? data[6] / 1000 : 0, // Convert meters to kilometers
        calories: data[13] || 0, // Direct value in kcal
        heartRate: data[18] || 0, // Direct value in BPM (0 if no sensor)
        watt: data[11] || 0, // Direct value in watts
        resistance: data[9] || 0, // Direct resistance level
      };

      this.emit("dataReceived", workoutData);
    }
  }

  private startSimplePolling(): void {
    this.pollingInterval = setInterval(() => {
      if (
        !this.connectedPeripheral ||
        this.connectedPeripheral.state !== "connected"
      ) {
        this.stopPolling();
        return;
      }

      if (this.controlCharacteristic) {
        let statusCommand: Uint8Array;

        if (
          this.connectedPeripheral?.advertisement.serviceUuids.includes("1826")
        ) {
          statusCommand = new Uint8Array([0x00]);
        } else {
          statusCommand = new Uint8Array([0xf0, 0xa2, 0x01, 0x01, 0xa3]);
        }

        this.controlCharacteristic.write(
          Buffer.from(statusCommand),
          false,
          (error) => {
            if (error) {
            } else {
            }
          }
        );
      } else {
      }
    }, 1000);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  public async disconnectDevice(): Promise<void> {
    return new Promise((resolve) => {
      if (this.connectedPeripheral) {
        this.connectedPeripheral.disconnect(() => {
          this.connectedPeripheral = null;
          this.dataCharacteristic = null;
          this.controlCharacteristic = null;
          this.stopPolling();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public isConnected(): boolean {
    return this.connectedPeripheral?.state === "connected";
  }

  public getConnectedDevice(): BluetoothDevice | null {
    if (!this.connectedPeripheral) return null;

    return {
      id: this.connectedPeripheral.uuid,
      name:
        this.connectedPeripheral.advertisement.localName || "Unknown Device",
      localName: this.connectedPeripheral.advertisement.localName || "",
      address: this.connectedPeripheral.address,
      addressType: this.connectedPeripheral.addressType,
      connectable: this.connectedPeripheral.connectable,
      serviceUuids: this.connectedPeripheral.advertisement.serviceUuids,
      rssi: this.connectedPeripheral.rssi,
    };
  }

  public async checkConnectionStatus(): Promise<{
    isConnected: boolean;
    device?: BluetoothDevice;
  }> {
    const isConnected = this.isConnected();
    const device = this.getConnectedDevice();
    return { isConnected, device: device || undefined };
  }

  public async getWorkoutState(): Promise<WorkoutData | null> {
    return null;
  }
}
