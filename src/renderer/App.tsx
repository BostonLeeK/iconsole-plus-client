import { onMount, Show } from "solid-js";
import { Dashboard } from "./modules/Dashboard/Dashboard";
import { Settings } from "./modules/Settings/Settings";
import { TitleBar } from "./modules/TitleBar/TitleBar";
import { BluetoothService } from "./services/bluetoothService";
import { appActions, appState } from "./store/app.store";

function App() {
  onMount(() => {
    const bluetoothService = BluetoothService.getInstance();

    window.electronAPI.bluetoothService
      .checkConnectionStatus()
      .then((status) => {
        appActions.setIsConnected(status.isConnected);
        if (status.device) {
          appActions.addDevice(status.device);
          appActions.setSelectedDeviceId(status.device.id);
        }
      });
  });

  return (
    <div class="h-screen flex flex-col bg-gray-900">
      <TitleBar />
      <div class="flex-1 overflow-hidden">
        <Show
          when={appState().currentScreen === "dashboard"}
          fallback={<Settings />}
        >
          <Dashboard />
        </Show>
      </div>
    </div>
  );
}

export default App;
