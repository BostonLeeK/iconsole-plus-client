import { createEffect, createSignal, Show } from "solid-js";
import { speechService, TTSProvider } from "../../services/speechService";

export function SpeechSettings() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [settings, setSettings] = createSignal(speechService.getSettings());
  const [testText] = createSignal(
    "This is a test of the AI trainer voice system."
  );

  createEffect(() => {
    if (isOpen()) {
      setSettings(speechService.getSettings());
    }
  });

  const handleToggle = () => {
    speechService.setEnabled(!settings().enabled);
    setSettings(speechService.getSettings());
  };

  const handleVoiceChange = (voiceName: string) => {
    speechService.setVoiceByName(voiceName);
    setSettings(speechService.getSettings());
  };

  const handleRateChange = (rate: number) => {
    speechService.setRate(rate);
    setSettings(speechService.getSettings());
  };

  const handlePitchChange = (pitch: number) => {
    speechService.setPitch(pitch);
    setSettings(speechService.getSettings());
  };

  const handleVolumeChange = (volume: number) => {
    speechService.setVolume(volume);
    setSettings(speechService.getSettings());
  };

  const handleProviderChange = (provider: TTSProvider) => {
    speechService.setProvider(provider);
    setSettings(speechService.getSettings());
  };

  const handleOpenAIVoiceChange = (voice: string) => {
    speechService.setOpenAIVoice(voice);
    setSettings(speechService.getSettings());
  };

  const testVoice = async () => {
    try {
      await speechService.speak(testText(), true);
    } catch (error) {
      console.error("Speech test failed:", error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen())}
        class="text-gray-400 hover:text-purple-400 p-1 rounded"
        title="Speech Settings"
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
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 7h4l1 1v8l-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1z"
          />
        </svg>
      </button>

      <Show when={isOpen()}>
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div class="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700">
            <div class="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 class="text-lg font-semibold text-white">Voice Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                class="text-gray-400 hover:text-white p-1"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="p-4 space-y-4">
              <Show
                when={settings().isSupported}
                fallback={
                  <div class="bg-red-900/30 border border-red-600 rounded-md p-3">
                    <p class="text-red-200 text-sm">
                      Speech synthesis is not supported in this browser.
                    </p>
                  </div>
                }
              >
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-300">
                    Enable Voice
                  </label>
                  <button
                    onClick={handleToggle}
                    class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings().enabled ? "bg-purple-600" : "bg-gray-600"
                    }`}
                  >
                    <span
                      class={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings().enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <Show when={settings().enabled}>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      TTS Provider
                    </label>
                    <select
                      value={settings().provider}
                      onChange={(e) =>
                        handleProviderChange(
                          e.currentTarget.value as TTSProvider
                        )
                      }
                      class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm"
                    >
                      <option value="web">Browser TTS (Free)</option>
                      <option value="openai">OpenAI TTS (Premium)</option>
                    </select>
                  </div>

                  <Show when={settings().provider === "openai"}>
                    <div class="bg-blue-900/30 border border-blue-600 rounded-md p-3">
                      <p class="text-blue-200 text-sm mb-2">
                        OpenAI TTS requires an API key. Configure it in
                        Settings.
                      </p>
                      <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                          OpenAI Voice
                        </label>
                        <select
                          value={settings().openaiVoice}
                          onChange={(e) =>
                            handleOpenAIVoiceChange(e.currentTarget.value)
                          }
                          class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm"
                        >
                          {settings().openaiVoices.map((voice) => (
                            <option value={voice}>
                              {voice.charAt(0).toUpperCase() + voice.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Show>

                  <Show when={settings().provider === "web"}>
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">
                        Voice
                      </label>
                      <select
                        value={settings().currentVoice?.name || ""}
                        onChange={(e) =>
                          handleVoiceChange(e.currentTarget.value)
                        }
                        class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm"
                      >
                        <option value="">Default</option>
                        {settings().availableVoices.map((voice) => (
                          <option value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">
                        Rate: {settings().rate.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings().rate}
                        onInput={(e) =>
                          handleRateChange(parseFloat(e.currentTarget.value))
                        }
                        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">
                        Pitch: {settings().pitch.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings().pitch}
                        onInput={(e) =>
                          handlePitchChange(parseFloat(e.currentTarget.value))
                        }
                        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </Show>

                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Volume: {Math.round(settings().volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings().volume}
                      onInput={(e) =>
                        handleVolumeChange(parseFloat(e.currentTarget.value))
                      }
                      class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={testVoice}
                    class="w-full px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Test Voice
                  </button>
                </Show>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}
