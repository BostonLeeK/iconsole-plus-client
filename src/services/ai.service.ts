import {
  AITrainingRequest,
  AITrainingResponse,
  RideStyle,
  TrainingGoal,
} from "../types/ai.types";

export const RIDE_STYLES: RideStyle[] = [
  {
    id: "city",
    name: "City",
    description: "Frequent stops, variable pace",
    icon: "🏙️",
  },
  {
    id: "suburban",
    name: "Suburban",
    description: "Steady pace, small hills",
    icon: "🏘️",
  },
  {
    id: "countryside",
    name: "Countryside",
    description: "Long distances, varied terrain",
    icon: "🌄",
  },
  { id: "track", name: "Track", description: "Speed, intensity", icon: "🏁" },
  {
    id: "mountain",
    name: "Mountain",
    description: "High resistance, climbing",
    icon: "⛰️",
  },
  {
    id: "beach",
    name: "Beach",
    description: "Relaxed pace, scenic route",
    icon: "🏖️",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Nature trails, moderate pace",
    icon: "🌲",
  },
  {
    id: "highway",
    name: "Highway",
    description: "Long steady rides, endurance",
    icon: "🛣️",
  },
];

export const TRAINING_GOALS: TrainingGoal[] = [
  {
    id: "casual",
    name: "Casual",
    description: "Light workout, relaxation",
    icon: "😌",
  },
  {
    id: "weight_loss",
    name: "Weight Loss",
    description: "Burn calories, cardio",
    icon: "🔥",
  },
  {
    id: "warmup",
    name: "Warm-up",
    description: "Preparation for training",
    icon: "🔄",
  },
  {
    id: "endurance",
    name: "Endurance",
    description: "Long-duration workouts",
    icon: "💪",
  },
  {
    id: "hiit",
    name: "HIIT",
    description: "High intensity interval training",
    icon: "⚡",
  },
  {
    id: "recovery",
    name: "Recovery",
    description: "Low intensity, active recovery",
    icon: "🧘",
  },
  {
    id: "strength",
    name: "Strength",
    description: "High resistance, muscle building",
    icon: "🏋️",
  },
  {
    id: "sprint",
    name: "Sprint",
    description: "Short bursts, maximum effort",
    icon: "🚀",
  },
];

class AIService {
  private readonly API_URL = "https://api.anthropic.com/v1/messages";

  async analyzeWorkout(
    request: AITrainingRequest,
    apiKey: string
  ): Promise<AITrainingResponse> {
    if (!apiKey) {
      throw new Error("Claude API key not configured");
    }

    const prompt = this.buildPrompt(request);

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 150,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API Error:", errorText);
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const result = this.parseResponse(data.content[0].text);
      return result;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  private buildPrompt(request: AITrainingRequest): string {
    const style =
      RIDE_STYLES.find((s) => s.id === request.rideStyle)?.name ||
      request.rideStyle;
    const goal =
      TRAINING_GOALS.find((g) => g.id === request.goal)?.name || request.goal;

    return `AI Cycling Trainer. Analysis:
Style: ${style}
Goal: ${goal}
Time: ${request.sessionDuration}sec
Data: ${request.workoutData.speed}km/h, ${request.workoutData.rpm}rpm, ${request.workoutData.power}W, ${request.workoutData.heartRate}bpm, resistance ${request.workoutData.currentResistance}/20

Give in JSON format: {"resistance": 1-20, "targetSpeed": 10-38, "advice": "short advice"}`;
  }

  private parseResponse(response: string): AITrainingResponse {
    try {
      const jsonMatch = response.match(/\{[^}]+\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        newResistance: Math.max(1, Math.min(20, parsed.resistance || 1)),
        targetSpeed: Math.max(10, Math.min(38, parsed.targetSpeed || 25)),
        advice: parsed.advice || "Continue your workout",
        action: parsed.action || "Keep it up!",
      };
    } catch (error) {
      return {
        newResistance: 1,
        targetSpeed: 25,
        advice: "AI analysis error",
        action: "Keep it up!",
      };
    }
  }
}

export const aiService = new AIService();
export default aiService;
