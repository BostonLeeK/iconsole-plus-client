import { createStore } from "solid-js/store";

export interface AIAdviceEntry {
  timestamp: string;
  advice: string;
  oldResistance: number;
  newResistance: number;
  targetSpeed: number;
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
  currentSessionFile: string | null;
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
  currentSessionFile: null,
});

export const aiActions = {
  addAdviceEntry: async (entry: AIAdviceEntry) => {
    const newHistory = [...aiStore.sessionHistory, entry];
    setAIStore("sessionHistory", newHistory);

    if (aiStore.currentSessionFile) {
      const cleanStats = JSON.parse(JSON.stringify(aiStore.sessionStats));
      const cleanHistory = JSON.parse(JSON.stringify(newHistory));

      const currentSession = {
        sessionInfo: {
          startTime: cleanStats.sessionStartTime,
          endTime: null,
          duration: cleanStats.sessionStartTime
            ? Date.now() - new Date(cleanStats.sessionStartTime).getTime()
            : 0,
          filename: aiStore.currentSessionFile,
        },
        stats: cleanStats,
        adviceHistory: cleanHistory,
      };
      try {
        await window.electronAPI.saveAISession(currentSession);
      } catch (error) {
        console.error("Failed to update AI session file:", error);
      }
    } else {
      console.warn("No current session file to update");
    }
  },

  updateSessionStats: async (inputTokens: number, outputTokens: number) => {
    let newStats: AISessionStats;
    setAIStore("sessionStats", (prev) => {
      const newInputTokens = prev.totalInputTokens + inputTokens;
      const newOutputTokens = prev.totalOutputTokens + outputTokens;
      newStats = {
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
      return newStats;
    });

    setTimeout(async () => {
      if (aiStore.currentSessionFile) {
        const currentSession = {
          sessionInfo: {
            startTime: aiStore.sessionStats.sessionStartTime,
            endTime: null,
            duration: aiStore.sessionStats.sessionStartTime
              ? Date.now() -
                new Date(aiStore.sessionStats.sessionStartTime).getTime()
              : 0,
            filename: aiStore.currentSessionFile,
          },
          stats: aiStore.sessionStats,
          adviceHistory: aiStore.sessionHistory,
        };

        try {
          await window.electronAPI.saveAISession(currentSession);
        } catch (error) {
          console.error("Failed to update AI session stats:", error);
        }
      }
    }, 100);
  },

  updateTTSStats: async (characters: number) => {
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

    if (aiStore.currentSessionFile) {
      const currentSession = {
        sessionInfo: {
          startTime: aiStore.sessionStats.sessionStartTime,
          endTime: null,
          duration: aiStore.sessionStats.sessionStartTime
            ? Date.now() -
              new Date(aiStore.sessionStats.sessionStartTime).getTime()
            : 0,
          filename: aiStore.currentSessionFile,
        },
        stats: aiStore.sessionStats,
        adviceHistory: aiStore.sessionHistory,
      };

      try {
        await window.electronAPI.saveAISession(currentSession);
      } catch (error) {
        console.error("Failed to update AI session TTS stats:", error);
      }
    }
  },

  startNewSession: async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `ai-session-${timestamp}.json`;

    const initialSession = {
      sessionInfo: {
        startTime: new Date().toISOString(),
        endTime: null,
        duration: 0,
        filename: filename,
      },
      stats: {
        totalRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTTSCharacters: 0,
        estimatedCost: 0,
        ttsCost: 0,
        sessionStartTime: new Date().toISOString(),
      },
      adviceHistory: [],
    };

    try {
      await window.electronAPI.saveAISession(initialSession);

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
        currentSessionFile: filename,
      });
    } catch (error) {
      console.error("Failed to create AI session file:", error);
    }
  },

  toggleHistory: () => {
    setAIStore("isHistoryOpen", !aiStore.isHistoryOpen);
  },

  closeHistory: () => {
    setAIStore("isHistoryOpen", false);
  },

  endSession: async () => {
    if (aiStore.currentSessionFile && aiStore.sessionHistory.length > 0) {
      const finalSession = {
        sessionInfo: {
          startTime: aiStore.sessionStats.sessionStartTime,
          endTime: new Date().toISOString(),
          duration: aiStore.sessionStats.sessionStartTime
            ? Date.now() -
              new Date(aiStore.sessionStats.sessionStartTime).getTime()
            : 0,
          filename: aiStore.currentSessionFile,
        },
        stats: aiStore.sessionStats,
        adviceHistory: aiStore.sessionHistory,
      };

      try {
        await window.electronAPI.saveAISession(finalSession);
        setAIStore("currentSessionFile", null);
      } catch (error) {
        console.error("Failed to finalize AI session file:", error);
      }
    }
  },

  saveSession: async () => {
    try {
      if (aiStore.sessionHistory.length === 0) {
        throw new Error("No AI session data to save");
      }

      const cleanStats = {
        totalRequests: aiStore.sessionStats.totalRequests || 0,
        totalInputTokens: aiStore.sessionStats.totalInputTokens || 0,
        totalOutputTokens: aiStore.sessionStats.totalOutputTokens || 0,
        totalTTSCharacters: aiStore.sessionStats.totalTTSCharacters || 0,
        estimatedCost: aiStore.sessionStats.estimatedCost || 0,
        ttsCost: aiStore.sessionStats.ttsCost || 0,
        sessionStartTime:
          aiStore.sessionStats.sessionStartTime || new Date().toISOString(),
      };

      const cleanHistory = aiStore.sessionHistory.map((entry) => ({
        timestamp: entry.timestamp,
        advice: entry.advice,
        oldResistance: entry.oldResistance,
        newResistance: entry.newResistance,
        workoutData: {
          time: entry.workoutData.time,
          speed: entry.workoutData.speed,
          rpm: entry.workoutData.rpm,
          power: entry.workoutData.power,
          heartRate: entry.workoutData.heartRate,
        },
        rideStyle: entry.rideStyle,
        goal: entry.goal,
      }));

      const aiSession = {
        sessionInfo: {
          startTime: cleanStats.sessionStartTime,
          endTime: new Date().toISOString(),
          duration: cleanStats.sessionStartTime
            ? Date.now() - new Date(cleanStats.sessionStartTime).getTime()
            : 0,
        },
        stats: cleanStats,
        adviceHistory: cleanHistory,
      };

      const result = await window.electronAPI.saveAISession(aiSession);
      return result;
    } catch (error) {
      console.error("Failed to save AI session:", error);
      throw error;
    }
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
