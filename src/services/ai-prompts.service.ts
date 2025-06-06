export interface AIPromptData {
  goal: string;
  style: string;
  sessionDuration: number;
  workoutData: {
    speed: number;
    rpm: number;
    power: number;
    heartRate: number;
    currentResistance: number;
  };
  adviceHistory?: Array<{
    timestamp: string;
    oldResistance: number;
    newResistance: number;
    advice: string;
  }>;
}

export class AIPromptsService {
  static generateTrainingPrompt(request: AIPromptData): string {
    const RIDE_STYLES = [
      { id: "casual", name: "Casual" },
      { id: "weight_loss", name: "Weight Loss" },
      { id: "endurance", name: "Endurance" },
    ];

    const TRAINING_GOALS = [
      { id: "warm_up", name: "Warm Up" },
      { id: "weight_loss", name: "Weight Loss" },
      { id: "endurance", name: "Endurance" },
    ];

    const style =
      RIDE_STYLES.find((s) => s.id === request.style)?.name || request.style;
    const goal =
      TRAINING_GOALS.find((g) => g.id === request.goal)?.name || request.goal;

    const historyContext =
      request.adviceHistory && request.adviceHistory.length > 0
        ? `\nRECENT ADVICE HISTORY (last 3 recommendations):
${request.adviceHistory
  .slice(-3)
  .map(
    (advice, i) =>
      `${i + 1}. ${Math.floor(
        (Date.now() - new Date(advice.timestamp).getTime()) / 1000
      )}s ago: R${advice.oldResistance}→${advice.newResistance} "${
        advice.advice
      }"`
  )
  .join("\n")}\n`
        : "\nFIRST RECOMMENDATION - no previous advice given.\n";

    return `You are an expert cycling coach. Give concise, progressive advice WITHOUT repeating previous recommendations.

WORKOUT: ${goal} ${style} ride (${Math.floor(request.sessionDuration / 60)}min)
CURRENT: Speed ${request.workoutData.speed}km/h, RPM ${
      request.workoutData.rpm
    }, Power ${request.workoutData.power}W, HR ${
      request.workoutData.heartRate
    }bpm, Resistance ${request.workoutData.currentResistance}/20
${historyContext}
RULES:
• RESISTANCE LIMITS: MIN=1, MAX=20 (NEVER exceed 20!)
• CASUAL: R3-8, comfort first
• WEIGHT_LOSS: R6-12, HR 120-140
• ENDURANCE: R8-15, steady effort  
• WARM_UP: +1-2 every 30s
• AT MAX RESISTANCE (20): Focus on maintaining pace, form, or suggest rest intervals

IMPORTANT:
- Don't repeat previous advice
- Be specific about WHY you're changing resistance
- Keep advice under 25 words
- Focus on progression and variety
- Never start with "Based on..."
- If at resistance 20, suggest pace/form changes instead of increasing

JSON: {"resistance": 1-20, "advice": "brief_specific_advice"}`;
  }

  static generateWorkoutAnalysisPrompt(session: any): string {
    return `Analyze this cycling workout session and provide detailed insights:

Session Duration: ${Math.floor(session.duration / 1000 / 60)} minutes
Summary Stats:
- Max Heart Rate: ${session.summary.maxHeartRate} bpm
- Avg Heart Rate: ${session.summary.averageHeartRate} bpm  
- Max Power: ${session.summary.maxWatt}W
- Avg Power: ${session.summary.averageWatt}W
- Max Speed: ${session.summary.maxSpeed} km/h
- Avg Speed: ${session.summary.averageSpeed} km/h
- Total Distance: ${session.summary.totalDistance} km
- Total Calories: ${session.summary.totalCalories}

Data points: ${session.data.length} measurements

Sample data points (first 10 and last 10):
First 10 points:
${session.data
  .slice(0, 10)
  .map(
    (point: any, i: number) =>
      `${i + 1}. Time: ${Math.floor(point.time / 60)}:${(point.time % 60)
        .toString()
        .padStart(2, "0")} | HR: ${point.heartRate}bpm | Power: ${
        point.watt
      }W | Speed: ${point.speed}km/h | RPM: ${point.rpm} | Resistance: ${
        point.resistance
      }/20`
  )
  .join("\n")}

Last 10 points:
${session.data
  .slice(-10)
  .map(
    (point: any, i: number) =>
      `${session.data.length - 10 + i + 1}. Time: ${Math.floor(
        point.time / 60
      )}:${(point.time % 60).toString().padStart(2, "0")} | HR: ${
        point.heartRate
      }bpm | Power: ${point.watt}W | Speed: ${point.speed}km/h | RPM: ${
        point.rpm
      } | Resistance: ${point.resistance}/20`
  )
  .join("\n")}

Heart Rate Analysis:
- Zone distribution: ${
      session.data.filter((p: any) => p.heartRate > 0 && p.heartRate < 100)
        .length
    } points below 100 bpm (Rest)
- Fat burn zone (100-130): ${
      session.data.filter((p: any) => p.heartRate >= 100 && p.heartRate < 130)
        .length
    } points
- Cardio zone (130-160): ${
      session.data.filter((p: any) => p.heartRate >= 130 && p.heartRate < 160)
        .length
    } points
- Peak zone (160+ bpm): ${
      session.data.filter((p: any) => p.heartRate >= 160).length
    } points

Power Analysis:
- High power points (>150W): ${
      session.data.filter((p: any) => p.watt > 150).length
    } measurements
- Medium power (75-150W): ${
      session.data.filter((p: any) => p.watt >= 75 && p.watt <= 150).length
    } measurements
- Low power (<75W): ${
      session.data.filter((p: any) => p.watt < 75).length
    } measurements

Please provide:
1. Overall performance analysis
2. Heart rate zones analysis
3. Power and endurance insights
4. Specific recommendations for improvement
5. Performance score (1-100)

Respond in JSON format:
{
  "analysis": "detailed analysis text",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "performance_score": 85,
  "zones_analysis": {
    "heart_rate_zones": "analysis of heart rate zones",
    "power_zones": "analysis of power output",
    "endurance_assessment": "endurance evaluation"
  }
}`;
  }
}
