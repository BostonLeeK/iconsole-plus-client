import { For } from "solid-js";

interface IconSelectorProps<T> {
  items: T[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  title: string;
  getItemId: (item: T) => string;
  getItemName: (item: T) => string;
  getItemIcon: (item: T) => string;
  getItemDescription: (item: T) => string;
}

export function IconSelector<T>(props: IconSelectorProps<T>) {
  return (
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-3">
        {props.title}
      </label>
      <div class="grid grid-cols-4 gap-2">
        <For each={props.items}>
          {(item) => {
            const itemId = props.getItemId(item);
            const isSelected = () => itemId === props.selectedId;
            return (
              <button
                onClick={() => props.onSelect(props.getItemId(item))}
                disabled={props.disabled}
                title={`${props.getItemName(item)} - ${props.getItemDescription(
                  item
                )}`}
                class={`
                  relative p-3 rounded-lg border-2 transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:scale-105 active:scale-95
                  ${
                    isSelected()
                      ? "border-purple-400 bg-purple-600/80 shadow-lg shadow-purple-400/30 ring-2 ring-purple-300/50"
                      : "border-gray-600 bg-gray-700/80 hover:border-gray-400 hover:bg-gray-600/80"
                  }
                `}
              >
                <div class="text-center">
                  <div class="text-2xl mb-1 filter drop-shadow-sm">
                    {props.getItemIcon(item)}
                  </div>
                  <div
                    class={`text-xs font-medium ${
                      isSelected()
                        ? "text-white font-semibold"
                        : "text-gray-300"
                    }`}
                  >
                    {props.getItemName(item)}
                  </div>
                </div>
                {isSelected() && (
                  <div class="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full border-2 border-gray-800 shadow-lg">
                    <svg
                      class="w-2.5 h-2.5 text-white absolute top-0.5 left-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
}
