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
  estimatedCost: number; // in USD
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
    estimatedCost: 0,
  },
  isHistoryOpen: false,
});

export const aiActions = {
  addAdviceEntry: (entry: AIAdviceEntry) => {
    setAIStore("sessionHistory", (prev) => [...prev, entry]);
  },

  updateSessionStats: (inputTokens: number, outputTokens: number) => {
    setAIStore("sessionStats", (prev) => ({
      ...prev,
      totalRequests: prev.totalRequests + 1,
      totalInputTokens: prev.totalInputTokens + inputTokens,
      totalOutputTokens: prev.totalOutputTokens + outputTokens,
      estimatedCost: calculateCost(
        prev.totalInputTokens + inputTokens,
        prev.totalOutputTokens + outputTokens
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
        estimatedCost: 0,
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

export { aiStore };
