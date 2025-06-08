interface WorkoutData {
  time: number;
  speed: number;
  watt: number;
  heartRate: number;
  calories: number;
  distance: number;
  rpm: number;
  resistance: number;
  timestamp?: string;
}

interface WorkoutStatistics {
  sessionId: string;
  startTime: string;
  endTime: string;
  totalTime: number;
  totalDistance: number;
  totalCalories: number;
  avgSpeed: number;
  maxSpeed: number;
  avgPower: number;
  maxPower: number;
  avgHeartRate: number;
  maxHeartRate: number;
}

interface AIAdvice {
  timestamp: string;
  advice: string;
  action: string;
  oldResistance: number;
  newResistance: number;
  targetSpeed: number;
  rideStyle: string;
  goal: string;
  workoutData: WorkoutData;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private host: string = "localhost";
  private port: number = 8080;
  private apiKey: string = "";
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  private onWorkoutDataCallback?: (data: WorkoutData) => void;
  private onStatisticsCallback?: (stats: WorkoutStatistics) => void;
  private onAIAdviceCallback?: (advice: AIAdvice) => void;
  private onConnectionChangeCallback?: (connected: boolean) => void;
  private onSessionStatusCallback?: (status: string) => void;

  constructor(host?: string, port?: number) {
    if (host) this.host = host;
    if (port) this.port = port;
  }

  connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const url = this.apiKey
          ? `ws://${this.host}:${this.port}?apiKey=${encodeURIComponent(
              this.apiKey
            )}`
          : `ws://${this.host}:${this.port}`;

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.onConnectionChangeCallback?.(true);
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          this.onConnectionChangeCallback?.(false);

          if (
            event.code !== 1000 &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.onConnectionChangeCallback?.(false);
          reject(error);
        };

        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            reject(new Error("Connection timeout"));
          }
        }, 10000);
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
      this.ws = null;
    }
  }

  private attemptReconnect() {
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, this.reconnectDelay);
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case "connected":
          break;

        case "workout-data":
          this.onWorkoutDataCallback?.(message.data);
          break;

        case "workout-statistics":
          this.onStatisticsCallback?.(message.data);
          break;

        case "ai-advice":
          this.onAIAdviceCallback?.(message.data);
          break;

        case "session-started":
          this.onSessionStatusCallback?.("started");
          break;

        case "session-stopped":
          this.onSessionStatusCallback?.("stopped");
          break;

        case "device-connected":
          break;

        case "device-disconnected":
          break;

        case "server-shutdown":
          this.onConnectionChangeCallback?.(false);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  }

  sendMessage(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = { type, data, timestamp: new Date().toISOString() };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  startSession() {
    this.sendMessage("start_session", {});
  }

  stopSession() {
    this.sendMessage("stop_session", {});
  }

  pauseSession() {
    this.sendMessage("pause_session", {});
  }

  resumeSession() {
    this.sendMessage("resume_session", {});
  }

  requestCurrentData() {
    this.sendMessage("request_data", {});
  }

  onWorkoutData(callback: (data: WorkoutData) => void) {
    this.onWorkoutDataCallback = callback;
  }

  onStatistics(callback: (stats: WorkoutStatistics) => void) {
    this.onStatisticsCallback = callback;
  }

  onAIAdvice(callback: (advice: AIAdvice) => void) {
    this.onAIAdviceCallback = callback;
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.onConnectionChangeCallback = callback;
  }

  onSessionStatus(callback: (status: string) => void) {
    this.onSessionStatusCallback = callback;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return "Not initialized";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "Connecting";
      case WebSocket.OPEN:
        return "Connected";
      case WebSocket.CLOSING:
        return "Closing";
      case WebSocket.CLOSED:
        return "Closed";
      default:
        return "Unknown";
    }
  }

  setHost(host: string) {
    this.host = host;
  }

  setPort(port: number) {
    this.port = port;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  getHost(): string {
    return this.host;
  }

  getPort(): number {
    return this.port;
  }

  getApiKey(): string {
    return this.apiKey;
  }
}

export const websocketService = new WebSocketService();
