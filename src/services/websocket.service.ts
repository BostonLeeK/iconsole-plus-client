import { EventEmitter } from "events";
import express from "express";
import * as http from "http";
import { IncomingMessage } from "http";
import * as WebSocket from "ws";
import { WorkoutData } from "../types/bluetooth";

export class WebSocketService extends EventEmitter {
  private server: http.Server | null = null;
  private wss: WebSocket.WebSocketServer | null = null;
  private app: express.Application;
  private port: number = 8080;
  private isRunning: boolean = false;
  private apiKey: string | null = null;
  private authenticatedClients = new Set<WebSocket.WebSocket>();

  constructor() {
    super();
    this.app = express();
    this.setupExpressRoutes();
  }

  private setupExpressRoutes(): void {
    this.app.use(express.json());

    this.app.get("/api/status", (req, res) => {
      res.json({
        status: "running",
        connectedClients: this.authenticatedClients.size,
        timestamp: new Date().toISOString(),
        service: "iConsole+ WebSocket API",
      });
    });

    this.app.get("/api/info", (req, res) => {
      res.json({
        endpoints: {
          websocket: `ws://localhost:${this.port}`,
          status: `http://localhost:${this.port}/api/status`,
        },
        authentication: {
          required: true,
          method: "API Key in WebSocket connection query parameter",
          example: `ws://localhost:${this.port}?apiKey=YOUR_API_KEY`,
        },
        events: [
          "workout-data",
          "device-connected",
          "device-disconnected",
          "session-started",
          "session-stopped",
          "workout-statistics",
          "ai-advice",
        ],
      });
    });
  }

  public start(port: number, apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        return reject(new Error("WebSocket service is already running"));
      }

      this.port = port;
      this.apiKey = apiKey;

      this.server = http.createServer(this.app);
      this.wss = new WebSocket.WebSocketServer({
        server: this.server,
        verifyClient: (info) => this.verifyClient(info),
      });

      this.wss.on(
        "connection",
        (ws: WebSocket.WebSocket, req: IncomingMessage) => {
          const url = new URL(req.url || "", `http://${req.headers.host}`);
          const providedApiKey = url.searchParams.get("apiKey");

          if (!this.verifyApiKey(providedApiKey)) {
            ws.close(1008, "Invalid API key");
            return;
          }

          this.authenticatedClients.add(ws);
          console.log(
            `WebSocket client connected. Total clients: ${this.authenticatedClients.size}`
          );

          ws.on("close", () => {
            this.authenticatedClients.delete(ws);
            console.log(
              `WebSocket client disconnected. Total clients: ${this.authenticatedClients.size}`
            );
          });

          ws.on("error", (error) => {
            console.error("WebSocket client error:", error);
            this.authenticatedClients.delete(ws);
          });

          ws.send(
            JSON.stringify({
              type: "connected",
              message: "Successfully connected to iConsole+ data stream",
              timestamp: new Date().toISOString(),
            })
          );
        }
      );

      this.server.listen(port, "0.0.0.0", () => {
        this.isRunning = true;
        console.log(`WebSocket service started on port ${port}`);
        resolve();
      });

      this.server.on("error", (error) => {
        console.error("WebSocket server error:", error);
        reject(error);
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isRunning) {
        return resolve();
      }

      this.authenticatedClients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: "server-shutdown",
            message: "Server is shutting down",
            timestamp: new Date().toISOString(),
          })
        );
        client.close();
      });

      this.authenticatedClients.clear();

      if (this.wss) {
        this.wss.close();
      }

      if (this.server) {
        this.server.close(() => {
          this.isRunning = false;
          console.log("WebSocket service stopped");
          resolve();
        });
      } else {
        this.isRunning = false;
        resolve();
      }
    });
  }

  private verifyClient(info: any): boolean {
    const url = new URL(info.req.url, `http://${info.req.headers.host}`);
    const clientApiKey = url.searchParams.get("apiKey");

    if (!clientApiKey || clientApiKey !== this.apiKey) {
      console.log("WebSocket connection rejected: invalid API key");
      return false;
    }

    return true;
  }

  private verifyApiKey(providedApiKey: string | null): boolean {
    if (providedApiKey !== this.apiKey) {
      console.log("WebSocket connection rejected: invalid API key");
      return false;
    }
    return true;
  }

  public broadcastWorkoutData(data: WorkoutData): void {
    if (!this.isRunning) return;

    const message = JSON.stringify({
      type: "workout-data",
      data,
      timestamp: new Date().toISOString(),
    });

    this.authenticatedClients.forEach((client) => {
      if (client.readyState === WebSocket.WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error("Error sending workout data:", error);
          this.authenticatedClients.delete(client);
        }
      }
    });
  }

  public broadcastDeviceStatus(
    status: "connected" | "disconnected",
    deviceName?: string
  ): void {
    if (!this.isRunning) return;

    const message = JSON.stringify({
      type: `device-${status}`,
      deviceName: deviceName || "Unknown Device",
      timestamp: new Date().toISOString(),
    });

    this.authenticatedClients.forEach((client) => {
      if (client.readyState === WebSocket.WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error("Error sending device status:", error);
          this.authenticatedClients.delete(client);
        }
      }
    });
  }

  public broadcastSessionStatus(data: {
    type: "session-started" | "session-stopped";
    timestamp: string;
  }): void {
    this.broadcast({
      type: data.type,
      timestamp: data.timestamp,
    });
  }

  public broadcastWorkoutStatistics(statistics: {
    totalDistance: number;
    averageSpeed: number;
    maxSpeed: number;
    totalCalories: number;
    averageHeartRate: number;
    maxHeartRate: number;
    averageWatt: number;
    maxWatt: number;
    duration: number;
    timestamp: string;
  }): void {
    this.broadcast({
      type: "workout-statistics",
      data: statistics,
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastAIAdvice(advice: {
    timestamp: string;
    advice: string;
    action: string;
    oldResistance: number;
    newResistance: number;
    rideStyle: string;
    goal: string;
    workoutData: {
      time: number;
      speed: number;
      rpm: number;
      power: number;
      heartRate: number;
    };
  }): void {
    this.broadcast({
      type: "ai-advice",
      data: advice,
      timestamp: new Date().toISOString(),
    });
  }

  private broadcast(message: object): void {
    if (!this.isRunning) return;

    const messageString = JSON.stringify(message);
    this.authenticatedClients.forEach((client) => {
      if (client.readyState === WebSocket.WebSocket.OPEN) {
        try {
          client.send(messageString);
        } catch (error) {
          console.error("Error broadcasting message:", error);
          this.authenticatedClients.delete(client);
        }
      }
    });
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      port: this.port,
      connectedClients: this.authenticatedClients.size,
      hasApiKey: !!this.apiKey,
    };
  }
}
