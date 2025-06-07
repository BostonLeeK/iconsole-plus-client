import Store from "electron-store";

interface Settings {
  claudeApiKey?: string;
  openaiApiKey?: string;
  aiAnalysisInterval?: number;
  websocketApiKey?: string;
  websocketPort?: number;
  websocketEnabled?: boolean;
}

class SettingsService {
  private store: Store<Settings>;

  constructor() {
    this.store = new Store<Settings>({
      name: "settings",
      defaults: {
        aiAnalysisInterval: 30,
        websocketPort: 8080,
        websocketEnabled: false,
      },
    });
  }

  getClaudeApiKey(): string | undefined {
    return (this.store as any).get("claudeApiKey");
  }

  setClaudeApiKey(apiKey: string): void {
    (this.store as any).set("claudeApiKey", apiKey);
  }

  clearClaudeApiKey(): void {
    (this.store as any).delete("claudeApiKey");
  }

  getOpenAIApiKey(): string | undefined {
    return (this.store as any).get("openaiApiKey");
  }

  setOpenAIApiKey(apiKey: string): void {
    (this.store as any).set("openaiApiKey", apiKey);
  }

  clearOpenAIApiKey(): void {
    (this.store as any).delete("openaiApiKey");
  }

  getAIAnalysisInterval(): number {
    return (this.store as any).get("aiAnalysisInterval", 30);
  }

  setAIAnalysisInterval(interval: number): void {
    (this.store as any).set("aiAnalysisInterval", interval);
  }

  getWebSocketApiKey(): string | undefined {
    return (this.store as any).get("websocketApiKey");
  }

  setWebSocketApiKey(apiKey: string): void {
    (this.store as any).set("websocketApiKey", apiKey);
  }

  clearWebSocketApiKey(): void {
    (this.store as any).delete("websocketApiKey");
  }

  getWebSocketPort(): number {
    return (this.store as any).get("websocketPort", 8080);
  }

  setWebSocketPort(port: number): void {
    (this.store as any).set("websocketPort", port);
  }

  getWebSocketEnabled(): boolean {
    return (this.store as any).get("websocketEnabled", false);
  }

  setWebSocketEnabled(enabled: boolean): void {
    (this.store as any).set("websocketEnabled", enabled);
  }

  generateWebSocketApiKey(): string {
    const { v4: uuidv4 } = require("uuid");
    const apiKey = uuidv4();
    this.setWebSocketApiKey(apiKey);
    return apiKey;
  }

  getAllSettings(): Settings {
    return (this.store as any).store;
  }
}

export const settingsService = new SettingsService();
export default settingsService;
