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

export interface WorkoutPlanRequest {
  goal: string;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  availableDays: string[];
  sessionDuration: number;
  targetWeeks: number;
  specificGoals?: string;
  currentWeight?: number;
  targetWeight?: number;
  medicalConditions?: string;
}

export class AIPromptsService {
  static generateTrainingPrompt(request: AIPromptData): string {
    const RIDE_STYLES = [
      { id: "city", name: "City" },
      { id: "suburban", name: "Suburban" },
      { id: "countryside", name: "Countryside" },
      { id: "track", name: "Track" },
      { id: "mountain", name: "Mountain" },
      { id: "beach", name: "Beach" },
      { id: "forest", name: "Forest" },
      { id: "highway", name: "Highway" },
    ];

    const TRAINING_GOALS = [
      { id: "casual", name: "Casual" },
      { id: "weight_loss", name: "Weight Loss" },
      { id: "warmup", name: "Warm-up" },
      { id: "endurance", name: "Endurance" },
      { id: "hiit", name: "HIIT" },
      { id: "recovery", name: "Recovery" },
      { id: "strength", name: "Strength" },
      { id: "sprint", name: "Sprint" },
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

TRAINING GOALS:
• CASUAL: R3-8, comfort first, gentle pace
• WEIGHT_LOSS: R6-12, HR 120-140, fat burning zone
• WARMUP: Start R1-3, +1-2 every 30s, gradual increase
• ENDURANCE: R8-15, steady sustained effort, build stamina
• HIIT: Alternate R12-18, intense intervals with recovery
• RECOVERY: R1-6, very light effort, active rest
• STRENGTH: R14-20, high resistance, muscle building
• SPRINT: R8-12, maximum RPM, short bursts

RIDE STYLES:
• CITY: Variable resistance, simulate stops/starts
• SUBURBAN: Moderate hills R6-12, steady climbs
• COUNTRYSIDE: Long gradual changes, scenic pace
• TRACK: Focus speed/RPM, minimal resistance changes
• MOUNTAIN: High resistance R12-20, climbing simulation
• BEACH: Relaxed R3-8, easy cruising pace
• FOREST: Natural variety R5-14, trail simulation
• HIGHWAY: Sustained effort R8-15, long distance pace

• AT MAX RESISTANCE (20): Focus on maintaining pace, form, or suggest rest intervals

IMPORTANT:
- Don't repeat previous advice
- Be specific about WHY you're changing resistance
- Keep advice under 25 words
- Focus on progression and variety
- Never start with "Based on..."
- If at resistance 20, suggest pace/form changes instead of increasing

JSON: {"resistance": 1-20, "advice": "brief_specific_advice", "action": "concrete_action"}

Action examples:
- "Speed up!" - when increasing resistance/intensity
- "Reduce pace" - when decreasing resistance
- "Keep it up!" - when maintaining current level
- "Rest" - for recovery periods
- "Interval!" - for interval training
- "Finish!" - for final push`;
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

  static generateWorkoutPlanPrompt(request: WorkoutPlanRequest): string {
    return `You are an expert cycling coach and personal trainer. Create a comprehensive weekly workout plan based on the following requirements:

GOALS & PROFILE:
- Primary Goal: ${request.goal}
- Fitness Level: ${request.fitnessLevel}
- Available Days: ${request.availableDays.join(", ")}
- Preferred Session Duration: ${request.sessionDuration} minutes
- Target Duration: ${request.targetWeeks} weeks
${request.specificGoals ? `- Specific Goals: ${request.specificGoals}` : ""}
${
  request.currentWeight && request.targetWeight
    ? `- Weight: ${request.currentWeight}kg → ${request.targetWeight}kg`
    : ""
}
${
  request.medicalConditions
    ? `- Medical Considerations: ${request.medicalConditions}`
    : ""
}

CYCLING WORKOUT TYPES:
- ENDURANCE: Long steady rides, moderate resistance (R8-12), HR 120-140
- HIIT: High intensity intervals (R12-18), alternating with recovery
- STRENGTH: High resistance hill climbs (R14-20), muscle building
- RECOVERY: Light active recovery (R3-6), easy spinning
- WEIGHT_LOSS: Fat burning zone (R6-12), HR 120-140, longer sessions
- CASUAL: Comfortable pace (R5-10), enjoyable rides

RIDE STYLES:
- city: Variable pace, stop/start simulation
- suburban: Moderate hills, steady climbs
- countryside: Long gradual changes, scenic
- track: Speed focus, minimal resistance changes
- mountain: High resistance climbing simulation
- beach: Relaxed easy pace
- forest: Natural variety, trail simulation
- highway: Sustained endurance pace

PLANNING PRINCIPLES:
1. ${
      request.fitnessLevel === "beginner"
        ? "Start gradually, build base fitness, plenty of recovery"
        : request.fitnessLevel === "intermediate"
        ? "Progressive overload, balanced training, structured recovery"
        : "High intensity, advanced techniques, optimized recovery"
    }
2. Include 1-2 rest days per week minimum
3. Vary intensity and workout types
4. Include warm-up and cool-down guidance
5. Progressive difficulty over weeks
6. Allow for active recovery days

Create a structured weekly plan with specific workouts for each requested day. Respond in JSON format:

{
  "name": "Descriptive plan name",
  "description": "Brief plan overview and goals",
  "weeklySchedule": {
    "monday": {
      "type": "training|rest|active_recovery",
      "rideStyle": "style_name",
      "goal": "goal_name", 
      "duration": minutes,
      "targetResistance": {"min": 1-20, "max": 1-20},
      "targetHeartRate": {"min": bpm, "max": bpm},
      "description": "Detailed workout description and instructions"
    }
  }
}

IMPORTANT:
- Only include days from availableDays list
- Set non-available days as rest or omit them
- Keep descriptions detailed but concise
- Ensure resistance levels match difficulty level
- Include specific coaching cues and techniques`;
  }
}
