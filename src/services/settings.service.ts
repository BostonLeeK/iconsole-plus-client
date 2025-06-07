import Store from "electron-store";

interface Settings {
  claudeApiKey?: string;
  openaiApiKey?: string;
  aiAnalysisInterval?: number;
}

class SettingsService {
  private store: Store<Settings>;

  constructor() {
    this.store = new Store<Settings>({
      name: "settings",
      defaults: {
        aiAnalysisInterval: 30,
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

  getAllSettings(): Settings {
    return (this.store as any).store;
  }
}

export const settingsService = new SettingsService();
export default settingsService;
