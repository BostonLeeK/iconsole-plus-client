export interface SettingsServiceInterface {
  getClaudeApiKey(): string | undefined;
  setClaudeApiKey(apiKey: string): void;
  clearClaudeApiKey(): void;
}

export interface ElectronSettingsAPI {
  settings: {
    getClaudeApiKey(): Promise<string | undefined>;
    setClaudeApiKey(apiKey: string): Promise<void>;
    clearClaudeApiKey(): Promise<void>;
  };
}
