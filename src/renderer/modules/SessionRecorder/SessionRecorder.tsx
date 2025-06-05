import { createSignal, onCleanup, onMount } from "solid-js";
import { appState, startRecording, stopRecording } from "../../store/app";

export function SessionRecorder() {
  const [currentTime, setCurrentTime] = createSignal(Date.now());
  let interval: NodeJS.Timeout | null = null;

  onMount(() => {
    interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
  });

  onCleanup(() => {
    if (interval) {
      clearInterval(interval);
    }
  });

  const formatDuration = (ms: number): string => {
    if (ms < 0 || isNaN(ms) || !isFinite(ms)) {
      return "00:00:00";
    }

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours.toString().padStart(2, "0")}:${(minutes % 60)
      .toString()
      .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  const getCurrentDuration = () => {
    if (!appState.recording.isRecording || appState.recording.startTime === 0) {
      return "00:00:00";
    }
    const elapsed = currentTime() - appState.recording.startTime;
    return formatDuration(elapsed);
  };

  return (
    <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
      <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">Session Recorder</h2>
            <p class="text-purple-200 text-sm">Record your workout sessions</p>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            {appState.recording.isRecording ? (
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span class="text-red-400 font-medium">Recording</span>
              </div>
            ) : (
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span class="text-gray-400 font-medium">Stopped</span>
              </div>
            )}

            <div class="text-2xl font-mono text-white">
              {getCurrentDuration()}
            </div>
          </div>

          <div class="text-sm text-gray-400">
            Data points: {appState.recording.sessionData.length}
          </div>
        </div>

        <div class="flex gap-3">
          {!appState.recording.isRecording ? (
            <button
              onClick={startRecording}
              disabled={!appState.isConnected}
              class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
              Stop Recording
            </button>
          )}
        </div>

        {!appState.isConnected && (
          <p class="text-amber-400 text-sm mt-3 text-center">
            Connect to a device to start recording
          </p>
        )}
      </div>
    </div>
  );
}
