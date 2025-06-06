import { createEffect, createSignal, For, Show } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { WorkoutPlannerService } from "../../../services/workout-planner.service";
import {
  DAYS_OF_WEEK,
  FITNESS_LEVELS,
  WeeklySchedule,
  WORKOUT_GOALS,
  WorkoutPlan,
  WorkoutPlanRequest,
} from "../../../types/workout-planner.types";
import { IconSelector } from "../../components/IconSelector";

interface WorkoutDayProps {
  dayData: { date: Date; dayName: string };
  weekIndex: number;
  workout: any;
  workoutCompletions: any;
  onMarkCompleted: (dayOfWeek: string, weekIndex: number) => void;
  onMarkSkipped: (dayOfWeek: string, weekIndex: number) => void;
  onClearStatus: (dayOfWeek: string, weekIndex: number) => void;
}

function WorkoutDay(props: WorkoutDayProps) {
  const today = () => {
    const todayDate = new Date();
    return props.dayData.date.toDateString() === todayDate.toDateString();
  };

  const workoutStatus = () =>
    props.workoutCompletions[props.weekIndex]?.[props.dayData.dayName] || null;

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case "training":
        return "bg-blue-900/50 border-blue-500";
      case "rest":
        return "bg-gray-900/50 border-gray-500";
      case "active_recovery":
        return "bg-green-900/50 border-green-500";
      default:
        return "bg-gray-900/50 border-gray-500";
    }
  };

  return (
    <div
      class={`rounded-lg p-4 border-2 transition-all ${
        today() ? "ring-2 ring-purple-400/50" : ""
      } ${getWorkoutTypeColor(props.workout?.type || "rest")}`}
    >
      <div class="text-center mb-3">
        <div
          class={`text-sm font-medium ${
            today() ? "text-purple-200" : "text-white"
          }`}
        >
          {DAYS_OF_WEEK.find((d) => d.id === props.dayData.dayName)?.name}
        </div>
        <div class="text-xs text-gray-400">
          {props.dayData.date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      <Show when={props.workout}>
        <div class="space-y-2">
          <div class="text-center">
            <div class="text-lg mb-1">
              {props.workout?.type === "training"
                ? "🚴"
                : props.workout?.type === "active_recovery"
                ? "🧘"
                : "😴"}
            </div>
            <div class="text-xs font-medium text-white">
              {props.workout?.type === "rest"
                ? "Rest"
                : `${props.workout?.duration}min`}
            </div>
          </div>

          <Show when={props.workout?.type !== "rest"}>
            <div class="text-xs text-gray-300 text-center">
              <div>{props.workout?.rideStyle}</div>
              <div>
                R{props.workout?.targetResistance.min}-
                {props.workout?.targetResistance.max}
              </div>
            </div>
          </Show>

          <Show when={workoutStatus() === "completed"}>
            <div class="text-center text-green-400 text-xs mb-2">
              ✓ Completed
            </div>
            <button
              onClick={() =>
                props.onClearStatus(props.dayData.dayName, props.weekIndex)
              }
              class="w-full px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </Show>

          <Show when={workoutStatus() === "skipped"}>
            <div class="text-center text-red-400 text-xs mb-2">✗ Skipped</div>
            <button
              onClick={() =>
                props.onClearStatus(props.dayData.dayName, props.weekIndex)
              }
              class="w-full px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </Show>

          <Show when={props.workout?.type !== "rest" && !workoutStatus()}>
            <div class="flex gap-1">
              <button
                onClick={() =>
                  props.onMarkCompleted(props.dayData.dayName, props.weekIndex)
                }
                class="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
              >
                Complete
              </button>
              <button
                onClick={() =>
                  props.onMarkSkipped(props.dayData.dayName, props.weekIndex)
                }
                class="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
              >
                Skip
              </button>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}

export function WorkoutPlanner() {
  const [currentPlan, setCurrentPlan] = createSignal<WorkoutPlan | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = createSignal(false);
  const [isGenerating, setIsGenerating] = createSignal(false);
  const [hasApiKey, setHasApiKey] = createSignal(false);
  const [showPlanForm, setShowPlanForm] = createSignal(false);
  const [allPlans, setAllPlans] = createSignal<WorkoutPlan[]>([]);
  const [workoutCompletions, setWorkoutCompletions] = createStore<{
    [weekIndex: number]: { [dayId: string]: "completed" | "skipped" | null };
  }>({});

  const [planRequest, setPlanRequest] = createSignal<WorkoutPlanRequest>({
    goal: "weight_loss",
    fitnessLevel: "intermediate",
    availableDays: ["monday", "wednesday", "friday"],
    sessionDuration: 45,
    targetWeeks: 4,
    specificGoals: "",
  });

  const refreshCurrentPlan = async () => {
    const current = await WorkoutPlannerService.getCurrentPlan();
    console.log("refreshCurrentPlan: Loading plan:", current);
    setCurrentPlan(current);
    // Update local workout completions state
    const completions = current?.weeklyCompletions || {};
    console.log(
      "refreshCurrentPlan: Setting workoutCompletions to:",
      completions
    );
    setWorkoutCompletions(reconcile(completions));
  };

  createEffect(async () => {
    const apiKey = await window.electronAPI.settings.getClaudeApiKey();
    setHasApiKey(!!apiKey);

    const current = await WorkoutPlannerService.getCurrentPlan();
    console.log("Loading current plan:", current);
    setCurrentPlan(current);
    const completions = current?.weeklyCompletions || {};
    console.log("Setting workoutCompletions to:", completions);
    setWorkoutCompletions(reconcile(completions));

    const plans = await WorkoutPlannerService.getAllWorkoutPlans();
    setAllPlans(plans);
  });

  const handleGeneratePlan = async () => {
    if (!hasApiKey()) return;

    setIsGenerating(true);
    try {
      const apiKey = await window.electronAPI.settings.getClaudeApiKey();
      const plan = await WorkoutPlannerService.generateWorkoutPlan(
        planRequest(),
        apiKey
      );
      setCurrentPlan(plan);
      setShowPlanForm(false);

      const plans = await WorkoutPlannerService.getAllWorkoutPlans();
      setAllPlans(plans);
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Error generating workout plan: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDayToggle = (dayId: string) => {
    const current = planRequest();
    const availableDays = current.availableDays.includes(dayId)
      ? current.availableDays.filter((d) => d !== dayId)
      : [...current.availableDays, dayId];

    setPlanRequest({ ...current, availableDays });
  };

  const handleMarkCompleted = async (dayOfWeek: string, weekIndex: number) => {
    const plan = currentPlan();
    if (!plan) return;

    console.log("handleMarkCompleted called", { dayOfWeek, weekIndex });
    console.log(
      "Current workoutCompletions before update:",
      workoutCompletions
    );

    // Update local state immediately for instant UI feedback
    if (!workoutCompletions[weekIndex]) {
      setWorkoutCompletions(weekIndex, {});
    }
    setWorkoutCompletions(weekIndex, dayOfWeek, "completed");
    console.log("Updated workoutCompletions state:", workoutCompletions);

    try {
      await WorkoutPlannerService.markWorkoutCompleted(
        plan.id,
        dayOfWeek,
        weekIndex
      );
      // No need to refresh - we already updated local state optimistically
    } catch (error) {
      console.error("Error marking workout completed:", error);
      alert("Error marking workout completed: " + error.message);
      // Revert local state on error
      await refreshCurrentPlan();
    }
  };

  const handleMarkSkipped = async (dayOfWeek: string, weekIndex: number) => {
    const plan = currentPlan();
    if (!plan) return;

    // Update local state immediately for instant UI feedback
    if (!workoutCompletions[weekIndex]) {
      setWorkoutCompletions(weekIndex, {});
    }
    setWorkoutCompletions(weekIndex, dayOfWeek, "skipped");

    try {
      await WorkoutPlannerService.markWorkoutSkipped(
        plan.id,
        dayOfWeek,
        weekIndex
      );
      // No need to refresh - we already updated local state optimistically
    } catch (error) {
      console.error("Error marking workout skipped:", error);
      alert("Error marking workout skipped: " + error.message);
      // Revert local state on error
      await refreshCurrentPlan();
    }
  };

  const handleClearStatus = async (dayOfWeek: string, weekIndex: number) => {
    const plan = currentPlan();
    if (!plan) return;

    // Update local state immediately for instant UI feedback
    if (!workoutCompletions[weekIndex]) {
      setWorkoutCompletions(weekIndex, {});
    }
    setWorkoutCompletions(weekIndex, dayOfWeek, null);

    try {
      await WorkoutPlannerService.clearWorkoutStatus(
        plan.id,
        dayOfWeek,
        weekIndex
      );
      // No need to refresh - we already updated local state optimistically
    } catch (error) {
      console.error("Error clearing workout status:", error);
      alert("Error clearing workout status: " + error.message);
      // Revert local state on error
      await refreshCurrentPlan();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-400";
      case "intermediate":
        return "text-yellow-400";
      case "advanced":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case "training":
        return "bg-blue-900/50 border-blue-500";
      case "rest":
        return "bg-gray-900/50 border-gray-500";
      case "active_recovery":
        return "bg-green-900/50 border-green-500";
      default:
        return "bg-gray-900/50 border-gray-500";
    }
  };

  const getWeekDates = (weekOffset: number = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(
      today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + weekOffset * 7
    );

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const days = DAYS_OF_WEEK.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return {
        date,
        dayName: day.id,
      };
    });

    return {
      start: monday,
      end: sunday,
      days,
    };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 h-screen overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-white flex items-center gap-3">
            <svg
              class="w-8 h-8 text-purple-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
            </svg>
            Workout Planner
          </h2>
          <p class="text-gray-400 text-sm">AI-powered weekly training plans</p>
        </div>

        <div class="flex items-center gap-3">
          <Show when={currentPlan()}>
            <button
              onClick={() => setShowPlanForm(true)}
              class="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Create New Plan
            </button>
          </Show>
        </div>
      </div>

      {!hasApiKey() && (
        <div class="bg-yellow-900/30 border border-yellow-600 rounded-md p-4 mb-6">
          <p class="text-yellow-200 text-sm">
            Add Claude API key in settings to generate AI workout plans
          </p>
        </div>
      )}

      <Show when={!currentPlan() && !showPlanForm()}>
        <div class="text-center py-12">
          <svg
            class="w-16 h-16 text-gray-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 01-2 2m-3 7h3m0 0h3m-3 0v3m0-3V9"
            />
          </svg>
          <h3 class="text-xl font-semibold text-white mb-2">No Workout Plan</h3>
          <p class="text-gray-400 mb-6">
            Create your first AI-generated workout plan to get started
          </p>
          <button
            onClick={() => setShowPlanForm(true)}
            disabled={!hasApiKey()}
            class="px-6 py-3 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Workout Plan
          </button>
        </div>
      </Show>

      <Show when={showPlanForm()}>
        <div class="bg-gray-900 rounded-lg p-6 border border-gray-600 mb-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-white">
              Create New Workout Plan
            </h3>
            <button
              onClick={() => setShowPlanForm(false)}
              class="text-gray-400 hover:text-white p-2"
            >
              <svg
                class="w-6 h-6"
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

          <div class="space-y-6">
            <IconSelector
              items={WORKOUT_GOALS}
              selectedId={planRequest().goal}
              onSelect={(goal) => setPlanRequest({ ...planRequest(), goal })}
              title="Primary Goal"
              getItemId={(item) => item.id}
              getItemName={(item) => item.name}
              getItemIcon={() => "🎯"}
              getItemDescription={(item) => item.description}
            />

            <IconSelector
              items={FITNESS_LEVELS}
              selectedId={planRequest().fitnessLevel}
              onSelect={(level) =>
                setPlanRequest({ ...planRequest(), fitnessLevel: level as any })
              }
              title="Fitness Level"
              getItemId={(item) => item.id}
              getItemName={(item) => item.name}
              getItemIcon={(item) =>
                item.id === "beginner"
                  ? "🌱"
                  : item.id === "intermediate"
                  ? "💪"
                  : "🔥"
              }
              getItemDescription={(item) => item.description}
            />

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-3">
                Available Days
              </label>
              <div class="grid grid-cols-7 gap-2">
                <For each={DAYS_OF_WEEK}>
                  {(day) => (
                    <button
                      onClick={() => handleDayToggle(day.id)}
                      class={`p-3 rounded-lg border-2 transition-all text-center ${
                        planRequest().availableDays.includes(day.id)
                          ? "border-purple-400 bg-purple-600/50 text-white"
                          : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <div class="text-xs font-medium">{day.short}</div>
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Session Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={planRequest().sessionDuration}
                  onInput={(e) =>
                    setPlanRequest({
                      ...planRequest(),
                      sessionDuration: parseInt(e.currentTarget.value),
                    })
                  }
                  class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Target Duration (weeks)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={planRequest().targetWeeks}
                  onInput={(e) =>
                    setPlanRequest({
                      ...planRequest(),
                      targetWeeks: parseInt(e.currentTarget.value),
                    })
                  }
                  class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Specific Goals (Optional)
              </label>
              <textarea
                value={planRequest().specificGoals || ""}
                onInput={(e) =>
                  setPlanRequest({
                    ...planRequest(),
                    specificGoals: e.currentTarget.value,
                  })
                }
                placeholder="Describe any specific goals, preferences, or requirements..."
                class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white h-20 resize-none"
              />
            </div>

            <div class="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPlanForm(false)}
                class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePlan}
                disabled={
                  isGenerating() || planRequest().availableDays.length === 0
                }
                class="px-6 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating() && (
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {isGenerating() ? "Generating..." : "Generate Plan"}
              </button>
            </div>
          </div>
        </div>
      </Show>

      <Show when={currentPlan()}>
        <div class="space-y-6">
          <div class="bg-gray-900 rounded-lg p-6 border border-gray-600">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-xl font-semibold text-white">
                  {currentPlan()?.name}
                </h3>
                <p class="text-gray-400 text-sm">
                  {currentPlan()?.description}
                </p>
              </div>
              <div class="text-right">
                <div
                  class={`text-sm font-medium ${getDifficultyColor(
                    currentPlan()?.difficulty || ""
                  )}`}
                >
                  {currentPlan()?.difficulty?.toUpperCase()}
                </div>
                <div class="text-xs text-gray-500">
                  {currentPlan()?.duration} weeks
                </div>
                <Show when={currentPlan()?.weeklyCompletions}>
                  <div class="text-xs text-purple-400 mt-1">
                    {Object.keys(currentPlan()?.weeklyCompletions || {}).length}{" "}
                    / {currentPlan()?.duration} weeks started
                  </div>
                </Show>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <For
              each={Array.from(
                { length: currentPlan()?.duration || 1 },
                (_, weekIndex) => weekIndex
              )}
              fallback={<div>No weeks to display</div>}
            >
              {(weekIndex) => (
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-600">
                  <div class="flex items-center justify-between mb-6">
                    <h4 class="text-lg font-semibold text-white">
                      Week {weekIndex + 1} of {currentPlan()?.duration || 1}
                    </h4>
                    <div class="text-sm text-gray-400">
                      {getWeekDates(weekIndex).start.toLocaleDateString()} -{" "}
                      {getWeekDates(weekIndex).end.toLocaleDateString()}
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
                    <For
                      each={getWeekDates(weekIndex).days}
                      fallback={<div>No days to display</div>}
                    >
                      {(dayData) => {
                        const plan = currentPlan();
                        const workout =
                          plan?.weeklySchedule[
                            dayData.dayName as keyof WeeklySchedule
                          ];
                        const today = isToday(dayData.date);
                        // Read store directly for reactivity
                        const workoutStatus =
                          workoutCompletions[weekIndex]?.[dayData.dayName] ||
                          null;

                        return (
                          <WorkoutDay
                            dayData={dayData}
                            weekIndex={weekIndex}
                            workout={workout}
                            workoutCompletions={workoutCompletions}
                            onMarkCompleted={handleMarkCompleted}
                            onMarkSkipped={handleMarkSkipped}
                            onClearStatus={handleClearStatus}
                          />
                        );
                      }}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
