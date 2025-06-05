import { onMount } from "solid-js";
import { BluetoothService } from "../../services/bluetoothService";
import { appState } from "../../store/app";
import { BikeAnimation } from "../BikeAnimation/BikeAnimation";
import { DeviceControl } from "../DeviceControl/DeviceControl";
import { DeviceList } from "../DeviceList/DeviceList";
import { RawData } from "../RawData/RawData";
import { SessionRecorder } from "../SessionRecorder/SessionRecorder";
import { WorkoutData } from "../WorkoutData/WorkoutData";

export function Dashboard() {
  onMount(async () => {
    const bluetoothService = BluetoothService.getInstance();

    await bluetoothService.checkConnectionStatus();

    if (!appState.isConnected) {
      try {
        await bluetoothService.startScanning();
      } catch (error) {}
    }
  });

  return (
    <div class="h-full overflow-y-auto bg-gradient-to-br from-gray-900 to-slate-800">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <header class="mb-8 text-center">
          <div class="flex items-center justify-center gap-3 mb-4">
            <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                class="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
            </div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              iConsole+
            </h1>
          </div>
          <p class="text-gray-300 text-lg">
            Professional Fitness Equipment Monitor
          </p>

          <div
            class={`mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              appState.status.type === "success"
                ? "bg-green-900/50 text-green-300 border border-green-700"
                : appState.status.type === "error"
                ? "bg-red-900/50 text-red-300 border border-red-700"
                : "bg-blue-900/50 text-blue-300 border border-blue-700"
            }`}
          >
            <div
              class={`w-2 h-2 rounded-full mr-2 ${
                appState.status.type === "success"
                  ? "bg-green-400"
                  : appState.status.type === "error"
                  ? "bg-red-400"
                  : "bg-blue-400"
              }`}
            ></div>
            {appState.status.message}
          </div>
        </header>

        <main class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-4">
            <div class="space-y-6">
              <DeviceControl />
              <DeviceList />
              <BikeAnimation />
            </div>
          </div>

          <div class="lg:col-span-8">
            <div class="space-y-6">
              <WorkoutData />
              <SessionRecorder />
              <RawData />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
