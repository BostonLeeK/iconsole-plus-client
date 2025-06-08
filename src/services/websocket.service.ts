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
    this.app.get("/", (req, res) => {
      const uptime = this.isRunning ? process.uptime() : 0;
      const uptimeFormatted = this.formatUptime(uptime);

      res.setHeader("Content-Type", "text/html");
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>iConsole+ WebSocket Server</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 600px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
                }
                .logo {
                    font-size: 3rem;
                    margin-bottom: 10px;
                    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
                }
                .title {
                    font-size: 2.5rem;
                    font-weight: 300;
                    margin-bottom: 30px;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 30px 0;
                }
                .status-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    padding: 25px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;
                }
                .status-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
                }
                .status-value {
                    font-size: 2.5rem;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #00ff88;
                    text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
                }
                .status-label {
                    font-size: 1rem;
                    opacity: 0.8;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .endpoints {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 15px;
                    padding: 25px;
                    margin: 30px 0;
                    text-align: left;
                }
                .endpoint {
                    margin: 15px 0;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9rem;
                    word-break: break-all;
                }
                .endpoint-label {
                    font-weight: bold;
                    color: #00ff88;
                    margin-bottom: 5px;
                }
                .pulse {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                .footer {
                    margin-top: 30px;
                    opacity: 0.7;
                    font-size: 0.9rem;
                }
            </style>
            <script>
                setTimeout(() => {
                    window.location.reload();
                }, 30000); // Auto-refresh every 30 seconds
            </script>
        </head>
        <body>
            <div class="container">
                <div class="logo">🚴‍♂️</div>
                <h1 class="title">iConsole+ Server</h1>
                
                <div class="status-grid">
                    <div class="status-card">
                        <div class="status-value pulse">${
                          this.isRunning ? "🟢" : "🔴"
                        }</div>
                        <div class="status-label">Server Status</div>
                    </div>
                    <div class="status-card">
                        <div class="status-value">${
                          this.authenticatedClients.size
                        }</div>
                        <div class="status-label">Connected Clients</div>
                    </div>
                    <div class="status-card">
                        <div class="status-value">${this.port}</div>
                        <div class="status-label">Port</div>
                    </div>
                    <div class="status-card">
                        <div class="status-value">${uptimeFormatted}</div>
                        <div class="status-label">Uptime</div>
                    </div>
                </div>
                
                <div class="endpoints">
                    <h3 style="margin-bottom: 20px; color: #00ff88;">📡 API Endpoints</h3>
                    <div class="endpoint">
                        <div class="endpoint-label">WebSocket:</div>
                        ws://${req.get("host")}?apiKey=YOUR_API_KEY
                    </div>
                    <div class="endpoint">
                        <div class="endpoint-label">Status API:</div>
                        http://${req.get("host")}/api/status
                    </div>
                    <div class="endpoint">
                        <div class="endpoint-label">Info API:</div>
                        http://${req.get("host")}/api/info
                    </div>
                </div>
                
                <div class="footer">
                    <p>Last updated: ${new Date().toLocaleString()}</p>
                    <p>Auto-refresh in 30 seconds</p>
                </div>
            </div>
        </body>
        </html>
      `);
    });

    this.app.get("/api/status", (req, res) => {
      res.json({
        status: "running",
        connectedClients: this.authenticatedClients.size,
        timestamp: new Date().toISOString(),
        service: "iConsole+ WebSocket API",
        uptime: process.uptime(),
        port: this.port,
        isRunning: this.isRunning,
      });
    });

    this.app.get("/api/info", (req, res) => {
      res.json({
        endpoints: {
          websocket: `ws://${req.get("host")}?apiKey=YOUR_API_KEY`,
          status: `http://${req.get("host")}/api/status`,
          dashboard: `http://${req.get("host")}/`,
        },
        authentication: {
          required: true,
          method: "API Key in WebSocket connection query parameter",
          example: `ws://${req.get("host")}?apiKey=YOUR_API_KEY`,
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

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  public start(port: number, apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        return reject(new Error("WebSocket service is already running"));
      }

      this.port = port;
      this.apiKey = apiKey;

      this.server = http.createServer(this.app);

      this.server.on("request", (req, res) => {});

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

          ws.on("close", () => {
            this.authenticatedClients.delete(ws);
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
        resolve();
      });

      this.server.on("error", (error) => {
        console.error("WebSocket server error:", error);
        this.isRunning = false;
        this.server = null;
        this.wss = null;
        reject(error);
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isRunning && !this.server) {
        return resolve();
      }

      this.authenticatedClients.forEach((client) => {
        try {
          client.send(
            JSON.stringify({
              type: "server-shutdown",
              message: "Server is shutting down",
              timestamp: new Date().toISOString(),
            })
          );
          client.close();
        } catch (error) {
          console.error("Error closing client connection:", error);
        }
      });

      this.authenticatedClients.clear();

      if (this.wss) {
        this.wss.close();
        this.wss = null;
      }

      if (this.server) {
        this.server.close(() => {
          this.isRunning = false;
          this.server = null;
          resolve();
        });
      } else {
        this.isRunning = false;
        this.server = null;
        resolve();
      }
    });
  }

  private verifyClient(info: any): boolean {
    const url = new URL(info.req.url, `http://${info.req.headers.host}`);
    const clientApiKey = url.searchParams.get("apiKey");

    if (!clientApiKey || clientApiKey !== this.apiKey) {
      return false;
    }

    return true;
  }

  private verifyApiKey(providedApiKey: string | null): boolean {
    if (providedApiKey !== this.apiKey) {
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
    targetSpeed: number;
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
    const serverListening = this.server ? this.server.listening : false;
    const actuallyRunning =
      this.isRunning && serverListening && this.wss !== null;

    return {
      isRunning: actuallyRunning,
      port: this.port,
      connectedClients: this.authenticatedClients.size,
      hasApiKey: !!this.apiKey,
      serverListening,
      hasWebSocketServer: this.wss !== null,
    };
  }
}
