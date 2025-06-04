import { appState } from "../../store/app";

const DataCard = ({
  icon,
  title,
  value,
  unit,
  color,
  bgColor,
}: {
  icon: string;
  title: string;
  value: string | number;
  unit?: string;
  color: string;
  bgColor: string;
}) => (
  <div class="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gray-600">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div
          class={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center mb-4`}
        >
          <div class={`text-2xl ${color}`} innerHTML={icon}></div>
        </div>
        <h3 class="text-sm font-medium text-gray-400 mb-1">{title}</h3>
        <div class="flex items-baseline gap-1">
          <span class={`text-3xl font-bold ${color}`}>{value}</span>
          {unit && (
            <span class="text-sm text-gray-500 font-medium">{unit}</span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export function WorkoutData() {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getDataCards = () => [
    {
      icon: "❤️",
      title: "Heart Rate",
      value: appState.workoutData.heartRate || 0,
      unit: "bpm",
      color: "text-red-400",
      bgColor: "bg-red-900/30",
    },
    {
      icon: "⚡",
      title: "Power",
      value: appState.workoutData.watt || 0,
      unit: "W",
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/30",
    },
    {
      icon: "🏃",
      title: "Speed",
      value: (appState.workoutData.speed || 0).toFixed(1),
      unit: "km/h",
      color: "text-blue-400",
      bgColor: "bg-blue-900/30",
    },
    {
      icon: "🔄",
      title: "Cadence",
      value: appState.workoutData.rpm || 0,
      unit: "rpm",
      color: "text-purple-400",
      bgColor: "bg-purple-900/30",
    },
    {
      icon: "🎯",
      title: "Resistance",
      value: appState.workoutData.resistance || 0,
      unit: "level",
      color: "text-orange-400",
      bgColor: "bg-orange-900/30",
    },
    {
      icon: "📏",
      title: "Distance",
      value: (appState.workoutData.distance || 0).toFixed(2),
      unit: "km",
      color: "text-green-400",
      bgColor: "bg-green-900/30",
    },
    {
      icon: "🔥",
      title: "Calories",
      value: appState.workoutData.calories || 0,
      unit: "kcal",
      color: "text-pink-400",
      bgColor: "bg-pink-900/30",
    },
    {
      icon: "⏱️",
      title: "Duration",
      value: formatTime(appState.workoutData.time || 0),
      color: "text-indigo-400",
      bgColor: "bg-indigo-900/30",
    },
  ];

  return (
    <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
      <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-white">Live Workout Data</h2>
        </div>
      </div>

      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {getDataCards().map((card) => (
            <DataCard
              icon={card.icon}
              title={card.title}
              value={card.value}
              unit={card.unit}
              color={card.color}
              bgColor={card.bgColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
