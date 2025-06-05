import { createEffect, createSignal, onCleanup } from "solid-js";
import { RIDE_STYLES, TRAINING_GOALS } from "../../../services/ai.service";
import { aiActions, aiStore } from "../../store/ai.store";
import { appState } from "../../store/app";
import { AISessionHistory } from "./AISessionHistory";

export function AITrainer() {
  const [aiEnabled, setAiEnabled] = createSignal(false);
  const [rideStyle, setRideStyle] = createSignal("suburban");
  const [goal, setGoal] = createSignal("casual");
  const [advice, setAdvice] = createSignal("");
  const [isAnalyzing, setIsAnalyzing] = createSignal(false);
  const [hasApiKey, setHasApiKey] = createSignal(false);
  const [sessionStartTime, setSessionStartTime] = createSignal(0);

  let analysisInterval: NodeJS.Timeout | null = null;

  createEffect(async () => {
    const apiKey = await window.electronAPI.settings.getClaudeApiKey();
    setHasApiKey(!!apiKey);
  });

  createEffect(() => {
    if (aiEnabled() && hasApiKey() && appState.isConnected) {
      setSessionStartTime(Date.now());
      aiActions.startNewSession();
      startAIAnalysis();
    } else {
      stopAIAnalysis();
    }
  });

  const startAIAnalysis = () => {
    if (analysisInterval) return;

    analysisInterval = setInterval(async () => {
      try {
        setIsAnalyzing(true);
        const workoutData = appState.workoutData;

        if (!workoutData) return;

        const sessionDuration = Math.floor(
          (Date.now() - sessionStartTime()) / 1000
        );

        const apiKey = await window.electronAPI.settings.getClaudeApiKey();
        if (!apiKey) {
          setAdvice("API key not configured");
          return;
        }

        const oldResistance = workoutData.resistance;

        const response = await window.electronAPI.aiService.analyzeWorkout(
          {
            workoutData: {
              time: workoutData.time,
              speed: workoutData.speed,
              rpm: workoutData.rpm,
              power: workoutData.watt,
              heartRate: workoutData.heartRate,
              currentResistance: oldResistance,
            },
            rideStyle: rideStyle(),
            goal: goal(),
            sessionDuration,
          },
          apiKey
        );

        setAdvice(response.advice);

        aiActions.addAdviceEntry({
          timestamp: new Date().toISOString(),
          advice: response.advice,
          oldResistance,
          newResistance: response.newResistance,
          workoutData: {
            time: workoutData.time,
            speed: workoutData.speed,
            rpm: workoutData.rpm,
            power: workoutData.watt,
            heartRate: workoutData.heartRate,
          },
          rideStyle: rideStyle(),
          goal: goal(),
        });

        if (response.inputTokens && response.outputTokens) {
          aiActions.updateSessionStats(
            response.inputTokens,
            response.outputTokens
          );
        }

        await window.electronAPI.bluetoothService.setResistanceLevel(
          response.newResistance
        );
      } catch (error) {
        console.error("AI Analysis Error:", error);
        if (error.message.includes("API key")) {
          setAdvice("Invalid API key");
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          setAdvice("Network error");
        } else if (error.message.includes("API error")) {
          setAdvice("Claude API error");
        } else {
          setAdvice(`Error: ${error.message}`);
        }
      } finally {
        setIsAnalyzing(false);
      }
    }, 30000);
  };

  const stopAIAnalysis = () => {
    if (analysisInterval) {
      clearInterval(analysisInterval);
      analysisInterval = null;
    }
  };

  onCleanup(() => {
    stopAIAnalysis();
  });

  const toggleAI = () => {
    setAiEnabled(!aiEnabled());
  };

  return (
    <>
      <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white flex items-center gap-2">
            <svg
              class="w-5 h-5 text-purple-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            AI Trainer
            {aiStore.sessionStats.totalRequests > 0 && (
              <span class="text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded-full">
                {aiStore.sessionStats.totalRequests} requests
              </span>
            )}
          </h3>
          <div class="flex items-center gap-2">
            {aiStore.sessionHistory.length > 0 && (
              <button
                onClick={aiActions.toggleHistory}
                class="text-gray-400 hover:text-purple-400 p-1 rounded"
                title="AI Advice History"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}
            {isAnalyzing() && (
              <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            )}
            <button
              onClick={toggleAI}
              disabled={!hasApiKey() || !appState.isConnected}
              class={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                aiEnabled()
                  ? "bg-purple-600 text-white"
                  : "bg-gray-600 text-gray-300 hover:bg-gray-500"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {aiEnabled() ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {!hasApiKey() && (
          <div class="bg-yellow-900/30 border border-yellow-600 rounded-md p-3 mb-4">
            <p class="text-yellow-200 text-sm">
              Add Claude API key in settings to use AI trainer
            </p>
          </div>
        )}

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Ride Style
            </label>
            <select
              value={rideStyle()}
              onChange={(e) => setRideStyle(e.currentTarget.value)}
              disabled={aiEnabled()}
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm disabled:opacity-50"
            >
              {RIDE_STYLES.map((style) => (
                <option value={style.id}>{style.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Training Goal
            </label>
            <select
              value={goal()}
              onChange={(e) => setGoal(e.currentTarget.value)}
              disabled={aiEnabled()}
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm disabled:opacity-50"
            >
              {TRAINING_GOALS.map((goalItem) => (
                <option value={goalItem.id}>{goalItem.name}</option>
              ))}
            </select>
          </div>

          {advice() && (
            <div class="bg-purple-900/30 border border-purple-600 rounded-md p-3">
              <h4 class="text-purple-200 text-sm font-medium mb-1">
                AI Advice:
              </h4>
              <p class="text-purple-100 text-sm">{advice()}</p>
            </div>
          )}

          {aiStore.sessionStats.estimatedCost > 0 && (
            <div class="bg-gray-900/50 border border-gray-600 rounded-md p-2">
              <div class="flex justify-between items-center text-xs">
                <span class="text-gray-400">Session cost:</span>
                <span class="text-yellow-400 font-mono">
                  {aiStore.sessionStats.estimatedCost < 0.001
                    ? "<$0.001"
                    : `$${aiStore.sessionStats.estimatedCost.toFixed(4)}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <AISessionHistory />
    </>
  );
}
