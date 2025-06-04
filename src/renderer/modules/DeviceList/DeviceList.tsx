import { For, onMount } from "solid-js";
import { BluetoothService } from "../../services/bluetoothService";
import { appState } from "../../store/app";

export function DeviceList() {
  const bluetoothService = BluetoothService.getInstance();

  onMount(() => {
    if (
      !appState.isConnected &&
      !appState.isScanning &&
      appState.devices.length === 0
    ) {
      bluetoothService.startScanning();
    }
  });

  const handleDeviceClick = (deviceId: string) => {
    if (!appState.isConnected) {
      bluetoothService.connectToDevice(deviceId);
    }
  };

  const getSignalStrength = (rssi: number) => {
    if (rssi >= -50)
      return { strength: "Excellent", color: "text-green-400", bars: 4 };
    if (rssi >= -60)
      return { strength: "Good", color: "text-blue-400", bars: 3 };
    if (rssi >= -70)
      return { strength: "Fair", color: "text-yellow-400", bars: 2 };
    return { strength: "Weak", color: "text-red-400", bars: 1 };
  };

  const SignalBars = ({ bars, color }: { bars: number; color: string }) => (
    <div class="flex items-end gap-0.5">
      {[1, 2, 3, 4].map((bar) => (
        <div
          class={`w-1 bg-gray-600 rounded-sm ${
            bar <= bars ? color.replace("text-", "bg-") : ""
          }`}
          style={{ height: `${bar * 3 + 2}px` }}
        />
      ))}
    </div>
  );

  return (
    <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
      <div class="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
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
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold text-white">Available Devices</h2>
            <p class="text-blue-100 text-sm">
              {appState.isScanning ? "🔍 Scanning..." : ""}{" "}
              {appState.devices.length} device(s) found
            </p>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div class="space-y-3 max-h-80 overflow-y-auto">
          <For each={appState.devices}>
            {(device) => {
              const signal = getSignalStrength(device.rssi);
              const isConnected =
                appState.isConnected && appState.selectedDeviceId === device.id;

              return (
                <div
                  class={`rounded-xl p-4 border transition-all duration-200 cursor-pointer ${
                    isConnected
                      ? "bg-green-900/30 border-green-600 ring-2 ring-green-500/50"
                      : appState.isConnected
                      ? "bg-gray-700 border-gray-600 cursor-not-allowed opacity-50"
                      : "bg-gray-700 border-gray-600 hover:bg-blue-900/30 hover:border-blue-500 hover:shadow-md transform hover:-translate-y-0.5"
                  }`}
                  onClick={() => handleDeviceClick(device.id)}
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        {isConnected ? (
                          <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                        ) : (
                          <div class="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                        )}
                        <h3 class="font-bold text-gray-100 text-lg flex items-center gap-2">
                          {device.name}
                          {isConnected && (
                            <span class="text-sm bg-green-500 text-white px-2 py-0.5 rounded-full">
                              Connected
                            </span>
                          )}
                        </h3>
                      </div>
                      <div class="space-y-1 text-sm">
                        <div class="flex items-center gap-2">
                          <span class="text-gray-400">Address:</span>
                          <span class="font-mono bg-gray-600 px-2 py-0.5 rounded text-gray-200">
                            {device.address}
                          </span>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="text-gray-400">Signal:</span>
                          <span class={`font-medium ${signal.color}`}>
                            {signal.strength}
                          </span>
                          <span class="text-gray-500">({device.rssi} dBm)</span>
                        </div>
                        {device.serviceUuids &&
                          device.serviceUuids.length > 0 && (
                            <div class="flex items-center gap-2">
                              <span class="text-gray-400">Services:</span>
                              <div class="flex gap-1">
                                <For each={device.serviceUuids.slice(0, 3)}>
                                  {(uuid) => (
                                    <span class="bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded text-xs font-mono border border-blue-700">
                                      {uuid}
                                    </span>
                                  )}
                                </For>
                                {device.serviceUuids.length > 3 && (
                                  <span class="text-gray-500 text-xs">
                                    +{device.serviceUuids.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                      <SignalBars bars={signal.bars} color={signal.color} />
                      {device.connectable &&
                        !isConnected &&
                        !appState.isConnected && (
                          <div class="text-center">
                            <span class="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-md text-xs font-medium border border-blue-700">
                              Click to Connect
                            </span>
                          </div>
                        )}
                      {device.connectable && (
                        <span class="bg-green-900/50 text-green-300 px-2 py-1 rounded-md text-xs font-medium border border-green-700">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
          {appState.devices.length === 0 && (
            <div class="text-center py-12">
              <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                {appState.isScanning ? (
                  <svg
                    class="w-8 h-8 text-blue-400 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                ) : (
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </div>
              <h3 class="text-lg font-medium text-gray-200 mb-2">
                {appState.isScanning
                  ? "Searching for devices..."
                  : "No devices found"}
              </h3>
              <p class="text-gray-400">
                {appState.isScanning
                  ? "Please wait while we scan for nearby Bluetooth devices"
                  : "Make sure your Bluetooth device is discoverable"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
