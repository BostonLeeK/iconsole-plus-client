import { createSignal, onMount } from "solid-js";
import { appActions } from "../../store/app.store";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = createSignal(false);

  onMount(async () => {
    try {
      const maximized = await window.windowAPI.isMaximized();
      setIsMaximized(maximized);
    } catch (error) {}
  });

  const handleMinimize = () => {
    window.windowAPI.minimize();
  };

  const handleMaximize = async () => {
    await window.windowAPI.maximize();
    const maximized = await window.windowAPI.isMaximized();
    setIsMaximized(maximized);
  };

  const handleClose = () => {
    window.windowAPI.close();
  };

  return (
    <div class="flex items-center justify-between bg-gray-800 border-b border-gray-700 h-8 select-none">
      <div
        class="flex-1 flex items-center pl-4"
        style={{ "-webkit-app-region": "drag" }}
      >
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm"></div>
          <span class="text-sm font-medium text-gray-300">
            iConsole+ Client
          </span>
        </div>
      </div>

      <div class="flex items-center">
        <button
          onClick={() => appActions.navigateToSettings()}
          class="h-8 px-3 hover:bg-gray-700 transition-colors flex items-center justify-center"
          style={{ "-webkit-app-region": "no-drag" }}
        >
          <svg
            class="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        <button
          onClick={handleMinimize}
          class="h-8 w-12 hover:bg-gray-700 transition-colors flex items-center justify-center"
          style={{ "-webkit-app-region": "no-drag" }}
        >
          <svg
            class="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 12H4"
            />
          </svg>
        </button>

        <button
          onClick={handleMaximize}
          class="h-8 w-12 hover:bg-gray-700 transition-colors flex items-center justify-center"
          style={{ "-webkit-app-region": "no-drag" }}
        >
          <svg
            class="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMaximized() ? (
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 3H5a2 2 0 00-2 2v3m2-5h10a2 2 0 012 2v1M8 21h8a2 2 0 002-2v-1a2 2 0 00-2-2H8a2 2 0 00-2 2v1a2 2 0 002 2z"
              />
            ) : (
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 8V4a2 2 0 012-2h2M4 16v4a2 2 0 002 2h2m8-20h2a2 2 0 012 2v2m0 8v4a2 2 0 01-2 2h-2"
              />
            )}
          </svg>
        </button>

        <button
          onClick={handleClose}
          class="h-8 w-12 hover:bg-red-600 transition-colors flex items-center justify-center"
          style={{ "-webkit-app-region": "no-drag" }}
        >
          <svg
            class="w-4 h-4 text-gray-400 hover:text-white"
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
    </div>
  );
}
