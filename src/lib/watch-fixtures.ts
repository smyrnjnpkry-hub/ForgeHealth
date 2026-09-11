import type { WatchImportResult, DaySummary, Exercise, HeartRateReading, SleepStage, MindfulnessSession, FoodEntry, WaterIntake, BodyMeasurement } from "./samsung-health-import";

/**
 * Generate realistic Samsung Health sample data for the last 30 days
 */
export function generateSampleWatchData(): WatchImportResult {
  const days: DaySummary[] = [];
  const bodyMeasurements: BodyMeasurement[] = [];
  const now = new Date("2026-09-11T06:30:00.000Z");

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Generate varied step counts (6k-14k range)
    const steps = Math.floor(6000 + Math.random() * 8000);
    const distanceMeters = Math.floor(steps * 0.75); // ~0.75m per step

    // Generate exercises (some days have multiple)
    const exercises = generateExercises(date, dateStr);
    const activeMinutes = exercises.reduce((sum, ex) => sum + ex.durationMinutes, 0);
    const activeCalories = exercises.reduce((sum, ex) => sum + (ex.calories || 0), 0);

    // Heart rate readings throughout the day
    const heartRateReadings = generateHeartRateReadings(date);
    const heartRateBpms = heartRateReadings.map(r => r.bpm);
    const avgHr = Math.floor(heartRateBpms.reduce((s, b) => s + b, 0) / heartRateBpms.length);

    // Sleep data
    const sleepData = generateSleepData(date);

    // Mindfulness sessions (some days)
    const mindfulness = generateMindfulness(date, dateStr);

    // Food entries
    const food = generateFoodEntries(date, dateStr);

    // Water intake
    const water = generateWaterIntake(date);

    days.push({
      date: dateStr,
      steps,
      activeCalories,
      activeMinutes,
      distanceMeters,
      heartRate: {
        avg: avgHr,
        min: Math.min(...heartRateBpms),
        max: Math.max(...heartRateBpms),
        latest: heartRateBpms[heartRateBpms.length - 1],
        readings: heartRateReadings,
      },
      sleep: sleepData,
      stress: {
        avg: Math.floor(30 + Math.random() * 30),
        max: Math.floor(50 + Math.random() * 30),
      },
      exercises,
      mindfulness,
      food,
      water,
    });

    // Body measurements (weekly)
    if (i % 7 === 0) {
      bodyMeasurements.push({
        timestamp: date.getTime() + 8 * 3600000,
        weight: 75 + Math.random() * 2 - 1,
        bmi: 23.5 + Math.random() * 0.5,
        bodyFat: 18 + Math.random() * 2,
        muscleMass: 32 + Math.random() * 1,
        boneMass: 3.2 + Math.random() * 0.1,
      });
    }
  }

  return {
    days,
    importedAt: now.getTime(),
    sourceFiles: ["sample-data.csv"],
    bodyMeasurements,
  };
}
function generateExercises(date: Date, dateStr: string): Exercise[] {
  const exercises: Exercise[] = [];
  const exerciseChance = Math.random();
  
  if (exerciseChance > 0.3) {
    const types = ["Running", "Walking", "Cycling", "Swimming", "Hiking"];
    const numExercises = exerciseChance > 0.8 ? 2 : 1;
    
    for (let e = 0; e < numExercises; e++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const duration = Math.floor(20 + Math.random() * 60);
      const startTime = date.getTime() + (8 + e * 6) * 3600000;
      
      exercises.push({
        id: `ex-${dateStr}-${e}`,
        type,
        startTime,
        durationMinutes: duration,
        distanceMeters: type === "Walking" ? duration * 80 : type === "Running" ? duration * 160 : type === "Cycling" ? duration * 300 : undefined,
        calories: Math.floor(duration * (type === "Running" ? 10 : type === "Cycling" ? 8 : 5)),
        avgHeartRate: Math.floor(120 + Math.random() * 40),
        maxHeartRate: Math.floor(160 + Math.random() * 20),
      });
    }
  }
  return exercises;
}

function generateHeartRateReadings(date: Date): HeartRateReading[] {
  const readings: HeartRateReading[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const timestamp = date.getTime() + h * 3600000 + m * 60000;
      const baseRate = h >= 22 || h < 7 ? 55 + Math.random() * 15 : 70 + Math.random() * 20;
      readings.push({
        timestamp,
        bpm: Math.floor(baseRate),
      });
    }
  }
  return readings;
}

function generateSleepData(date: Date) {
  const sleepDuration = Math.floor(360 + Math.random() * 180);
  const sleepScore = Math.floor(70 + Math.random() * 25);
  const sleepEfficiency = Math.floor(85 + Math.random() * 10);
  
  const stages: SleepStage[] = [
    { stage: "awake", durationMinutes: Math.floor(sleepDuration * 0.05) },
    { stage: "light", durationMinutes: Math.floor(sleepDuration * 0.50) },
    { stage: "deep", durationMinutes: Math.floor(sleepDuration * 0.25) },
    { stage: "rem", durationMinutes: Math.floor(sleepDuration * 0.20) },
  ];

  const sleepStart = date.getTime() + 23 * 3600000;
  const sleepEnd = sleepStart + sleepDuration * 60000;

  return {
    durationMinutes: sleepDuration,
    score: sleepScore,
    efficiency: sleepEfficiency,
    stages,
    startTime: sleepStart,
    endTime: sleepEnd,
  };
}
function generateMindfulness(date: Date, dateStr: string): MindfulnessSession[] {
  const sessions: MindfulnessSession[] = [];
  if (Math.random() > 0.6) {
    sessions.push({
      id: `mind-${dateStr}`,
      timestamp: date.getTime() + 7 * 3600000,
      durationMinutes: Math.floor(5 + Math.random() * 20),
      type: Math.random() > 0.5 ? "Meditation" : "Breathing",
    });
  }
  return sessions;
}

function generateFoodEntries(date: Date, dateStr: string): FoodEntry[] {
  const food: FoodEntry[] = [
    {
      id: `food-${dateStr}-breakfast`,
      timestamp: date.getTime() + 7.5 * 3600000,
      mealType: "breakfast",
      calories: Math.floor(300 + Math.random() * 200),
      protein: Math.floor(15 + Math.random() * 15),
      carbs: Math.floor(40 + Math.random() * 30),
      fat: Math.floor(10 + Math.random() * 10),
      name: "Breakfast",
    },
    {
      id: `food-${dateStr}-lunch`,
      timestamp: date.getTime() + 12.5 * 3600000,
      mealType: "lunch",
      calories: Math.floor(500 + Math.random() * 300),
      protein: Math.floor(25 + Math.random() * 20),
      carbs: Math.floor(50 + Math.random() * 40),
      fat: Math.floor(15 + Math.random() * 15),
      name: "Lunch",
    },
    {
      id: `food-${dateStr}-dinner`,
      timestamp: date.getTime() + 19 * 3600000,
      mealType: "dinner",
      calories: Math.floor(600 + Math.random() * 300),
      protein: Math.floor(30 + Math.random() * 25),
      carbs: Math.floor(60 + Math.random() * 40),
      fat: Math.floor(20 + Math.random() * 15),
      name: "Dinner",
    },
  ];

  if (Math.random() > 0.5) {
    food.push({
      id: `food-${dateStr}-snack`,
      timestamp: date.getTime() + 15 * 3600000,
      mealType: "snack",
      calories: Math.floor(100 + Math.random() * 150),
      protein: Math.floor(5 + Math.random() * 10),
      carbs: Math.floor(20 + Math.random() * 15),
      fat: Math.floor(5 + Math.random() * 8),
      name: "Snack",
    });
  }
  return food;
}

function generateWaterIntake(date: Date): WaterIntake[] {
  const water: WaterIntake[] = [];
  const numWaterIntakes = Math.floor(6 + Math.random() * 4);
  for (let w = 0; w < numWaterIntakes; w++) {
    water.push({
      timestamp: date.getTime() + (7 + w * 1.5) * 3600000,
      amountMl: 250,
    });
  }
  return water;
}


