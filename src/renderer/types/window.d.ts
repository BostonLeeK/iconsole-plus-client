import type { ElectronAPI } from "../../types/bluetooth";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    windowAPI: {
      minimize(): Promise<void>;
      maximize(): Promise<void>;
      close(): Promise<void>;
      isMaximized(): Promise<boolean>;
    };
  }
}
