import {
  DAYS_OF_WEEK,
  WeeklySchedule,
  WorkoutPlan,
  WorkoutPlanRequest,
} from "../types/workout-planner.types";

export class WorkoutPlannerService {
  private static readonly STORAGE_KEY = "workout_plans";
  private static readonly CURRENT_PLAN_KEY = "current_workout_plan";
  private static readonly PLANNER_SETTINGS_KEY = "planner_settings";

  static async generateWorkoutPlan(
    request: WorkoutPlanRequest,
    apiKey: string
  ): Promise<WorkoutPlan> {
    try {
      const parsed = await window.electronAPI.aiService.generateWorkoutPlan(
        request,
        apiKey
      );

      const plan: WorkoutPlan = {
        id: this.generateId(),
        name: parsed.name || `${request.goal} Plan`,
        description: parsed.description || "AI Generated Workout Plan",
        goal: request.goal,
        duration: request.targetWeeks,
        difficulty: request.fitnessLevel,
        weeklySchedule: this.processWeeklySchedule(
          parsed.weeklySchedule,
          request
        ),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.saveWorkoutPlan(plan);
      await this.setCurrentPlan(plan.id);

      return plan;
    } catch (error) {
      console.error("Error generating workout plan:", error);
      throw new Error("Failed to generate workout plan: " + error.message);
    }
  }

  private static processWeeklySchedule(
    schedule: any,
    request: WorkoutPlanRequest
  ): WeeklySchedule {
    const processedSchedule: WeeklySchedule = {};

    DAYS_OF_WEEK.forEach((day) => {
      if (request.availableDays.includes(day.id) && schedule[day.id]) {
        processedSchedule[day.id as keyof WeeklySchedule] = {
          ...schedule[day.id],
          completed: false,
        };
      } else {
        // Add rest day for non-available days
        processedSchedule[day.id as keyof WeeklySchedule] = {
          type: "rest",
          rideStyle: "rest",
          goal: "recovery",
          duration: 0,
          targetResistance: { min: 0, max: 0 },
          description: "Rest day - take a break and let your body recover",
        };
      }
    });

    return processedSchedule;
  }

  static async saveWorkoutPlan(plan: WorkoutPlan): Promise<void> {
    try {
      const plans = await this.getAllWorkoutPlans();
      const existingIndex = plans.findIndex((p) => p.id === plan.id);

      if (existingIndex >= 0) {
        plans[existingIndex] = { ...plan, updatedAt: new Date().toISOString() };
      } else {
        plans.push(plan);
      }

      await window.electronAPI.storage.save(this.STORAGE_KEY, plans);
    } catch (error) {
      console.error("Error saving workout plan:", error);
      throw new Error("Failed to save workout plan");
    }
  }

  static async getAllWorkoutPlans(): Promise<WorkoutPlan[]> {
    try {
      const plans = await window.electronAPI.storage.load(this.STORAGE_KEY);
      return plans || [];
    } catch (error) {
      console.error("Error loading workout plans:", error);
      return [];
    }
  }

  static async getWorkoutPlan(id: string): Promise<WorkoutPlan | null> {
    try {
      const plans = await this.getAllWorkoutPlans();
      return plans.find((p) => p.id === id) || null;
    } catch (error) {
      console.error("Error getting workout plan:", error);
      return null;
    }
  }

  static async getCurrentPlan(): Promise<WorkoutPlan | null> {
    try {
      const currentPlanId = await window.electronAPI.storage.load(
        this.CURRENT_PLAN_KEY
      );
      if (!currentPlanId) return null;

      return await this.getWorkoutPlan(currentPlanId);
    } catch (error) {
      console.error("Error getting current plan:", error);
      return null;
    }
  }

  static async setCurrentPlan(planId: string): Promise<void> {
    try {
      await window.electronAPI.storage.save(this.CURRENT_PLAN_KEY, planId);
    } catch (error) {
      console.error("Error setting current plan:", error);
      throw new Error("Failed to set current plan");
    }
  }

  static async markWorkoutStatus(
    planId: string,
    dayOfWeek: string,
    weekIndex: number,
    status: "completed" | "skipped" | null
  ): Promise<void> {
    try {
      const plan = await this.getWorkoutPlan(planId);
      if (!plan) throw new Error("Plan not found");

      if (!plan.weeklyCompletions) {
        plan.weeklyCompletions = {};
      }

      if (!plan.weeklyCompletions[weekIndex]) {
        plan.weeklyCompletions[weekIndex] = {};
      }

      plan.weeklyCompletions[weekIndex][dayOfWeek] = status;
      plan.updatedAt = new Date().toISOString();

      await this.saveWorkoutPlan(plan);
    } catch (error) {
      console.error("Error marking workout status:", error);
      throw new Error("Failed to mark workout status");
    }
  }

  static async markWorkoutCompleted(
    planId: string,
    dayOfWeek: string,
    weekIndex: number = 0
  ): Promise<void> {
    return this.markWorkoutStatus(planId, dayOfWeek, weekIndex, "completed");
  }

  static async markWorkoutSkipped(
    planId: string,
    dayOfWeek: string,
    weekIndex: number = 0
  ): Promise<void> {
    return this.markWorkoutStatus(planId, dayOfWeek, weekIndex, "skipped");
  }

  static async clearWorkoutStatus(
    planId: string,
    dayOfWeek: string,
    weekIndex: number = 0
  ): Promise<void> {
    return this.markWorkoutStatus(planId, dayOfWeek, weekIndex, null);
  }

  static getWorkoutStatus(
    plan: WorkoutPlan | null,
    dayOfWeek: string,
    weekIndex: number = 0
  ): "completed" | "skipped" | null {
    return plan?.weeklyCompletions?.[weekIndex]?.[dayOfWeek] || null;
  }

  static isWorkoutCompleted(
    plan: WorkoutPlan | null,
    dayOfWeek: string,
    weekIndex: number = 0
  ): boolean {
    return this.getWorkoutStatus(plan, dayOfWeek, weekIndex) === "completed";
  }

  static isWorkoutSkipped(
    plan: WorkoutPlan | null,
    dayOfWeek: string,
    weekIndex: number = 0
  ): boolean {
    return this.getWorkoutStatus(plan, dayOfWeek, weekIndex) === "skipped";
  }

  static async deleteWorkoutPlan(id: string): Promise<void> {
    try {
      const plans = await this.getAllWorkoutPlans();
      const filteredPlans = plans.filter((p) => p.id !== id);
      await window.electronAPI.storage.save(this.STORAGE_KEY, filteredPlans);

      const currentPlanId = await window.electronAPI.storage.load(
        this.CURRENT_PLAN_KEY
      );
      if (currentPlanId === id) {
        await window.electronAPI.storage.remove(this.CURRENT_PLAN_KEY);
      }
    } catch (error) {
      console.error("Error deleting workout plan:", error);
      throw new Error("Failed to delete workout plan");
    }
  }

  static getWeekDates(): {
    start: Date;
    end: Date;
    days: Array<{ date: Date; dayName: string }>;
  } {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

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
  }

  private static generateId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
