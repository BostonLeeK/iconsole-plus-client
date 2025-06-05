import { createResource, createSignal, For, Show } from "solid-js";
import { appActions } from "../../store/app.store";

interface WorkoutSession {
  filename?: string;
  startTime: string;
  endTime: string;
  duration: number;
  data: Array<{
    speed: number;
    heartRate: number;
    rpm: number;
    resistance: number;
    distance: number;
    calories: number;
    watt: number;
    time: number;
    timestamp: number;
  }>;
  summary: {
    maxSpeed: number;
    avgSpeed: number;
    maxPower: number;
    avgPower: number;
    totalDistance: number;
    totalCalories: number;
    maxHeartRate: number;
    avgHeartRate: number;
  };
  aiAnalysis?: {
    timestamp: string;
    analysis: string;
    recommendations: string[];
    performance_score: number;
    zones_analysis: {
      heart_rate_zones: string;
      power_zones: string;
      endurance_assessment: string;
    };
  };
}

export function WorkoutHistory() {
  const [selectedSession, setSelectedSession] =
    createSignal<WorkoutSession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = createSignal(false);

  const [sessions, { refetch: refetchSessions }] = createResource(async () => {
    try {
      const files = await window.electronAPI.settings.getWorkoutSessions();
      return files;
    } catch (error) {
      console.error("Failed to load workout sessions:", error);
      return [];
    }
  });

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const loadSessionData = async (filename: string) => {
    try {
      const sessionData =
        await window.electronAPI.settings.getWorkoutSessionData(filename);
      sessionData.filename = filename;
      setSelectedSession(sessionData);
    } catch (error) {
      console.error("Failed to load session data:", error);
    }
  };

  const analyzeWithAI = async () => {
    const session = selectedSession();
    if (!session || isAnalyzing()) return;

    try {
      setIsAnalyzing(true);

      const apiKey = await window.electronAPI.settings.getClaudeApiKey();
      if (!apiKey) {
        alert("Claude API key not configured. Please add it in settings.");
        return;
      }

      const analysis = await window.electronAPI.aiService.analyzeWorkoutSession(
        session,
        apiKey
      );

      const updatedSession = {
        ...session,
        aiAnalysis: {
          timestamp: new Date().toISOString(),
          analysis: analysis.analysis,
          recommendations: analysis.recommendations,
          performance_score: analysis.performance_score,
          zones_analysis: analysis.zones_analysis,
        },
      };

      const { filename, ...sessionToSave } = updatedSession;

      await window.electronAPI.settings.saveWorkoutSessionAnalysis(
        sessionToSave,
        filename
      );
      setSelectedSession(updatedSession);
      refetchSessions();
    } catch (error) {
      console.error("Failed to analyze workout:", error);
      alert("Failed to analyze workout: " + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteSession = async (filename: string, sessionDate: string) => {
    const confirmed = confirm(
      `Are you sure you want to delete this workout session?\n\nDate: ${sessionDate}\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await window.electronAPI.settings.deleteWorkoutSession(filename);

      if (selectedSession()?.filename === filename) {
        setSelectedSession(null);
      }

      refetchSessions();
    } catch (error) {
      console.error("Failed to delete session:", error);
      alert("Failed to delete session: " + error.message);
    }
  };

  const deleteAllSessions = async () => {
    const sessionCount = sessions()?.length || 0;
    if (sessionCount === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ALL ${sessionCount} workout sessions?\n\nThis action cannot be undone and will permanently remove all your workout history.`
    );

    if (!confirmed) return;

    try {
      const sessionFiles = sessions() || [];

      for (const session of sessionFiles) {
        await window.electronAPI.settings.deleteWorkoutSession(
          session.filename
        );
      }

      setSelectedSession(null);
      refetchSessions();
    } catch (error) {
      console.error("Failed to delete all sessions:", error);
      alert("Failed to delete all sessions: " + error.message);
    }
  };

  const renderChart = (session: WorkoutSession) => {
    const maxHeartRate = Math.max(...session.data.map((d) => d.heartRate));
    const maxSpeed = Math.max(...session.data.map((d) => d.speed));
    const maxPower = Math.max(...session.data.map((d) => d.watt));
    const maxResistance = Math.max(...session.data.map((d) => d.resistance));
    const maxRPM = Math.max(...session.data.map((d) => d.rpm));

    const dataPoints = session.data.filter(
      (_, i) => i % Math.ceil(session.data.length / 100) === 0
    );

    return (
      <div class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-gray-800 p-4 rounded-lg">
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-white font-medium">Heart Rate Zones</h4>
              <span class="text-xs text-gray-400">bpm</span>
            </div>
            <div class="h-48 relative">
              <div class="absolute inset-0 flex items-end gap-px">
                <For each={dataPoints}>
                  {(point, index) => {
                    const height =
                      maxHeartRate > 0
                        ? (point.heartRate / maxHeartRate) * 100
                        : 0;
                    const zone =
                      point.heartRate < 100
                        ? "bg-blue-500"
                        : point.heartRate < 130
                        ? "bg-green-500"
                        : point.heartRate < 160
                        ? "bg-yellow-500"
                        : point.heartRate < 180
                        ? "bg-orange-500"
                        : "bg-red-500";
                    return (
                      <div
                        class={`${zone} flex-1 min-h-1 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity`}
                        style={{ height: `${height}%` }}
                        title={`${Math.floor(point.time / 60)}min: ${
                          point.heartRate
                        } bpm`}
                      />
                    );
                  }}
                </For>
              </div>
              <div class="absolute bottom-0 left-0 right-0 h-px bg-gray-600"></div>
              <div class="absolute top-0 left-0 text-xs text-gray-500">
                {maxHeartRate}
              </div>
              <div class="absolute bottom-2 left-0 text-xs text-gray-500">
                0
              </div>
            </div>
            <div class="flex justify-between items-center text-xs text-gray-400 mt-2">
              <span>Max: {session.summary.maxHeartRate} bpm</span>
              <span>Avg: {session.summary.avgHeartRate} bpm</span>
            </div>
            <div class="flex items-center gap-2 mt-2 text-xs">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-blue-500 rounded"></div>
                <span class="text-gray-400">Rest</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-green-500 rounded"></div>
                <span class="text-gray-400">Fat Burn</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-yellow-500 rounded"></div>
                <span class="text-gray-400">Cardio</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-orange-500 rounded"></div>
                <span class="text-gray-400">Peak</span>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 p-4 rounded-lg">
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-white font-medium">Power Output</h4>
              <span class="text-xs text-gray-400">watts</span>
            </div>
            <div class="h-48 relative">
              <div class="absolute inset-0 flex items-end gap-px">
                <For each={dataPoints}>
                  {(point) => {
                    const height =
                      maxPower > 0 ? (point.watt / maxPower) * 100 : 0;
                    return (
                      <div
                        class="bg-gradient-to-t from-yellow-600 to-yellow-400 flex-1 min-h-1 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${height}%` }}
                        title={`${Math.floor(point.time / 60)}min: ${
                          point.watt
                        }W`}
                      />
                    );
                  }}
                </For>
              </div>
              <div class="absolute bottom-0 left-0 right-0 h-px bg-gray-600"></div>
              <div class="absolute top-0 left-0 text-xs text-gray-500">
                {maxPower}W
              </div>
            </div>
            <div class="flex justify-between items-center text-xs text-gray-400 mt-2">
              <span>Max: {session.summary.maxPower}W</span>
              <span>Avg: {session.summary.avgPower}W</span>
            </div>
          </div>

          <div class="bg-gray-800 p-4 rounded-lg">
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-white font-medium">Speed & Cadence</h4>
              <span class="text-xs text-gray-400">km/h | rpm</span>
            </div>
            <div class="h-48 relative">
              <div class="absolute inset-0 flex items-end gap-px">
                <For each={dataPoints}>
                  {(point) => {
                    const speedHeight =
                      maxSpeed > 0 ? (point.speed / maxSpeed) * 100 : 0;
                    const rpmHeight =
                      maxRPM > 0 ? (point.rpm / maxRPM) * 80 : 0;
                    return (
                      <div class="flex-1 relative">
                        <div
                          class="bg-blue-500 w-full min-h-1 rounded-t-sm opacity-70"
                          style={{ height: `${speedHeight}%` }}
                          title={`${Math.floor(point.time / 60)}min: ${
                            point.speed
                          } km/h`}
                        />
                        <div
                          class="bg-cyan-400 w-full min-h-1 absolute bottom-0 opacity-60"
                          style={{ height: `${rpmHeight}%` }}
                          title={`${Math.floor(point.time / 60)}min: ${
                            point.rpm
                          } rpm`}
                        />
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
            <div class="flex justify-between items-center text-xs text-gray-400 mt-2">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-blue-500 rounded"></div>
                  <span>Speed</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-cyan-400 rounded"></div>
                  <span>RPM</span>
                </div>
              </div>
              <span>Max: {session.summary.maxSpeed} km/h</span>
            </div>
          </div>

          <div class="bg-gray-800 p-4 rounded-lg">
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-white font-medium">Resistance Profile</h4>
              <span class="text-xs text-gray-400">level</span>
            </div>
            <div class="h-48 relative">
              <div class="absolute inset-0 flex items-end gap-px">
                <For each={dataPoints}>
                  {(point, index) => {
                    const height =
                      maxResistance > 0
                        ? (point.resistance / maxResistance) * 100
                        : 10;
                    const prevPoint =
                      index() > 0 ? dataPoints[index() - 1] : point;
                    const isIncreasing =
                      point.resistance > prevPoint.resistance;
                    const isDecreasing =
                      point.resistance < prevPoint.resistance;
                    const color = isIncreasing
                      ? "bg-red-500"
                      : isDecreasing
                      ? "bg-green-500"
                      : "bg-purple-500";
                    return (
                      <div
                        class={`${color} flex-1 min-h-1 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity`}
                        style={{ height: `${height}%` }}
                        title={`${Math.floor(point.time / 60)}min: Level ${
                          point.resistance
                        }`}
                      />
                    );
                  }}
                </For>
              </div>
              <div class="absolute bottom-0 left-0 right-0 h-px bg-gray-600"></div>
              <div class="absolute top-0 left-0 text-xs text-gray-500">
                {maxResistance}
              </div>
            </div>
            <div class="flex justify-between items-center text-xs text-gray-400 mt-2">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-red-500 rounded"></div>
                  <span>Increase</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-green-500 rounded"></div>
                  <span>Decrease</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-purple-500 rounded"></div>
                  <span>Steady</span>
                </div>
              </div>
              <span>Max: Level {maxResistance}</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-800 p-4 rounded-lg">
          <h4 class="text-white font-medium mb-3">
            Training Intensity Overview
          </h4>
          <div class="h-32 relative bg-gray-900 rounded">
            <div class="absolute inset-0 flex items-end">
              <For each={dataPoints.slice(0, 60)}>
                {(point, index) => {
                  const hrIntensity =
                    maxHeartRate > 0 ? point.heartRate / maxHeartRate : 0;
                  const powerIntensity =
                    maxPower > 0 ? point.watt / maxPower : 0;
                  const combinedIntensity = (hrIntensity + powerIntensity) / 2;

                  const height = combinedIntensity * 100;
                  const time = Math.floor(point.time / 60);

                  const intensityColor =
                    combinedIntensity < 0.3
                      ? "bg-blue-500"
                      : combinedIntensity < 0.5
                      ? "bg-green-500"
                      : combinedIntensity < 0.7
                      ? "bg-yellow-500"
                      : combinedIntensity < 0.85
                      ? "bg-orange-500"
                      : "bg-red-500";

                  return (
                    <div class="flex-1 relative group">
                      <div
                        class={`${intensityColor} w-full min-h-1 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity`}
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${time}min: ${Math.round(
                          combinedIntensity * 100
                        )}% intensity`}
                      />
                      {index() % 10 === 0 && (
                        <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                          {time}m
                        </div>
                      )}
                    </div>
                  );
                }}
              </For>
            </div>
          </div>

          <div class="flex items-center justify-between mt-6">
            <div class="flex items-center gap-3 text-xs">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-blue-500 rounded"></div>
                <span class="text-gray-400">Light (0-30%)</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-green-500 rounded"></div>
                <span class="text-gray-400">Moderate (30-50%)</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-yellow-500 rounded"></div>
                <span class="text-gray-400">Vigorous (50-70%)</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-orange-500 rounded"></div>
                <span class="text-gray-400">Hard (70-85%)</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-red-500 rounded"></div>
                <span class="text-gray-400">Max (85%+)</span>
              </div>
            </div>

            <div class="text-xs text-gray-400">
              Intensity based on HR + Power zones
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div class="flex-1 p-6 overflow-auto h-screen pb-24">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-white">Workout History</h1>
          <button
            onClick={appActions.navigateToDashboard}
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1">
            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-white">Sessions</h2>
                <Show when={sessions()?.length > 0}>
                  <button
                    onClick={deleteAllSessions}
                    class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                    title="Delete all sessions"
                  >
                    Delete All
                  </button>
                </Show>
              </div>
              <Show
                when={!sessions.loading}
                fallback={
                  <div class="text-gray-400 text-center py-8">
                    Loading sessions...
                  </div>
                }
              >
                <Show
                  when={sessions()?.length > 0}
                  fallback={
                    <div class="text-gray-400 text-center py-8">
                      No workout sessions found
                    </div>
                  }
                >
                  <div class="space-y-2 max-h-96 overflow-y-auto">
                    <For each={sessions()}>
                      {(session) => (
                        <div class="relative group">
                          <button
                            onClick={() => loadSessionData(session.filename)}
                            class={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedSession()?.startTime === session.startTime
                                ? "bg-blue-900/50 border-blue-600"
                                : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                            }`}
                          >
                            <div class="text-white font-medium text-sm">
                              {formatDate(session.startTime)}
                            </div>
                            <div class="text-gray-400 text-xs mt-1">
                              Duration: {formatDuration(session.duration)}
                            </div>
                            <div class="text-gray-400 text-xs">
                              Calories: {session.summary?.totalCalories || 0} |
                              Distance:{" "}
                              {(session.summary?.totalDistance || 0).toFixed(1)}{" "}
                              km
                            </div>
                          </button>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </Show>
            </div>
          </div>

          <div class="lg:col-span-2">
            <Show
              when={selectedSession()}
              fallback={
                <div class="bg-gray-800 rounded-lg p-8 text-center">
                  <div class="text-gray-400 text-lg">
                    Select a session to view details and charts
                  </div>
                </div>
              }
            >
              {(session) => (
                <div class="space-y-6">
                  <div class="bg-gray-800 rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                      <h2 class="text-xl font-bold text-white">
                        Session Details
                      </h2>
                      <div class="flex items-center gap-2">
                        <button
                          onClick={analyzeWithAI}
                          disabled={isAnalyzing()}
                          class="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm rounded-md transition-colors flex items-center gap-2"
                        >
                          {isAnalyzing() ? (
                            <>
                              <div class="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <svg
                                class="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                              AI Analysis
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            deleteSession(
                              session().filename!,
                              formatDate(session().startTime)
                            )
                          }
                          class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-2"
                          title="Delete this session"
                        >
                          <svg
                            class="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>

                        <span class="text-sm text-gray-400">
                          {formatDate(session().startTime)}
                        </span>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div class="bg-gray-700 rounded-lg p-3">
                        <div class="text-gray-400 text-xs">Duration</div>
                        <div class="text-white font-bold">
                          {formatDuration(session().duration)}
                        </div>
                      </div>
                      <div class="bg-gray-700 rounded-lg p-3">
                        <div class="text-gray-400 text-xs">Calories</div>
                        <div class="text-white font-bold">
                          {session().summary.totalCalories}
                        </div>
                      </div>
                      <div class="bg-gray-700 rounded-lg p-3">
                        <div class="text-gray-400 text-xs">Distance</div>
                        <div class="text-white font-bold">
                          {session().summary.totalDistance.toFixed(1)} km
                        </div>
                      </div>
                      <div class="bg-gray-700 rounded-lg p-3">
                        <div class="text-gray-400 text-xs">Avg HR</div>
                        <div class="text-white font-bold">
                          {session().summary.avgHeartRate} bpm
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="bg-gray-800 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">
                      Performance Charts
                    </h3>
                    {renderChart(session())}
                  </div>

                  <Show when={session().aiAnalysis}>
                    <div class="bg-gray-800 rounded-lg p-6">
                      <div class="flex items-center gap-2 mb-4">
                        <svg
                          class="w-5 h-5 text-purple-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <h3 class="text-lg font-semibold text-white">
                          AI Performance Analysis
                        </h3>
                        <div class="flex items-center gap-2 ml-auto">
                          <span class="text-sm text-gray-400">Score:</span>
                          <div
                            class={`px-2 py-1 rounded text-sm font-bold ${
                              session().aiAnalysis.performance_score >= 80
                                ? "bg-green-600 text-white"
                                : session().aiAnalysis.performance_score >= 60
                                ? "bg-yellow-600 text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {session().aiAnalysis.performance_score}/100
                          </div>
                        </div>
                      </div>

                      <div class="space-y-4">
                        <div>
                          <h4 class="text-white font-medium mb-2">Analysis</h4>
                          <p class="text-gray-300 text-sm leading-relaxed">
                            {session().aiAnalysis.analysis}
                          </p>
                        </div>

                        <div>
                          <h4 class="text-white font-medium mb-2">
                            Recommendations
                          </h4>
                          <ul class="list-disc list-inside space-y-1">
                            <For each={session().aiAnalysis.recommendations}>
                              {(recommendation) => (
                                <li class="text-gray-300 text-sm">
                                  {recommendation}
                                </li>
                              )}
                            </For>
                          </ul>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div class="bg-gray-700 rounded-lg p-3">
                            <h5 class="text-white font-medium text-sm mb-1">
                              Heart Rate Zones
                            </h5>
                            <p class="text-gray-300 text-xs">
                              {
                                session().aiAnalysis.zones_analysis
                                  .heart_rate_zones
                              }
                            </p>
                          </div>
                          <div class="bg-gray-700 rounded-lg p-3">
                            <h5 class="text-white font-medium text-sm mb-1">
                              Power Analysis
                            </h5>
                            <p class="text-gray-300 text-xs">
                              {session().aiAnalysis.zones_analysis.power_zones}
                            </p>
                          </div>
                          <div class="bg-gray-700 rounded-lg p-3">
                            <h5 class="text-white font-medium text-sm mb-1">
                              Endurance Assessment
                            </h5>
                            <p class="text-gray-300 text-xs">
                              {
                                session().aiAnalysis.zones_analysis
                                  .endurance_assessment
                              }
                            </p>
                          </div>
                        </div>

                        <div class="text-xs text-gray-500 mt-4">
                          Analysis generated on:{" "}
                          {new Date(
                            session().aiAnalysis.timestamp
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Show>
                </div>
              )}
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
