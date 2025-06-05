import { render } from "solid-js/web";
import "../styles.css";
import App from "./App";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("app");
  if (root) {
    render(() => <App />, root);
  }
});
