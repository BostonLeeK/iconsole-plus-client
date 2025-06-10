import { createSignal, onMount } from "solid-js";
import { appActions } from "../../store/app.store";

export function Settings() {
  const [claudeApiKey, setClaudeApiKey] = createSignal("");
  const [openaiApiKey, setOpenAIApiKey] = createSignal("");
  const [aiAnalysisInterval, setAiAnalysisInterval] = createSignal(30);
  const [websocketApiKey, setWebsocketApiKey] = createSignal("");
  const [websocketPort, setWebsocketPort] = createSignal(8080);
  const [websocketEnabled, setWebsocketEnabled] = createSignal(false);
  const [websocketStatus, setWebsocketStatus] = createSignal({
    isRunning: false,
    connectedClients: 0,
  });
  const [caloriesDivisor, setCaloriesDivisor] = createSignal(3.5);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSaved, setIsSaved] = createSignal(false);
  const [openaiSaved, setOpenAISaved] = createSignal(false);
  const [intervalSaved, setIntervalSaved] = createSignal(false);
  const [websocketSaved, setWebsocketSaved] = createSignal(false);
  const [caloriesSaved, setCaloriesSaved] = createSignal(false);

  onMount(async () => {
    try {
      const claudeKey = await window.electronAPI.settings.getClaudeApiKey();
      if (claudeKey) {
        setClaudeApiKey(claudeKey);
      }

      const openaiKey = await window.electronAPI.settings.getOpenAIApiKey();
      if (openaiKey) {
        setOpenAIApiKey(openaiKey);
      }

      const interval =
        await window.electronAPI.settings.getAIAnalysisInterval();
      setAiAnalysisInterval(interval);

      const wsApiKey = await window.electronAPI.settings.getWebSocketApiKey();
      if (wsApiKey) {
        setWebsocketApiKey(wsApiKey);
      }

      const wsPort = await window.electronAPI.settings.getWebSocketPort();
      setWebsocketPort(wsPort);

      const wsEnabled = await window.electronAPI.settings.getWebSocketEnabled();
      setWebsocketEnabled(wsEnabled);

      const wsStatus = await window.electronAPI.websocket.getStatus();
      setWebsocketStatus(wsStatus);

      const divisor = await window.electronAPI.settings.getCaloriesDivisor();
      setCaloriesDivisor(divisor);
    } catch (error) {}
  });

  const handleSave = async () => {
    if (!claudeApiKey().trim()) return;

    setIsLoading(true);
    try {
      await window.electronAPI.settings.setClaudeApiKey(claudeApiKey().trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    setIsLoading(true);
    try {
      await window.electronAPI.settings.clearClaudeApiKey();
      setClaudeApiKey("");
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOpenAI = async () => {
    if (!openaiApiKey().trim()) return;

    setIsLoading(true);
    try {
      await window.electronAPI.settings.setOpenAIApiKey(openaiApiKey().trim());
      setOpenAISaved(true);
      setTimeout(() => setOpenAISaved(false), 2000);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearOpenAI = async () => {
    setIsLoading(true);
    try {
      await window.electronAPI.settings.clearOpenAIApiKey();
      setOpenAIApiKey("");
      setOpenAISaved(true);
      setTimeout(() => setOpenAISaved(false), 2000);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInterval = async () => {
    const interval = aiAnalysisInterval();
    if (interval < 10 || interval > 300) return;

    setIsLoading(true);
    try {
      await window.electronAPI.settings.setAIAnalysisInterval(interval);
      setIntervalSaved(true);
      setTimeout(() => setIntervalSaved(false), 2000);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCaloriesDivisor = async () => {
    const divisor = caloriesDivisor();
    if (divisor <= 0 || divisor > 10) return;

    setIsLoading(true);
    try {
      await window.electronAPI.settings.setCaloriesDivisor(divisor);
      setCaloriesSaved(true);
      setTimeout(() => setCaloriesSaved(false), 2000);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const generateWebSocketApiKey = async () => {
    setIsLoading(true);
    try {
      const newApiKey =
        await window.electronAPI.settings.generateWebSocketApiKey();
      setWebsocketApiKey(newApiKey);
      setWebsocketSaved(true);
      setTimeout(() => setWebsocketSaved(false), 2000);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const saveWebSocketSettings = async () => {
    const port = websocketPort();
    if (port < 1024 || port > 65535) return;

    setIsLoading(true);
    try {
      await window.electronAPI.settings.setWebSocketPort(port);
      setWebsocketSaved(true);
      setTimeout(() => setWebsocketSaved(false), 2000);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWebSocket = async () => {
    if (!websocketApiKey().trim()) {
      await generateWebSocketApiKey();
    }

    setIsLoading(true);
    try {
      const newState = !websocketEnabled();
      await window.electronAPI.settings.setWebSocketEnabled(newState);
      setWebsocketEnabled(newState);

      const status = await window.electronAPI.websocket.getStatus();
      setWebsocketStatus(status);
    } catch (error) {
      alert(
        `Failed to ${websocketEnabled() ? "stop" : "start"} WebSocket server: ${
          error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div class="min-h-screen max-h-screen overflow-y-auto bg-gray-900 text-white p-6 pb-24">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-4 mb-8">
          <button
            onClick={() => appActions.navigateToDashboard()}
            class="p-2 hover:bg-gray-800 rounded-lg transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 class="text-3xl font-bold">Settings</h1>
        </div>

        <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span class="text-lg">🤖</span>
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-bold text-white">AI Configuration</h2>
                <p class="text-purple-100 text-sm">
                  Configure Claude API for AI assistance
                </p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Claude API Key
              </label>
              <input
                type="password"
                value={claudeApiKey()}
                onInput={(e) => setClaudeApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p class="text-gray-400 text-sm mt-2">
                Your Claude API key will be stored securely on your device
              </p>
            </div>

            <div class="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isLoading() || !claudeApiKey().trim()}
                class={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isLoading() || !claudeApiKey().trim()
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : isSaved()
                    ? "bg-green-600 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                {isLoading() && (
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isSaved() ? "✓ Saved" : "Save API Key"}
              </button>

              <button
                onClick={handleClear}
                disabled={isLoading()}
                class={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isLoading()
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden mt-6">
          <div class="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span class="text-lg">🎙️</span>
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-bold text-white">
                  OpenAI TTS Configuration
                </h2>
                <p class="text-blue-100 text-sm">
                  Configure OpenAI API for premium text-to-speech
                </p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiApiKey()}
                onInput={(e) => setOpenAIApiKey(e.target.value)}
                placeholder="sk-..."
                class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p class="text-gray-400 text-sm mt-2">
                Required for premium OpenAI TTS voices in AI trainer
              </p>
            </div>

            <div class="flex gap-3">
              <button
                onClick={handleSaveOpenAI}
                disabled={isLoading() || !openaiApiKey().trim()}
                class={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isLoading() || !openaiApiKey().trim()
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : openaiSaved()
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isLoading() && (
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {openaiSaved() ? "✓ Saved" : "Save API Key"}
              </button>

              <button
                onClick={handleClearOpenAI}
                disabled={isLoading()}
                class={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isLoading()
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden mt-6">
          <div class="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span class="text-lg">⏱️</span>
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-bold text-white">
                  AI Trainer Settings
                </h2>
                <p class="text-orange-100 text-sm">
                  Configure AI analysis behavior
                </p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                AI Analysis Interval (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={aiAnalysisInterval()}
                onInput={(e) =>
                  setAiAnalysisInterval(parseInt(e.target.value) || 30)
                }
                class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p class="text-gray-400 text-xs mt-2">
                How often AI analyzes your workout (10-300 seconds). Default: 30
                seconds
              </p>
            </div>

            <button
              onClick={handleSaveInterval}
              disabled={
                isLoading() ||
                aiAnalysisInterval() < 10 ||
                aiAnalysisInterval() > 300
              }
              class={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                isLoading() ||
                aiAnalysisInterval() < 10 ||
                aiAnalysisInterval() > 300
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : intervalSaved()
                  ? "bg-green-600 text-white"
                  : "bg-orange-600 hover:bg-orange-700 text-white"
              }`}
            >
              {isLoading() && (
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {intervalSaved() ? "✓ Saved" : "Save Interval"}
            </button>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Calories Divisor
              </label>
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={caloriesDivisor()}
                onInput={(e) =>
                  setCaloriesDivisor(parseFloat(e.target.value) || 3.5)
                }
                class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p class="text-gray-400 text-xs mt-2">
                Divide calories by this number to reduce values. Default: 3.5
                (0.1-10.0)
              </p>
            </div>

            <button
              onClick={handleSaveCaloriesDivisor}
              disabled={
                isLoading() || caloriesDivisor() <= 0 || caloriesDivisor() > 10
              }
              class={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                isLoading() || caloriesDivisor() <= 0 || caloriesDivisor() > 10
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : caloriesSaved()
                  ? "bg-green-600 text-white"
                  : "bg-orange-600 hover:bg-orange-700 text-white"
              }`}
            >
              {isLoading() && (
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {caloriesSaved() ? "✓ Saved" : "Save Divisor"}
            </button>
          </div>
        </div>

        <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden mt-6">
          <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span class="text-lg">🌐</span>
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-bold text-white">
                  WebSocket Data Stream
                </h2>
                <p class="text-emerald-100 text-sm">
                  Real-time workout data broadcasting for external apps
                </p>
              </div>
              <div class="flex items-center gap-2">
                {websocketStatus().isRunning && (
                  <div class="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                    <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span class="text-xs text-green-200">
                      {websocketStatus().connectedClients} clients
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <div class="flex gap-2">
                  <input
                    type="password"
                    value={websocketApiKey()}
                    onInput={(e) => setWebsocketApiKey(e.target.value)}
                    placeholder="Generate or paste API key"
                    class="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => copyToClipboard(websocketApiKey())}
                    disabled={!websocketApiKey()}
                    class="px-3 py-3 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
                    title="Copy API key"
                  >
                    📋
                  </button>
                </div>
                <p class="text-gray-400 text-xs mt-2">
                  Required for client authentication. Keep this secure!
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  min="1024"
                  max="65535"
                  value={websocketPort()}
                  onInput={(e) =>
                    setWebsocketPort(parseInt(e.target.value) || 8080)
                  }
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p class="text-gray-400 text-xs mt-2">
                  WebSocket server port (1024-65535)
                </p>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                onClick={generateWebSocketApiKey}
                disabled={isLoading()}
                class={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isLoading()
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                Generate API Key
              </button>

              <button
                onClick={saveWebSocketSettings}
                disabled={
                  isLoading() ||
                  websocketPort() < 1024 ||
                  websocketPort() > 65535
                }
                class={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isLoading() ||
                  websocketPort() < 1024 ||
                  websocketPort() > 65535
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : websocketSaved()
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {websocketSaved() ? "✓ Saved" : "Save Port"}
              </button>

              <button
                onClick={toggleWebSocket}
                disabled={isLoading() || !websocketApiKey().trim()}
                class={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isLoading() || !websocketApiKey().trim()
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : websocketEnabled()
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {websocketEnabled() ? "Stop Server" : "Start Server"}
              </button>
            </div>

            {websocketStatus().isRunning && (
              <div class="bg-gray-700 rounded-lg p-4">
                <h4 class="text-white font-medium mb-3">
                  Connection Information
                </h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-300">WebSocket URL:</span>
                    <code class="text-emerald-400 bg-gray-800 px-2 py-1 rounded">
                      ws://localhost:{websocketPort()}?apiKey=YOUR_API_KEY
                    </code>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-300">Status API:</span>
                    <code class="text-emerald-400 bg-gray-800 px-2 py-1 rounded">
                      http://localhost:{websocketPort()}/api/status
                    </code>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-300">Connected Clients:</span>
                    <span class="text-white">
                      {websocketStatus().connectedClients}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden mt-6">
          <div class="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span class="text-lg">⚙️</span>
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-bold text-white">General Settings</h2>
                <p class="text-blue-100 text-sm">
                  Configure general settings for the app
                </p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div>
              <button
                class="px-4 py-3 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  window.electronAPI.settings.openLogsDirectory();
                }}
              >
                Open Logs Directory
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
