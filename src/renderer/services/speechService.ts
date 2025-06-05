export type TTSProvider = "web" | "openai";

class SpeechService {
  private synthesis: SpeechSynthesis;
  private isEnabled: boolean = false;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private volume: number = 1.0;
  private provider: TTSProvider = "web";
  private openaiVoice: string = "nova";
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const settings = localStorage.getItem("speechSettings");
      if (settings) {
        const parsed = JSON.parse(settings);
        this.isEnabled = parsed.enabled || false;
        this.rate = parsed.rate || 1.0;
        this.pitch = parsed.pitch || 1.0;
        this.volume = parsed.volume || 1.0;
        this.provider = parsed.provider || "web";
        this.openaiVoice = parsed.openaiVoice || "nova";

        if (parsed.voiceName) {
          this.setVoiceByName(parsed.voiceName);
        }
      }
    } catch (error) {
      console.error("Failed to load speech settings:", error);
    }
  }

  private saveSettings() {
    try {
      const settings = {
        enabled: this.isEnabled,
        rate: this.rate,
        pitch: this.pitch,
        volume: this.volume,
        voiceName: this.currentVoice?.name || null,
        provider: this.provider,
        openaiVoice: this.openaiVoice,
      };
      localStorage.setItem("speechSettings", JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save speech settings:", error);
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis
      .getVoices()
      .filter(
        (voice) => voice.lang.startsWith("en") || voice.lang.startsWith("uk")
      );
  }

  setVoiceByName(voiceName: string) {
    if (!voiceName) {
      this.currentVoice = null;
      this.saveSettings();
      return;
    }

    const voices = this.getAvailableVoices();
    const voice = voices.find((v) => v.name === voiceName);
    if (voice) {
      this.currentVoice = voice;
      this.saveSettings();
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.saveSettings();
  }

  setRate(rate: number) {
    this.rate = Math.max(0.1, Math.min(10, rate));
    this.saveSettings();
  }

  setPitch(pitch: number) {
    this.pitch = Math.max(0, Math.min(2, pitch));
    this.saveSettings();
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  setProvider(provider: TTSProvider) {
    this.provider = provider;
    this.saveSettings();
  }

  setOpenAIVoice(voice: string) {
    this.openaiVoice = voice;
    this.saveSettings();
  }

  getProvider(): TTSProvider {
    return this.provider;
  }

  getOpenAIVoice(): string {
    return this.openaiVoice;
  }

  getOpenAIVoices(): string[] {
    return ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
  }

  async speak(text: string, interrupt: boolean = false): Promise<void> {
    if (!this.isEnabled) {
      return Promise.resolve();
    }

    if (!text.trim()) {
      return Promise.resolve();
    }

    if (interrupt) {
      this.stop();
    }

    if (this.provider === "openai") {
      return this.speakWithOpenAI(text);
    } else {
      return this.speakWithWebAPI(text);
    }
  }

  private speakWithWebAPI(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      if (this.currentVoice) {
        utterance.voice = this.currentVoice;
      } else {
        const defaultVoice = this.getAvailableVoices().find(
          (voice) => voice.default || voice.lang.startsWith("en")
        );
        if (defaultVoice) {
          utterance.voice = defaultVoice;
        }
      }

      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.volume = this.volume;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      this.synthesis.speak(utterance);
    });
  }

  private async speakWithOpenAI(text: string): Promise<void> {
    try {
      const apiKey = await window.electronAPI.settings.getOpenAIApiKey();
      if (!apiKey) {
        throw new Error("OpenAI API key not configured");
      }

      // Track TTS cost
      const { aiActions } = await import("../store/ai.store");
      await aiActions.updateTTSStats(text.length);

      const audioBuffer = await window.electronAPI.ttsService.speak(
        text,
        apiKey
      );

      const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(blob);

      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }

      return new Promise((resolve, reject) => {
        this.currentAudio = new Audio(audioUrl);
        this.currentAudio.volume = this.volume;

        this.currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        this.currentAudio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error("Audio playback failed"));
        };

        this.currentAudio.play().catch(reject);
      });
    } catch (error) {
      console.error("OpenAI TTS error:", error);
      throw error;
    }
  }

  stop() {
    this.synthesis.cancel();
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
  }

  pause() {
    this.synthesis.pause();
  }

  resume() {
    this.synthesis.resume();
  }

  isSpeaking(): boolean {
    if (this.provider === "openai") {
      return this.currentAudio
        ? !this.currentAudio.paused && !this.currentAudio.ended
        : false;
    }
    return this.synthesis.speaking;
  }

  isSupported(): boolean {
    return "speechSynthesis" in window;
  }

  getSettings() {
    return {
      enabled: this.isEnabled,
      rate: this.rate,
      pitch: this.pitch,
      volume: this.volume,
      currentVoice: this.currentVoice,
      availableVoices: this.getAvailableVoices(),
      isSupported: this.isSupported(),
      provider: this.provider,
      openaiVoice: this.openaiVoice,
      openaiVoices: this.getOpenAIVoices(),
    };
  }
}

export const speechService = new SpeechService();

export default speechService;
