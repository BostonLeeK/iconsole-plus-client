export interface SettingsServiceInterface {
  getClaudeApiKey(): string | undefined;
  setClaudeApiKey(apiKey: string): void;
  clearClaudeApiKey(): void;
  getOpenAIApiKey(): string | undefined;
  setOpenAIApiKey(apiKey: string): void;
  clearOpenAIApiKey(): void;
  getAIAnalysisInterval(): number;
  setAIAnalysisInterval(interval: number): void;
  getWebSocketApiKey(): string | undefined;
  setWebSocketApiKey(apiKey: string): void;
  clearWebSocketApiKey(): void;
  getWebSocketPort(): number;
  setWebSocketPort(port: number): void;
  getWebSocketEnabled(): boolean;
  setWebSocketEnabled(enabled: boolean): void;
  getCaloriesDivisor(): number;
  setCaloriesDivisor(divisor: number): void;
  generateWebSocketApiKey(): string;
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
    getWebSocketApiKey(): Promise<string | undefined>;
    setWebSocketApiKey(apiKey: string): Promise<void>;
    clearWebSocketApiKey(): Promise<void>;
    getWebSocketPort(): Promise<number>;
    setWebSocketPort(port: number): Promise<void>;
    getWebSocketEnabled(): Promise<boolean>;
    setWebSocketEnabled(enabled: boolean): Promise<void>;
    getCaloriesDivisor(): Promise<number>;
    setCaloriesDivisor(divisor: number): Promise<void>;
    generateWebSocketApiKey(): Promise<string>;
    openLogsDirectory(): Promise<void>;
    getWorkoutSessions(): Promise<any[]>;
    getWorkoutSessionData(filename: string): Promise<any>;
    saveWorkoutSessionAnalysis(session: any, filename?: string): Promise<void>;
    deleteWorkoutSession(filename: string): Promise<void>;
  };
}
