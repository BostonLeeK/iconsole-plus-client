export interface SettingsServiceInterface {
  getClaudeApiKey(): string | undefined;
  setClaudeApiKey(apiKey: string): void;
  clearClaudeApiKey(): void;
  getOpenAIApiKey(): string | undefined;
  setOpenAIApiKey(apiKey: string): void;
  clearOpenAIApiKey(): void;
  getAIAnalysisInterval(): number;
  setAIAnalysisInterval(interval: number): void;
}

export interface ElectronSettingsAPI {
  settings: {
    getClaudeApiKey(): Promise<string | undefined>;
    setClaudeApiKey(apiKey: string): Promise<void>;
    clearClaudeApiKey(): Promise<void>;
    getOpenAIApiKey(): Promise<string | undefined>;
    setOpenAIApiKey(apiKey: string): Promise<void>;
    clearOpenAIApiKey(): Promise<void>;
    getAIAnalysisInterval(): Promise<number>;
    setAIAnalysisInterval(interval: number): Promise<void>;
    openLogsDirectory(): Promise<void>;
    getWorkoutSessions(): Promise<any[]>;
    getWorkoutSessionData(filename: string): Promise<any>;
    saveWorkoutSessionAnalysis(session: any, filename?: string): Promise<void>;
    deleteWorkoutSession(filename: string): Promise<void>;
  };
}
