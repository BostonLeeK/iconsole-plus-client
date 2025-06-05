import { createEffect, createSignal, onCleanup } from "solid-js";
import { RIDE_STYLES, TRAINING_GOALS } from "../../../services/ai.service";
import speechService from "../../services/speechService";
import { aiActions, aiStore } from "../../store/ai.store";
import { appState } from "../../store/app";
import { AISessionHistory } from "./AISessionHistory";
import { SpeechSettings } from "./SpeechSettings";

export function AITrainer() {
  const [aiEnabled, setAiEnabled] = createSignal(false);
  const [rideStyle, setRideStyle] = createSignal("suburban");
  const [goal, setGoal] = createSignal("casual");
  const [advice, setAdvice] = createSignal("");
  const [isAnalyzing, setIsAnalyzing] = createSignal(false);
  const [hasApiKey, setHasApiKey] = createSignal(false);
  const [sessionStartTime, setSessionStartTime] = createSignal(0);
  const [isSpeaking, setIsSpeaking] = createSignal(false);
  const [hasShownWelcome, setHasShownWelcome] = createSignal(false);
  const [isWelcomeMessage, setIsWelcomeMessage] = createSignal(false);

  let analysisInterval: NodeJS.Timeout | null = null;

  createEffect(async () => {
    const apiKey = await window.electronAPI.settings.getClaudeApiKey();
    setHasApiKey(!!apiKey);
  });

  createEffect(() => {
    if (aiEnabled() && hasApiKey()) {
      setSessionStartTime(Date.now());
      aiActions.startNewSession();

      if (!hasShownWelcome()) {
        showWelcomeMessage();
        setHasShownWelcome(true);
      }

      startAIAnalysis();
    } else {
      stopAIAnalysis();
      setHasShownWelcome(false);
    }
  });

  const speakAdvice = async (text: string) => {
    try {
      setIsSpeaking(true);
      await speechService.speak(text, true);
    } catch (error) {
      console.error("Speech synthesis error:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    speechService.stop();
    setIsSpeaking(false);
  };

  const showWelcomeMessage = async () => {
    const rideStyleName =
      RIDE_STYLES.find((s) => s.id === rideStyle())?.name || "suburban";
    const goalName =
      TRAINING_GOALS.find((g) => g.id === goal())?.name || "casual";

    const isDeviceConnected = appState.isConnected;
    const resistanceControl = isDeviceConnected ? "and adjust resistance" : "";
    const connectionStatus = isDeviceConnected
      ? ""
      : " Note: Device not connected - I'll provide advice only.";

    const welcomeMessages = [
      `Welcome to your ${goalName.toLowerCase()} ${rideStyleName.toLowerCase()} training session! I'm your AI trainer and I'll help you optimize your workout every 30 seconds ${resistanceControl}.${connectionStatus}`,
      `Ready for a ${goalName.toLowerCase()} ride through ${rideStyleName.toLowerCase()} terrain? Let's get started and I'll provide personalized guidance throughout your session${connectionStatus}`,
      `AI trainer activated for ${goalName.toLowerCase()} training! I'll monitor your ${rideStyleName.toLowerCase()} ride ${resistanceControl} to help you achieve your goals.${connectionStatus}`,
      `Let's begin your ${goalName.toLowerCase()} workout! I'll be analyzing your performance and providing coaching tips for this ${rideStyleName.toLowerCase()} session.${connectionStatus}`,
    ];

    const welcomeMessage =
      welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    setAdvice(welcomeMessage);
    setIsWelcomeMessage(true);

    try {
      await speakAdvice(welcomeMessage);
    } catch (error) {
      console.error("Welcome message speech failed:", error);
    }
  };

  const startAIAnalysis = () => {
    if (analysisInterval) return;

    // Delay first analysis to allow welcome message to be read/heard
    const firstAnalysisDelay = hasShownWelcome() ? 15000 : 0; // 15 seconds after welcome

    setTimeout(() => {
      if (analysisInterval) return;
      analysisInterval = setInterval(async () => {
        try {
          setIsAnalyzing(true);
          const workoutData = appState.workoutData;
          const isDeviceConnected = appState.isConnected;

          // If no device connected, provide general advice
          if (!isDeviceConnected) {
            const generalAdvice = [
              "Keep a steady pace and focus on your breathing. Remember to maintain good posture throughout your ride.",
              "Great job! Try to maintain consistent pedaling rhythm. Listen to your body and adjust intensity as needed.",
              "Focus on smooth pedal strokes and keep your core engaged. You're doing well!",
              "Remember to stay hydrated during your workout. Keep up the good work!",
            ];

            const advice =
              generalAdvice[Math.floor(Math.random() * generalAdvice.length)];
            setAdvice(advice);
            setIsWelcomeMessage(false);
            speakAdvice(advice);

            // Add to history (but no tokens/cost for general advice)
            aiActions.addAdviceEntry({
              timestamp: new Date().toISOString(),
              advice: advice,
              oldResistance: 0,
              newResistance: 0,
              workoutData: {
                time: 0,
                speed: 0,
                rpm: 0,
                power: 0,
                heartRate: 0,
              },
              rideStyle: rideStyle(),
              goal: goal(),
            });
            return;
          }

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
          setIsWelcomeMessage(false);

          speakAdvice(response.advice);

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

          // Try to set resistance only if device is connected
          try {
            const connectionStatus =
              await window.electronAPI.bluetoothService.checkConnectionStatus();
            if (connectionStatus.isConnected) {
              await window.electronAPI.bluetoothService.setResistanceLevel(
                response.newResistance
              );
            } else {
              console.warn("Cannot set resistance: device not connected");
            }
          } catch (resistanceError) {
            console.warn("Failed to set resistance:", resistanceError.message);
            // Continue with advice even if resistance setting fails
          }
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
    }, firstAnalysisDelay);
  };

  const stopAIAnalysis = () => {
    if (analysisInterval) {
      clearInterval(analysisInterval);
      analysisInterval = null;
    }
    stopSpeaking();
  };

  onCleanup(() => {
    stopAIAnalysis();
  });

  const toggleAI = () => {
    setAiEnabled(!aiEnabled());
  };

  const repeatAdvice = () => {
    if (advice()) {
      speakAdvice(advice());
    }
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
            <SpeechSettings />
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
              disabled={!hasApiKey()}
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

        {aiEnabled() && !appState.isConnected && (
          <div class="bg-orange-900/30 border border-orange-600 rounded-md p-3 mb-4">
            <p class="text-orange-200 text-sm">
              <svg
                class="w-4 h-4 inline mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z" />
              </svg>
              Device not connected - AI trainer will provide advice only (no
              resistance control)
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
            <div
              class={`${
                isWelcomeMessage()
                  ? "bg-green-900/30 border-green-600"
                  : "bg-purple-900/30 border-purple-600"
              } border rounded-md p-3`}
            >
              <div class="flex justify-between items-start mb-2">
                <h4
                  class={`${
                    isWelcomeMessage() ? "text-green-200" : "text-purple-200"
                  } text-sm font-medium flex items-center gap-2`}
                >
                  {isWelcomeMessage() && (
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                  {isWelcomeMessage() ? "Welcome Message:" : "AI Advice:"}
                </h4>
                <div class="flex items-center gap-1">
                  {isSpeaking() && (
                    <button
                      onClick={stopSpeaking}
                      class="text-purple-400 hover:text-purple-300 p-1"
                      title="Stop speaking"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 6h12v12H6z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={repeatAdvice}
                    disabled={isSpeaking()}
                    class="text-purple-400 hover:text-purple-300 p-1 disabled:opacity-50"
                    title="Repeat advice"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 7h4l1 1v8l-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <p
                class={`${
                  isWelcomeMessage() ? "text-green-100" : "text-purple-100"
                } text-sm`}
              >
                {advice()}
              </p>
              {isSpeaking() && (
                <div class="mt-2 flex items-center gap-2 text-xs text-purple-300">
                  <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  Speaking...
                </div>
              )}
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
              {aiStore.sessionStats.ttsCost > 0 && (
                <div class="flex justify-between items-center text-xs mt-1 pt-1 border-t border-gray-700">
                  <span class="text-gray-500">TTS cost:</span>
                  <span class="text-orange-400 font-mono">
                    {aiStore.sessionStats.ttsCost < 0.001
                      ? "<$0.001"
                      : `$${aiStore.sessionStats.ttsCost.toFixed(4)}`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <AISessionHistory />
    </>
  );
}
