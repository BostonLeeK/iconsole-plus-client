import { createSignal, onMount } from "solid-js";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = createSignal(false);

  onMount(async () => {
    const maximized = await window.electronAPI.windowControls.isMaximized();
    setIsMaximized(maximized);
  });

  const handleMinimize = () => {
    window.electronAPI.windowControls.minimize();
  };

  const handleMaximize = async () => {
    await window.electronAPI.windowControls.maximize();
    const maximized = await window.electronAPI.windowControls.isMaximized();
    setIsMaximized(maximized);
  };

  const handleClose = () => {
    window.electronAPI.windowControls.close();
  };

  return (
    <div class="flex fixed top-0 left-0 right-0 items-center justify-between bg-gray-900 border-b border-gray-700 h-8 select-none z-50">
      <div
        class="flex-1 flex items-center px-4 h-full cursor-move"
        style={{ "-webkit-app-region": "drag" }}
      >
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
            <svg
              class="w-2.5 h-2.5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-xs font-medium text-gray-300">iConsole+</span>
        </div>
      </div>

      <div
        class="flex items-center h-full"
        style={{ "-webkit-app-region": "no-drag" }}
      >
        <button
          onClick={handleMinimize}
          class="flex items-center justify-center w-12 h-full hover:bg-gray-700 transition-colors"
          title="Minimize"
        >
          <svg
            class="w-3 h-3 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 13H5v-2h14v2z" />
          </svg>
        </button>

        <button
          onClick={handleMaximize}
          class="flex items-center justify-center w-12 h-full hover:bg-gray-700 transition-colors"
          title={isMaximized() ? "Restore" : "Maximize"}
        >
          <svg
            class="w-3 h-3 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            {isMaximized() ? (
              <path d="M18 7h-4V3H5v11h4v4h9V7zM7 12V5h5v2H9v5H7zm9 4h-5V9h5v7z" />
            ) : (
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
            )}
          </svg>
        </button>

        <button
          onClick={handleClose}
          class="flex items-center justify-center w-12 h-full hover:bg-red-600 transition-colors"
          title="Close"
        >
          <svg
            class="w-3 h-3 text-gray-400 hover:text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
