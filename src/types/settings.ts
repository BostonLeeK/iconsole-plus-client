export interface SettingsServiceInterface {
  getClaudeApiKey(): string | undefined;
  setClaudeApiKey(apiKey: string): void;
  clearClaudeApiKey(): void;
  getOpenAIApiKey(): string | undefined;
  setOpenAIApiKey(apiKey: string): void;
  clearOpenAIApiKey(): void;
}

export interface ElectronSettingsAPI {
  settings: {
    getClaudeApiKey(): Promise<string | undefined>;
    setClaudeApiKey(apiKey: string): Promise<void>;
    clearClaudeApiKey(): Promise<void>;
    getOpenAIApiKey(): Promise<string | undefined>;
    setOpenAIApiKey(apiKey: string): Promise<void>;
    clearOpenAIApiKey(): Promise<void>;
  };
}
