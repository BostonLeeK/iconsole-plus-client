import { createSignal, onMount } from "solid-js";
import { appActions } from "../../store/app.store";

export function Settings() {
  const [claudeApiKey, setClaudeApiKey] = createSignal("");
  const [openaiApiKey, setOpenAIApiKey] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSaved, setIsSaved] = createSignal(false);
  const [openaiSaved, setOpenAISaved] = createSignal(false);

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

  return (
    <div class="min-h-screen bg-gray-900 text-white p-6">
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
      </div>
    </div>
  );
}
