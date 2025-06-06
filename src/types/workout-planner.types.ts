export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  goal: string;
  duration: number; // in weeks
  difficulty: "beginner" | "intermediate" | "advanced";
  weeklySchedule: WeeklySchedule;
  weeklyCompletions?: {
    [weekIndex: number]: { [dayId: string]: "completed" | "skipped" | null };
  };
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySchedule {
  monday?: DailyWorkout;
  tuesday?: DailyWorkout;
  wednesday?: DailyWorkout;
  thursday?: DailyWorkout;
  friday?: DailyWorkout;
  saturday?: DailyWorkout;
  sunday?: DailyWorkout;
}

export interface DailyWorkout {
  type: "training" | "rest" | "active_recovery";
  rideStyle: string;
  goal: string;
  duration: number; // in minutes
  targetResistance: {
    min: number;
    max: number;
  };
  targetHeartRate?: {
    min: number;
    max: number;
  };
  description: string;
  notes?: string;
  completed?: boolean;
  completedAt?: string;
}

export interface WorkoutPlanRequest {
  goal: string;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  availableDays: string[]; // ['monday', 'tuesday', etc.]
  sessionDuration: number; // preferred session duration in minutes
  targetWeeks: number;
  specificGoals?: string; // user's specific description
  currentWeight?: number;
  targetWeight?: number;
  medicalConditions?: string;
}

export interface PlannerSettings {
  weekStartsOn: "monday" | "sunday";
  defaultSessionDuration: number;
  reminderTime?: string;
  autoAdvanceWeeks: boolean;
}

export const WORKOUT_GOALS = [
  {
    id: "weight_loss",
    name: "Weight Loss",
    description: "Burn calories and lose weight",
  },
  {
    id: "endurance",
    name: "Build Endurance",
    description: "Improve cardiovascular fitness",
  },
  {
    id: "strength",
    name: "Build Strength",
    description: "Increase muscle strength and power",
  },
  {
    id: "general_fitness",
    name: "General Fitness",
    description: "Overall health and wellness",
  },
  {
    id: "recovery",
    name: "Recovery & Rehabilitation",
    description: "Gentle recovery workouts",
  },
  {
    id: "performance",
    name: "Performance",
    description: "Competitive training and performance",
  },
];

export const FITNESS_LEVELS = [
  {
    id: "beginner",
    name: "Beginner",
    description: "New to cycling or returning after a break",
  },
  {
    id: "intermediate",
    name: "Intermediate",
    description: "Regular exercise, some cycling experience",
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Experienced cyclist, regular intensive training",
  },
];

export const DAYS_OF_WEEK = [
  { id: "monday", name: "Monday", short: "Mon" },
  { id: "tuesday", name: "Tuesday", short: "Tue" },
  { id: "wednesday", name: "Wednesday", short: "Wed" },
  { id: "thursday", name: "Thursday", short: "Thu" },
  { id: "friday", name: "Friday", short: "Fri" },
  { id: "saturday", name: "Saturday", short: "Sat" },
  { id: "sunday", name: "Sunday", short: "Sun" },
];
