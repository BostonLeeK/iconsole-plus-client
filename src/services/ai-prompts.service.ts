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
    targetSpeed: number;
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
      )}s ago: R${advice.oldResistance}→${advice.newResistance}, Target: ${
        advice.targetSpeed
      }km/h "${advice.advice}"`
  )
  .join("\n")}\n`
        : "\nFIRST RECOMMENDATION - no previous advice given.\n";

    return `You are an expert cycling coach specializing in dynamic interval training. Create varied, progressive workouts that adapt to current performance.

WORKOUT: ${goal} ${style} ride (${Math.floor(
      request.sessionDuration / 60
    )}min elapsed)
CURRENT: Speed ${request.workoutData.speed}km/h, RPM ${
      request.workoutData.rpm
    }, Power ${request.workoutData.power}W, HR ${
      request.workoutData.heartRate
    }bpm, Resistance ${request.workoutData.currentResistance}/32
${historyContext}
CRITICAL RULES:
• RESISTANCE LIMITS: MIN=1, MAX=32 (NEVER exceed!)
• RESPECT THE SELECTED GOAL - ${goal.toUpperCase()} mode requirements MUST be followed
• Max speed is 38km/h
• Match resistance to current performance and fatigue level

SPEED TARGETS BY GOAL:
• CASUAL: 15-25km/h, comfortable cruising
• WEIGHT_LOSS: 20-30km/h, optimal fat burn zone
• WARMUP: 10-20km/h, gradual progression
• ENDURANCE: 25-35km/h, sustained effort
• HIIT: 15-35km/h, varies with intervals
• RECOVERY: 10-20km/h, easy spinning
• STRENGTH: 15-25km/h, power over speed
• SPRINT: 30-38km/h, maximum velocity

DYNAMIC TRAINING PROTOCOLS:

HIIT PROTOCOL (High Intensity Intervals):
- Work intervals: R14-18, target 28-35km/h for 30-90 seconds
- Recovery intervals: R4-8, target 15-22km/h for 30-60 seconds
- Progress: Start moderate, build to max, then recover
- If HR >150: Increase work intensity
- If HR <120: Extend work interval or increase resistance
- NEVER stay at R20 for more than 2 minutes!

FOREST PROTOCOL (Natural Trail Simulation):
- Simulate varied terrain with frequent changes
- Flat sections: R5-9, target 22-28km/h (cruise pace)
- Uphill sections: R12-16, target 18-25km/h (30-60 seconds)
- Downhill/recovery: R2-6, target 25-32km/h (20-40 seconds)
- Technical sections: R10-14, target 20-26km/h with RPM focus
- Create rolling hills pattern, not constant high resistance

GOAL-SPECIFIC PROTOCOLS:
• CASUAL: R3-8, gentle variations every 2-3 minutes, comfortable pace, NO HIIT intervals
• WEIGHT_LOSS: R6-12, moderate intervals, fat burn focus, steady heart rate zones
• WARMUP: Progressive R1→8 over first 5 minutes, gradual intensity increase
• ENDURANCE: R8-15, steady with small variations, sustained effort
• RECOVERY: R1-6, very easy spinning, active rest
• STRENGTH: R14-32, short power intervals, muscle building focus
• SPRINT: R6-12, RPM focus, short bursts

RIDE STYLE ADAPTATIONS:
• CITY: Frequent stops/starts, variable R3-15
• SUBURBAN: Rolling hills R6-14, moderate climbs
• COUNTRYSIDE: Gentle long changes R5-12
• TRACK: Speed focus R6-10, consistent effort
• MOUNTAIN: Steep climbs R12-20, recovery valleys R3-8
• BEACH: Easy cruise R3-8, relaxed rhythm
• FOREST: Most varied R4-16, constant terrain changes
• HIGHWAY: Sustained R8-15, slight variations for wind

DECISION LOGIC BY GOAL:
CASUAL MODE: Keep resistance steady R3-8, gentle changes only every 2-3 minutes, prioritize comfort
HIIT MODE: Alternate high/low resistance, create work/recovery intervals
WEIGHT_LOSS: Moderate steady resistance R6-12, maintain fat burn heart rate zone
ENDURANCE: Gradual resistance changes R8-15, avoid sudden spikes
RECOVERY: Very low resistance R1-6, prioritize easy spinning
STRENGTH: Use high resistance R14-32 for power building
SPRINT: Focus on speed with moderate resistance R6-12

TIMING CONSIDERATIONS:
- First 5 min: Gradual warm-up regardless of goal
- Minutes 5-15: Build to target intensity
- Middle phase: Implement full protocol with intervals
- Final 10 min: Begin gradual cool-down
- Last 5 min: Easy recovery R3-6

IMPORTANT: 
- Always provide both resistance AND target speed for optimal training guidance
- STRICTLY follow the ${goal.toUpperCase()} goal requirements - do NOT switch to HIIT unless goal is HIIT
- For CASUAL mode: Use gentle resistance R3-8, comfortable speeds 15-25km/h, avoid "HIIT interval" advice

RESPONSE FORMAT (IMPORTANT):
Return ONLY valid JSON in this exact format:
{"resistance": 12, "targetSpeed": 28, "advice": "Start hill climb interval", "action": "Climb!"}

Rules:
- Use double quotes only
- No trailing commas
- Numbers without quotes
- Keep advice under 80 characters and match the selected goal
- Action should be short (1-2 words + !)

Action examples for ${goal.toUpperCase()}: ${
      goal === "casual"
        ? '"Cruise!" "Relax!" "Gentle!" "Easy!"'
        : goal === "hiit"
        ? '"Interval!" "Sprint!" "Push!" "Recover!"'
        : goal === "endurance"
        ? '"Steady!" "Sustain!" "Build!" "Maintain!"'
        : goal === "weight_loss"
        ? '"Burn!" "Steady!" "Zone!" "Maintain!"'
        : goal === "recovery"
        ? '"Easy!" "Gentle!" "Rest!" "Relax!"'
        : goal === "strength"
        ? '"Power!" "Climb!" "Strong!" "Build!"'
        : goal === "sprint"
        ? '"Fast!" "Sprint!" "Speed!" "Quick!"'
        : '"Interval!" "Recovery!" "Climb!" "Sprint!" "Cruise!" "Cool down!"'
    }`;
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
      }/32`
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
      } | Resistance: ${point.resistance}/32`
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
- ENDURANCE: Long steady rides, moderate resistance (R8-15), HR 120-140
- HIIT: High intensity intervals (R12-18), alternating with recovery
- STRENGTH: High resistance hill climbs (R14-32), muscle building
- RECOVERY: Easy spinning, low resistance (R1-6), HR 90-110
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
      "targetResistance": {"min": 1-32, "max": 1-32},
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
