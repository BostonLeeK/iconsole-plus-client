import { createEffect, createSignal } from "solid-js";
import { BluetoothService } from "../../services/bluetoothService";
import { appState } from "../../store/app";

export function DeviceControl() {
  const bluetoothService = BluetoothService.getInstance();

  const [connectionStatus, setConnectionStatus] = createSignal({
    status: "Ready to scan",
    device: "",
    color: "text-gray-300",
    bgColor: "bg-gray-800 border-gray-600",
    icon: "📡",
  });

  createEffect(() => {
    const state = appState;

    if (state.isConnected) {
      const connectedDevice = state.devices.find(
        (d) => d.id === state.selectedDeviceId
      );
      setConnectionStatus({
        status: "Connected",
        device: connectedDevice?.name || "Unknown Device",
        color: "text-green-300",
        bgColor: "bg-green-900/30 border-green-700",
        icon: "✅",
      });
    } else if (state.isScanning) {
      setConnectionStatus({
        status: "Scanning for devices...",
        device: "",
        color: "text-blue-300",
        bgColor: "bg-blue-900/30 border-blue-700",
        icon: "🔍",
      });
    } else {
      setConnectionStatus({
        status: "Ready to scan",
        device: "",
        color: "text-gray-300",
        bgColor: "bg-gray-800 border-gray-600",
        icon: "📡",
      });
    }
  });

  const handleDisconnect = () => {
    bluetoothService.disconnectDevice();
  };

  return (
    <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span class="text-lg">{connectionStatus().icon}</span>
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold text-white">Connection Status</h2>
            <p class="text-indigo-100 text-sm">iConsole+ Bluetooth Monitor</p>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div class={`${connectionStatus().bgColor} border rounded-xl p-4 mb-4`}>
          <div class="flex items-center gap-3">
            <div
              class={`w-3 h-3 rounded-full ${
                appState.isConnected
                  ? "bg-green-400"
                  : appState.isScanning
                  ? "bg-blue-400 animate-pulse"
                  : "bg-gray-500"
              }`}
            ></div>
            <div class="flex-1">
              <h3 class={`font-bold ${connectionStatus().color}`}>
                {connectionStatus().status}
              </h3>
              {connectionStatus().device && (
                <p class="text-sm text-gray-400 mt-1">
                  Device: {connectionStatus().device}
                </p>
              )}
            </div>
          </div>
        </div>

        {appState.isConnected && (
          <button
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            onClick={handleDisconnect}
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
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
              />
            </svg>
            Disconnect Device
          </button>
        )}

        {!appState.isConnected &&
          !appState.isScanning &&
          appState.devices.length === 0 && (
            <div class="text-center py-4">
              <p class="text-gray-400 text-sm">
                Click on a device below to connect
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
