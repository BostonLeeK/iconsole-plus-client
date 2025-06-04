import { createSignal } from "solid-js";
import { appState } from "../../store/app";

export function RawData() {
  const [isExpanded, setIsExpanded] = createSignal(false);

  return (
    <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
      <div class="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
        <div class="flex items-center justify-between">
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
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">Raw Data</h2>
              <p class="text-gray-300 text-sm">Debug information</p>
            </div>
          </div>
          <button
            class="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-white text-sm font-medium"
            onClick={() => setIsExpanded(!isExpanded())}
          >
            <span>{isExpanded() ? "Collapse" : "Expand"}</span>
            <svg
              class={`w-4 h-4 transition-transform duration-200 ${
                isExpanded() ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        class={`transition-all duration-300 overflow-hidden ${
          isExpanded() ? "max-h-96" : "max-h-24"
        }`}
      >
        <div class="p-6">
          {appState.rawData ? (
            <div class="relative">
              <pre class="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono leading-relaxed overflow-auto border border-gray-700 shadow-inner">
                <code>{appState.rawData}</code>
              </pre>
              <div class="absolute top-2 right-2">
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span class="text-xs text-green-400 font-medium">Live</span>
                </div>
              </div>
            </div>
          ) : (
            <div class="text-center py-8">
              <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  class="w-8 h-8 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-200 mb-2">
                No data received
              </h3>
              <p class="text-gray-400">
                Connect to a device to see raw data stream
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
