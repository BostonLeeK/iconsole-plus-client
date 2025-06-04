import { render } from "solid-js/web";
import "../styles.css";
import { BluetoothScreen } from "./screens/BluetoothScreen";
import { BluetoothService } from "./services/bluetoothService";

function App() {
  return <BluetoothScreen />;
}

document.addEventListener("DOMContentLoaded", () => {
  const bluetoothService = BluetoothService.getInstance();

  const root = document.getElementById("app");
  if (root) {
    render(() => <App />, root);
  }
});
