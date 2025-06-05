import Store from "electron-store";

interface Settings {
  claudeApiKey?: string;
  openaiApiKey?: string;
}

class SettingsService {
  private store: Store<Settings>;

  constructor() {
    this.store = new Store<Settings>({
      name: "settings",
      defaults: {},
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

  getAllSettings(): Settings {
    return (this.store as any).store;
  }
}

export const settingsService = new SettingsService();
export default settingsService;
