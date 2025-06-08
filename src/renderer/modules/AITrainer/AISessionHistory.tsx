import { Show } from "solid-js";
import { RIDE_STYLES, TRAINING_GOALS } from "../../../services/ai.service";
import speechService from "../../services/speechService";
import { aiActions, AIAdviceEntry, aiStore } from "../../store/ai.store";

export function AISessionHistory() {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatCost = (cost: number) => {
    return cost < 0.001 ? "<$0.001" : `$${cost.toFixed(4)}`;
  };

  const getRideStyleName = (id: string) => {
    return RIDE_STYLES.find((style) => style.id === id)?.name || id;
  };

  const getGoalName = (id: string) => {
    return TRAINING_GOALS.find((goal) => goal.id === id)?.name || id;
  };

  const AdviceCard = (props: { entry: AIAdviceEntry; index: number }) => (
    <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
      <div class="flex justify-between items-start mb-2">
        <div class="flex items-center gap-2">
          <span class="text-purple-400 font-mono text-sm">
            #{props.index + 1}
          </span>
          <span class="text-gray-300 text-sm">
            {formatTime(props.entry.timestamp)}
          </span>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="bg-blue-900/50 text-blue-200 px-2 py-1 rounded">
            {getRideStyleName(props.entry.rideStyle)}
          </span>
          <span class="bg-green-900/50 text-green-200 px-2 py-1 rounded">
            {getGoalName(props.entry.goal)}
          </span>
        </div>
      </div>

      <div class="mb-3">
        <div class="flex justify-between items-start gap-2">
          <p class="text-white text-sm leading-relaxed flex-1">
            {props.entry.advice}
          </p>
          <button
            onClick={() => speechService.speak(props.entry.advice, true)}
            class="text-purple-400 hover:text-purple-300 p-1 flex-shrink-0"
            title="Speak advice"
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

      <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        <div class="bg-gray-800 rounded px-2 py-1">
          <span class="text-gray-400">Resistance:</span>
          <span class="text-white ml-1">
            {props.entry.oldResistance} → {props.entry.newResistance}
          </span>
        </div>
        <div class="bg-blue-800 rounded px-2 py-1">
          <span class="text-blue-300">Target Speed:</span>
          <span class="text-white ml-1">{props.entry.targetSpeed} km/h</span>
        </div>
        <div class="bg-gray-800 rounded px-2 py-1">
          <span class="text-gray-400">Speed:</span>
          <span class="text-white ml-1">
            {props.entry.workoutData.speed} km/h
          </span>
        </div>
        <div class="bg-gray-800 rounded px-2 py-1">
          <span class="text-gray-400">RPM:</span>
          <span class="text-white ml-1">{props.entry.workoutData.rpm}</span>
        </div>
        <div class="bg-gray-800 rounded px-2 py-1">
          <span class="text-gray-400">Power:</span>
          <span class="text-white ml-1">{props.entry.workoutData.power}W</span>
        </div>
        <div class="bg-gray-800 rounded px-2 py-1">
          <span class="text-gray-400">Heart Rate:</span>
          <span class="text-white ml-1">
            {props.entry.workoutData.heartRate || "-"}
          </span>
        </div>
        <div class="bg-gray-800 rounded px-2 py-1">
          <span class="text-gray-400">Time:</span>
          <span class="text-white ml-1">
            {Math.floor(props.entry.workoutData.time / 60)}:
            {String(props.entry.workoutData.time % 60).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Show when={aiStore.isHistoryOpen}>
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
          <div class="flex justify-between items-center p-4 border-b border-gray-700">
            <div>
              <h2 class="text-xl font-semibold text-white">
                AI Trainer History
              </h2>
              <Show when={aiStore.sessionStats.sessionStartTime}>
                <p class="text-gray-400 text-sm">
                  Session started:{" "}
                  {new Date(
                    aiStore.sessionStats.sessionStartTime!
                  ).toLocaleString("uk-UA")}
                </p>
              </Show>
            </div>
            <button
              onClick={aiActions.closeHistory}
              class="text-gray-400 hover:text-white p-2"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="bg-gray-900 p-4 border-b border-gray-700">
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-purple-400">
                  {aiStore.sessionStats.totalRequests}
                </div>
                <div class="text-gray-400 text-sm">AI Requests</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-blue-400">
                  {(aiStore.sessionStats.totalInputTokens / 1000).toFixed(1)}K
                </div>
                <div class="text-gray-400 text-sm">Input tokens</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-400">
                  {(aiStore.sessionStats.totalOutputTokens / 1000).toFixed(1)}K
                </div>
                <div class="text-gray-400 text-sm">Output tokens</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-orange-400">
                  {(aiStore.sessionStats.totalTTSCharacters / 1000).toFixed(1)}K
                </div>
                <div class="text-gray-400 text-sm">TTS chars</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-yellow-400">
                  {formatCost(aiStore.sessionStats.estimatedCost)}
                </div>
                <div class="text-gray-400 text-sm">Total cost</div>
              </div>
            </div>

            <Show when={aiStore.sessionStats.ttsCost > 0}>
              <div class="mt-3 text-center text-sm text-gray-400">
                Claude:{" "}
                {formatCost(
                  aiStore.sessionStats.estimatedCost -
                    aiStore.sessionStats.ttsCost
                )}{" "}
                • OpenAI TTS: {formatCost(aiStore.sessionStats.ttsCost)}
              </div>
            </Show>
          </div>

          <div class="p-4 overflow-y-auto max-h-[60vh]">
            <Show
              when={aiStore.sessionHistory.length > 0}
              fallback={
                <div class="text-center py-8">
                  <div class="text-gray-400 text-lg mb-2">No AI advice yet</div>
                  <div class="text-gray-500 text-sm">
                    Turn on AI trainer to get personalized advice
                  </div>
                </div>
              }
            >
              <div class="space-y-4">
                {aiStore.sessionHistory
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <AdviceCard
                      entry={entry}
                      index={aiStore.sessionHistory.length - 1 - index}
                    />
                  ))}
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
}
