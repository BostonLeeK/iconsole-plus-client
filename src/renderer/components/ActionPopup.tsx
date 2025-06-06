import { createEffect, createSignal, Show } from "solid-js";

interface ActionPopupProps {
  action: string;
  isVisible: boolean;
  onClose: () => void;
}

export function ActionPopup(props: ActionPopupProps) {
  const [animationClass, setAnimationClass] = createSignal("");

  createEffect(() => {
    if (props.isVisible) {
      setAnimationClass("animate-bounce-in");

      setTimeout(() => {
        setAnimationClass("animate-pulse");
      }, 500);

      setTimeout(() => {
        setAnimationClass("animate-fade-out");
        setTimeout(() => {
          props.onClose();
        }, 300);
      }, 2200);
    }
  });

  return (
    <Show when={props.isVisible}>
      <div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div class="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>

        <div
          class={`relative bg-gradient-to-br from-blue-600 to-purple-700 text-white px-8 py-6 rounded-2xl shadow-2xl border-2 border-white/20 ${animationClass()}`}
          style={{
            "min-width": "200px",
            transform: "scale(1)",
          }}
        >
          <div class="text-center">
            <div class="text-3xl font-bold mb-2 drop-shadow-lg">
              {props.action}
            </div>
            <div class="text-sm opacity-90">AI Trainer</div>
          </div>

          <div class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
          <div class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full"></div>
        </div>
      </div>
    </Show>
  );
}

export function useActionPopup() {
  const [isVisible, setIsVisible] = createSignal(false);
  const [currentAction, setCurrentAction] = createSignal("");

  const showAction = (action: string) => {
    setCurrentAction(action);
    setIsVisible(true);
  };

  const closeAction = () => {
    setIsVisible(false);
    setCurrentAction("");
  };

  return {
    isVisible,
    currentAction,
    showAction,
    closeAction,
  };
}
