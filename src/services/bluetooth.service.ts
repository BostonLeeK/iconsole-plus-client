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
  private controlServiceUuid: string | null = null;
  private scanning: boolean = false;
  private discoveredDevices: Set<string> = new Set();
  private pollingInterval: NodeJS.Timeout | null = null;
  private currentWorkoutData: WorkoutData | null = null;

  private cumulativeDistance: number = 0;
  private cumulativeCalories: number = 0;
  private cumulativeTime: number = 0;
  private lastDeviceDistance: number = 0;
  private lastDeviceCalories: number = 0;
  private lastDeviceTime: number = 0;
  private cumulativePower: number = 0;
  private lastDevicePower: number = 0;
  private powerOverflowCount: number = 0;
  private sessionStarted: boolean = false;

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
            reject(err);
          });
      });

      peripheral.on("disconnect", () => {
        this.connectedPeripheral = null;
        this.dataCharacteristic = null;
        this.controlCharacteristic = null;
        this.stopPolling();
        this.sessionStarted = false;
        this.resetCumulativeMetrics();
        this.emit("disconnected");
      });
    });
  }

  private async discoverServices(peripheral: NoblePeripheral): Promise<void> {
    return new Promise((resolve, reject) => {
      peripheral.discoverServices([], (error, services) => {
        if (error) {
          reject(error);
          return;
        }

        if (!services || services.length === 0) {
          reject(new Error("No services found"));
          return;
        }

        const ftmsService = services.find((s: Service) => s.uuid === "1826");
        const proprietaryService = services.find(
          (s: Service) => s.uuid === "fff0"
        );

        if (ftmsService) {
          this.discoverCharacteristics(ftmsService).then(resolve).catch(reject);
        } else if (proprietaryService) {
          this.discoverCharacteristics(proprietaryService)
            .then(resolve)
            .catch(reject);
        } else {
          this.discoverCharacteristics(services[0] as Service)
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  private async discoverCharacteristics(service: Service): Promise<void> {
    return new Promise((resolve, reject) => {
      service.discoverCharacteristics([], (error, characteristics) => {
        if (error) {
          reject(error);
          return;
        }

        if (!characteristics || characteristics.length === 0) {
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

          // For FTMS service, specifically look for Control Point characteristic (0x2ad9)
          if (service.uuid === "1826") {
            if (char.uuid === "2ad9" && char.properties.includes("write")) {
              this.controlCharacteristic = char;
              this.controlServiceUuid = service.uuid;

              char.subscribe((error) => {
                if (!error) {
                  this.requestFTMSControl();
                }
              });

              char.on("data", (data: Buffer) => {});
            }
          } else {
            // For proprietary services, use any writable characteristic
            if (
              char.properties.includes("write") ||
              char.properties.includes("writeWithoutResponse")
            ) {
              this.controlCharacteristic = char;
              this.controlServiceUuid = service.uuid;
            }
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
      }
    });
  }

  private parseSimpleData(data: Buffer): void {
    if (data.length < 10) return;

    if (data.length === 3) {
      return;
    }

    if (data.length === 21) {
      const timeInSeconds = data[19] || 0;
      const speedRaw = data[2] | (data[3] << 8);
      const deviceDistance = data[6] ? data[6] / 1000 : 0;
      const deviceCalories = data[13] || 0;
      const devicePower = data[11] || 0;

      if (!this.sessionStarted) {
        this.resetCumulativeMetrics();
        this.sessionStarted = true;
      }

      const { totalDistance, totalCalories, totalTime } =
        this.updateCumulativeMetrics(
          deviceDistance,
          deviceCalories,
          timeInSeconds
        );

      const adjustedPower = this.handlePowerOverflow(devicePower);

      const workoutData = {
        time: totalTime,
        speed: speedRaw ? speedRaw / 100 : 0,
        rpm: data[4] ? Math.round(data[4] / 2) : 0,
        distance: totalDistance,
        calories: totalCalories,
        heartRate: data[18] || 0,
        watt: adjustedPower,
        resistance: data[9] || 0,
      };

      this.currentWorkoutData = workoutData;
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

      if (this.controlCharacteristic && this.controlServiceUuid !== "1826") {
        const statusCommand = new Uint8Array([0xf0, 0xa2, 0x01, 0x01, 0xa3]);

        this.controlCharacteristic.write(
          Buffer.from(statusCommand),
          false,
          (error) => {}
        );
      }
    }, 1000);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private requestFTMSControl(): void {
    if (!this.controlCharacteristic || this.controlServiceUuid !== "1826") {
      return;
    }

    const requestControlCommand = new Uint8Array([0x00]);

    this.controlCharacteristic.write(
      Buffer.from(requestControlCommand),
      false,
      (error) => {}
    );
  }

  public async disconnectDevice(): Promise<void> {
    return new Promise((resolve) => {
      if (this.connectedPeripheral) {
        this.connectedPeripheral.disconnect(() => {
          this.connectedPeripheral = null;
          this.dataCharacteristic = null;
          this.controlCharacteristic = null;
          this.stopPolling();
          this.sessionStarted = false;
          this.resetCumulativeMetrics();
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

  public async setResistance(level: number): Promise<void> {
    return this.setResistanceLevel(level);
  }

  public async setResistanceLevel(level: number): Promise<void> {
    if (!this.controlCharacteristic || !this.isConnected()) {
      throw new Error(
        "Device not connected or control characteristic not available"
      );
    }

    const clampedLevel = Math.max(1, Math.min(20, Math.round(level)));
    let resistanceCommand: Uint8Array;

    if (this.controlServiceUuid === "1826") {
      const resistanceValue = clampedLevel * 10;
      resistanceCommand = new Uint8Array([
        0x04,
        resistanceValue & 0xff,
        (resistanceValue >> 8) & 0xff,
      ]);
    } else {
      const bikeLevel = clampedLevel + 1;
      const commandBytes = [0xf0, 0xa6, 0x01, 0x01, bikeLevel];
      const checksum = commandBytes.reduce((sum, byte) => sum + byte, 0) & 0xff;
      resistanceCommand = new Uint8Array([...commandBytes, checksum]);
    }

    this.stopPolling();

    return new Promise((resolve, reject) => {
      this.controlCharacteristic!.write(
        Buffer.from(resistanceCommand),
        false,
        (error) => {
          if (error) {
            setTimeout(() => this.startSimplePolling(), 500);
            reject(error);
          } else {
            setTimeout(() => this.startSimplePolling(), 500);
            resolve();
          }
        }
      );
    });
  }

  getCurrentWorkoutData(): WorkoutData | null {
    return this.currentWorkoutData;
  }

  private resetCumulativeMetrics(): void {
    this.cumulativeDistance = 0;
    this.cumulativeCalories = 0;
    this.cumulativeTime = 0;
    this.lastDeviceDistance = 0;
    this.lastDeviceCalories = 0;
    this.lastDeviceTime = 0;
    this.cumulativePower = 0;
    this.lastDevicePower = 0;
    this.powerOverflowCount = 0;
  }

  private handlePowerOverflow(devicePower: number): number {
    if (this.lastDevicePower > 230 && devicePower < 30) {
      this.powerOverflowCount++;
      console.log(
        `Power overflow detected: ${this.lastDevicePower}W → ${devicePower}W (overflow #${this.powerOverflowCount})`
      );
    }

    this.lastDevicePower = devicePower;
    const adjustedPower = devicePower + this.powerOverflowCount * 256;

    return adjustedPower;
  }

  private updateCumulativeMetrics(
    deviceDistance: number,
    deviceCalories: number,
    deviceTime: number
  ): { totalDistance: number; totalCalories: number; totalTime: number } {
    if (
      deviceDistance < this.lastDeviceDistance &&
      this.lastDeviceDistance > 0
    ) {
      this.cumulativeDistance += this.lastDeviceDistance;
    }

    if (
      deviceCalories < this.lastDeviceCalories &&
      this.lastDeviceCalories > 0
    ) {
      this.cumulativeCalories += this.lastDeviceCalories;
    }

    if (deviceTime < this.lastDeviceTime && this.lastDeviceTime > 0) {
      this.cumulativeTime += this.lastDeviceTime;
    }

    this.lastDeviceDistance = deviceDistance;
    this.lastDeviceCalories = deviceCalories;
    this.lastDeviceTime = deviceTime;

    return {
      totalDistance:
        Math.round((this.cumulativeDistance + deviceDistance) * 1000) / 1000,
      totalCalories: this.cumulativeCalories + deviceCalories,
      totalTime: this.cumulativeTime + deviceTime,
    };
  }

  public startNewSession(): void {
    this.sessionStarted = false;
    this.resetCumulativeMetrics();
  }
}
