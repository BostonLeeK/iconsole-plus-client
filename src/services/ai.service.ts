import {
  AITrainingRequest,
  AITrainingResponse,
  RideStyle,
  TrainingGoal,
} from "../types/ai.types";

export const RIDE_STYLES: RideStyle[] = [
  { id: "city", name: "City", description: "Frequent stops, variable pace" },
  {
    id: "suburban",
    name: "Suburban",
    description: "Steady pace, small hills",
  },
  {
    id: "countryside",
    name: "Countryside",
    description: "Long distances, varied terrain",
  },
  { id: "track", name: "Track", description: "Speed, intensity" },
];

export const TRAINING_GOALS: TrainingGoal[] = [
  {
    id: "casual",
    name: "Casual",
    description: "Light workout, relaxation",
  },
  {
    id: "weight_loss",
    name: "Weight Loss",
    description: "Burn calories, cardio",
  },
  { id: "warmup", name: "Warm-up", description: "Preparation for training" },
  {
    id: "endurance",
    name: "Endurance",
    description: "Long-duration workouts",
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

    return `Велотренер AI. Аналіз:
Стиль: ${style}
Ціль: ${goal}
Час: ${request.sessionDuration}сек
Данні: ${request.workoutData.speed}км/г, ${request.workoutData.rpm}об/хв, ${request.workoutData.power}Вт, ${request.workoutData.heartRate}bpm, опір ${request.workoutData.currentResistance}/20

Дай у форматі JSON: {"resistance": 1-20, "advice": "короткий совет"}`;
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
        advice: parsed.advice || "Продовжуйте тренування",
      };
    } catch (error) {
      return {
        newResistance: 1,
        advice: "Помилка AI аналізу",
      };
    }
  }
}

export const aiService = new AIService();
export default aiService;
