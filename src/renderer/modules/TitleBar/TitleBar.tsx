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
          onClick={() => appActions.navigateToDashboard()}
          class="h-8 px-3 hover:bg-gray-700 transition-colors flex items-center justify-center"
          style={{ "-webkit-app-region": "no-drag" }}
          title="Dashboard"
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
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
        <button
          onClick={() => appActions.navigateToPlanner()}
          class="h-8 px-3 hover:bg-gray-700 transition-colors flex items-center justify-center"
          style={{ "-webkit-app-region": "no-drag" }}
          title="Workout Planner"
        >
          <svg
            class="w-4 h-4 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
          </svg>
        </button>

        <button
          onClick={() => appActions.navigateToWorkoutHistory()}
          class="h-8 px-3 hover:bg-gray-700 transition-colors flex items-center justify-center"
          style={{ "-webkit-app-region": "no-drag" }}
          title="Workout History"
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </button>

        <button
          onClick={() => appActions.navigateToSettings()}
          class="h-8 px-3 hover:bg-gray-700 transition-colors flex items-center justify-center"
          style={{ "-webkit-app-region": "no-drag" }}
          title="Settings"
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
              <>
                <rect
                  x="3"
                  y="3"
                  width="10"
                  height="10"
                  rx="1"
                  stroke-width="2"
                />
                <rect
                  x="11"
                  y="11"
                  width="10"
                  height="10"
                  rx="1"
                  stroke-width="2"
                />
              </>
            ) : (
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="1"
                stroke-width="2"
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
