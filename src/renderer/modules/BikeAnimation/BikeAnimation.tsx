import lottie, { AnimationItem } from "lottie-web";
import { createEffect, createMemo, onCleanup } from "solid-js";
import { appState } from "../../store/app";
import cyclingAnimation from "./cycling-animation.json";

export function BikeAnimation() {
  let lottieContainer: HTMLDivElement | undefined;
  let animationInstance: AnimationItem | null = null;

  const animationState = createMemo(() => {
    if (!appState.isConnected) return "garage";
    if (appState.workoutData.speed > 0) return "pedaling";
    return "connected";
  });

  const animationSpeed = createMemo(() => {
    const speed = appState.workoutData.speed;
    return Math.max(0.3, Math.min(3.0, speed / 15));
  });

  const currentPower = createMemo(() => appState.workoutData.watt || 0);
  const currentRPM = createMemo(() => appState.workoutData.rpm || 0);

  const initializeAnimation = () => {
    if (!lottieContainer || animationInstance) return;

    try {
      lottieContainer.innerHTML = "";

      animationInstance = lottie.loadAnimation({
        container: lottieContainer,
        renderer: "svg",
        loop: true,
        autoplay: false,
        animationData: cyclingAnimation,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
        },
      });

    } catch (error) {
      console.error("Error creating lottie animation:", error);
    }
  };

  createEffect(() => {
    if (animationState() === "garage") {
      if (animationInstance) {
        animationInstance.destroy();
        animationInstance = null;
      }
      return;
    }

    if (lottieContainer && !animationInstance) {

      setTimeout(initializeAnimation, 100);
    }

    if (animationInstance) {
      if (animationState() === "pedaling" && appState.workoutData.speed > 0) {
        animationInstance.setSpeed(animationSpeed());
        animationInstance.play();
      } else {
        animationInstance.pause();
        animationInstance.goToAndStop(0, true);
      }
    }
  });

  onCleanup(() => {
    if (animationInstance) {
      animationInstance.destroy();
      animationInstance = null;
    }
  });

  return (
    <div class="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 rounded-xl shadow-lg border border-gray-600 overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">Exercise Bike</h2>
            <p class="text-blue-200 text-xs font-medium">
              {animationState() === "garage" && "🔍 Searching for bike..."}
              {animationState() === "connected" && "✅ Connected & Ready"}
              {animationState() === "pedaling" &&
                `🚴‍♂️ Riding at ${appState.workoutData.speed.toFixed(1)} km/h`}
            </p>
          </div>
        </div>
      </div>

      <div class="p-4">
        <div class="flex justify-center items-center h-64 relative bg-gradient-to-b from-slate-800 via-slate-900 to-gray-900 rounded-xl border border-gray-700 shadow-inner">
          {animationState() === "garage" && (
            <div class="flex flex-col items-center justify-center space-y-4 text-gray-400">
              <div class="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
              <p class="text-sm font-medium">🔍 Waiting for bike...</p>
            </div>
          )}

          {(animationState() === "connected" ||
            animationState() === "pedaling") && (
            <div class="relative w-full h-full flex items-center justify-center">
              <div
                ref={lottieContainer}
                class="w-72 h-48 flex items-center justify-center"
                style={{ "min-width": "288px", "min-height": "192px" }}
              />

              {animationState() === "connected" && (
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-600">
                    <div class="text-xs text-gray-300 text-center mt-1">
                      Start pedaling to begin
                    </div>
                  </div>
                </div>
              )}

              {animationState() === "pedaling" && (
                <div class="absolute right-4 top-4 space-y-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      class="w-8 h-0.5 bg-gradient-to-r from-green-400 to-transparent rounded-full animate-pulse"
                      style={{
                        "animation-delay": `${i * 0.1}s`,
                        "animation-duration": `${0.8 + i * 0.1}s`,
                        opacity: Math.min(0.8, currentPower() / 100),
                      }}
                    />
                  ))}
                </div>
              )}

              {animationState() === "pedaling" && (
                <div class="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-600">
                  <div class="text-xs font-bold text-green-400">
                    ⚡ {currentPower()}W
                  </div>
                  <div class="text-xs font-bold text-blue-400">
                    🔄 {currentRPM()} RPM
                  </div>
                </div>
              )}
            </div>
          )}

          <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div
              class={`px-4 py-2 rounded-full text-xs font-bold border-2 ${
                animationState() === "garage"
                  ? "bg-gray-800 text-gray-400 border-gray-600"
                  : animationState() === "connected"
                  ? "bg-green-800 text-green-300 border-green-500"
                  : "bg-blue-800 text-blue-300 border-blue-500 animate-pulse"
              }`}
            >
              {animationState() === "garage" && "🏠 Disconnected"}
              {animationState() === "connected" && "✅ Ready to Ride"}
              {animationState() === "pedaling" &&
                `🚀 ${appState.workoutData.speed.toFixed(1)} km/h`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
