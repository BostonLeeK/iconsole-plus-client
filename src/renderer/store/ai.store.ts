import { createStore } from "solid-js/store";

export interface AIAdviceEntry {
  timestamp: string;
  advice: string;
  oldResistance: number;
  newResistance: number;
  workoutData: {
    time: number;
    speed: number;
    rpm: number;
    power: number;
    heartRate: number;
  };
  rideStyle: string;
  goal: string;
}

export interface AISessionStats {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTTSCharacters: number;
  estimatedCost: number; // in USD
  ttsCost: number; // in USD
  sessionStartTime?: string;
}

interface AIStore {
  sessionHistory: AIAdviceEntry[];
  sessionStats: AISessionStats;
  isHistoryOpen: boolean;
}

const [aiStore, setAIStore] = createStore<AIStore>({
  sessionHistory: [],
  sessionStats: {
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTTSCharacters: 0,
    estimatedCost: 0,
    ttsCost: 0,
  },
  isHistoryOpen: false,
});

export const aiActions = {
  addAdviceEntry: (entry: AIAdviceEntry) => {
    setAIStore("sessionHistory", (prev) => [...prev, entry]);
  },

  updateSessionStats: (inputTokens: number, outputTokens: number) => {
    setAIStore("sessionStats", (prev) => {
      const newInputTokens = prev.totalInputTokens + inputTokens;
      const newOutputTokens = prev.totalOutputTokens + outputTokens;
      return {
        ...prev,
        totalRequests: prev.totalRequests + 1,
        totalInputTokens: newInputTokens,
        totalOutputTokens: newOutputTokens,
        estimatedCost: calculateTotalCost(
          newInputTokens,
          newOutputTokens,
          prev.totalTTSCharacters
        ),
      };
    });
  },

  updateTTSStats: (characters: number) => {
    setAIStore("sessionStats", (prev) => ({
      ...prev,
      totalTTSCharacters: prev.totalTTSCharacters + characters,
      ttsCost: calculateTTSCost(prev.totalTTSCharacters + characters),
      estimatedCost: calculateTotalCost(
        prev.totalInputTokens,
        prev.totalOutputTokens,
        prev.totalTTSCharacters + characters
      ),
    }));
  },

  startNewSession: () => {
    setAIStore({
      sessionHistory: [],
      sessionStats: {
        totalRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTTSCharacters: 0,
        estimatedCost: 0,
        ttsCost: 0,
        sessionStartTime: new Date().toISOString(),
      },
      isHistoryOpen: false,
    });
  },

  toggleHistory: () => {
    setAIStore("isHistoryOpen", !aiStore.isHistoryOpen);
  },

  closeHistory: () => {
    setAIStore("isHistoryOpen", false);
  },
};

// Claude Haiku pricing: $0.25/1M input tokens, $1.25/1M output tokens
function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000000) * 0.25;
  const outputCost = (outputTokens / 1000000) * 1.25;
  return inputCost + outputCost;
}

// OpenAI TTS pricing: $0.015 per 1K characters
function calculateTTSCost(characters: number): number {
  return (characters / 1000) * 0.015;
}

// Total cost: Claude + OpenAI TTS
function calculateTotalCost(
  inputTokens: number,
  outputTokens: number,
  ttsCharacters: number
): number {
  const claudeCost = calculateCost(inputTokens, outputTokens);
  const ttsCost = calculateTTSCost(ttsCharacters);
  return claudeCost + ttsCost;
}

export { aiStore };
