export interface RideStyle {
  id: string;
  name: string;
  description: string;
}

export interface TrainingGoal {
  id: string;
  name: string;
  description: string;
}

export interface AdviceHistoryItem {
  timestamp: string;
  advice: string;
  oldResistance: number;
  newResistance: number;
}

export interface AITrainingRequest {
  workoutData: {
    time: number;
    speed: number;
    rpm: number;
    power: number;
    heartRate: number;
    currentResistance: number;
  };
  rideStyle: string;
  goal: string;
  sessionDuration: number;
  adviceHistory?: AdviceHistoryItem[];
}

export interface AITrainingResponse {
  newResistance: number;
  advice: string;
  action: string;
  reasoning?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AITrainingSettings {
  enabled: boolean;
  rideStyle: string;
  goal: string;
  updateInterval: number;
}
