import JSZip from "jszip";

// Exercise types matching Samsung Health categories
export interface Exercise {
  id: string;
  type: string; // "Running", "Walking", "Cycling", etc.
  startTime: number; // timestamp
  durationMinutes: number;
  distanceMeters?: number;
  calories?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
}

// Sleep stage breakdown
export interface SleepStage {
  stage: "awake" | "light" | "deep" | "rem";
  durationMinutes: number;
}

// Heart rate reading with timestamp
export interface HeartRateReading {
  timestamp: number;
  bpm: number;
}

// Mindfulness/meditation session
export interface MindfulnessSession {
  id: string;
  timestamp: number;
  durationMinutes: number;
  type?: string; // "Meditation", "Breathing", etc.
}

// Food/nutrition entry
export interface FoodEntry {
  id: string;
  timestamp: number;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein?: number; // grams
  carbs?: number;
  fat?: number;
  name?: string;
}

// Body composition measurement
export interface BodyMeasurement {
  timestamp: number;
  weight?: number; // kg
  bmi?: number;
  bodyFat?: number; // percentage
  muscleMass?: number; // kg
  boneMass?: number; // kg
}

// Water intake
export interface WaterIntake {
  timestamp: number;
  amountMl: number;
}

export interface DaySummary {
  date: string; // YYYY-MM-DD
  steps: number;
  activeCalories: number;
  activeMinutes: number;
  distanceMeters: number;
  heartRate?: {
    avg: number;
    min: number;
    max: number;
    latest: number;
    readings?: HeartRateReading[];
  };
  sleep?: {
    durationMinutes: number;
    score?: number;
    efficiency?: number; // percentage
    stages?: SleepStage[];
    startTime?: number;
    endTime?: number;
  };
  stress?: {
    avg: number;
    max: number;
  };
  exercises?: Exercise[];
  mindfulness?: MindfulnessSession[];
  food?: FoodEntry[];
  water?: WaterIntake[];
}

export interface WatchImportResult {
  days: DaySummary[];
  importedAt: number;
  sourceFiles: string[];
  bodyMeasurements?: BodyMeasurement[];
}

interface CSVRow {
  [key: string]: string;
}

/**
 * Parse Samsung Health export ZIP.
 * Resilient to different filename patterns and column aliases.
 */
export async function parseZip(file: File): Promise<WatchImportResult> {
  const zip = await JSZip.loadAsync(file);
  const sourceFiles: string[] = [];
  const dayMap = new Map<string, DaySummary>();

  // Extract all CSV files
  const csvFiles: Array<{ name: string; content: string }> = [];
  for (const [name, zipEntry] of Object.entries(zip.files)) {
    if (!zipEntry.dir && name.toLowerCase().endsWith(".csv")) {
      sourceFiles.push(name);
      const content = await zipEntry.async("text");
      csvFiles.push({ name, content });
    }
  }

  // Process each CSV
  for (const { name, content } of csvFiles) {
    const rows = parseCSV(content);
    if (rows.length === 0) continue;

    const lowerName = name.toLowerCase();

    // Steps data
    if (lowerName.includes("step") || lowerName.includes("pedometer")) {
      processStepsData(rows, dayMap);
    }

    // Heart rate data
    if (lowerName.includes("heart")) {
      processHeartRateData(rows, dayMap);
    }

    // Sleep data
    if (lowerName.includes("sleep")) {
      processSleepData(rows, dayMap);
    }

    // Stress data
    if (lowerName.includes("stress")) {
      processStressData(rows, dayMap);
    }

    // Exercise data (for active calories/minutes/distance)
    if (lowerName.includes("exercise") || lowerName.includes("workout")) {
      processExerciseData(rows, dayMap);
    }
  }

  // Convert map to sorted array (most recent first)
  const days = Array.from(dayMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return {
    days,
    importedAt: Date.now(),
    sourceFiles,
  };
}

/**
 * Parse CSV with flexible header detection.
 * Skips junk metadata rows until we find a real header.
 */
function parseCSV(content: string): CSVRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Find header row (contains common Samsung Health columns)
  let headerIndex = 0;
  const headerPatterns = [
    "start_time",
    "update_time",
    "create_time",
    "day_time",
    "step",
    "count",
    "heart_rate",
    "calorie",
    "distance",
    "sleep",
    "stress",
  ];

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].toLowerCase();
    if (headerPatterns.some((p) => line.includes(p))) {
      headerIndex = i;
      break;
    }
  }

  const headers = parseCSVLine(lines[headerIndex]);
  const rows: CSVRow[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: CSVRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

function extractDate(row: CSVRow): string | null {
  // Try multiple date column aliases
  const dateAliases = [
    "start_time",
    "day_time",
    "create_time",
    "update_time",
    "date",
    "time",
  ];

  for (const alias of dateAliases) {
    const value = row[alias];
    if (!value) continue;

    // Parse timestamp (milliseconds or ISO string)
    let timestamp: number;
    if (/^\d+$/.test(value)) {
      timestamp = parseInt(value, 10);
    } else {
      timestamp = new Date(value).getTime();
    }

    if (!isNaN(timestamp) && timestamp > 0) {
      // Convert to YYYY-MM-DD
      const date = new Date(timestamp);
      return date.toISOString().split("T")[0];
    }
  }

  return null;
}

function getOrCreateDay(date: string, dayMap: Map<string, DaySummary>): DaySummary {
  if (!dayMap.has(date)) {
    dayMap.set(date, {
      date,
      steps: 0,
      activeCalories: 0,
      activeMinutes: 0,
      distanceMeters: 0,
    });
  }
  return dayMap.get(date)!;
}

function processStepsData(rows: CSVRow[], dayMap: Map<string, DaySummary>) {
  for (const row of rows) {
    const date = extractDate(row);
    if (!date) continue;

    const day = getOrCreateDay(date, dayMap);

    // Try multiple step column aliases
    const stepAliases = ["step_count", "count", "step", "steps", "daily_step"];
    for (const alias of stepAliases) {
      const value = parseFloat(row[alias]);
      if (!isNaN(value) && value > 0) {
        day.steps = Math.max(day.steps, value);
        break;
      }
    }

    // Distance
    const distanceAliases = ["distance", "distance_meters", "total_distance"];
    for (const alias of distanceAliases) {
      const value = parseFloat(row[alias]);
      if (!isNaN(value) && value > 0) {
        day.distanceMeters = Math.max(day.distanceMeters, value);
        break;
      }
    }

    // Calories
    const calorieAliases = ["calorie", "active_calorie", "burned_calorie"];
    for (const alias of calorieAliases) {
      const value = parseFloat(row[alias]);
      if (!isNaN(value) && value > 0) {
        day.activeCalories = Math.max(day.activeCalories, value);
        break;
      }
    }
  }
}

function processHeartRateData(rows: CSVRow[], dayMap: Map<string, DaySummary>) {
  const dailyRates = new Map<string, number[]>();

  for (const row of rows) {
    const date = extractDate(row);
    if (!date) continue;

    const hrAliases = ["heart_rate", "bpm", "rate"];
    for (const alias of hrAliases) {
      const value = parseFloat(row[alias]);
      if (!isNaN(value) && value > 30 && value < 250) {
        if (!dailyRates.has(date)) dailyRates.set(date, []);
        dailyRates.get(date)!.push(value);
        break;
      }
    }
  }

  // Aggregate daily heart rate stats
  for (const [date, rates] of dailyRates) {
    if (rates.length === 0) continue;

    const day = getOrCreateDay(date, dayMap);
    const sorted = [...rates].sort((a, b) => a - b);

    day.heartRate = {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: Math.round(rates.reduce((sum, r) => sum + r, 0) / rates.length),
      latest: rates[rates.length - 1],
    };
  }
}

function processSleepData(rows: CSVRow[], dayMap: Map<string, DaySummary>) {
  for (const row of rows) {
    const date = extractDate(row);
    if (!date) continue;

    const day = getOrCreateDay(date, dayMap);

    // Sleep duration (try minutes or milliseconds)
    const durationAliases = ["sleep_duration", "duration", "total_sleep", "sleep_time"];
    for (const alias of durationAliases) {
      const value = parseFloat(row[alias]);
      if (!isNaN(value) && value > 0) {
        // If value is huge, assume milliseconds
        const minutes = value > 1000 ? Math.round(value / 60000) : value;
        if (minutes < 1440) {
          // Less than 24 hours
          day.sleep = { durationMinutes: minutes };
        }
        break;
      }
    }

    // Sleep score (0-100)
    const scoreAliases = ["sleep_score", "score", "quality"];
    for (const alias of scoreAliases) {
      const value = parseFloat(row[alias]);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        if (!day.sleep) day.sleep = { durationMinutes: 0 };
        day.sleep.score = Math.round(value);
        break;
      }
    }
  }
}

function processStressData(rows: CSVRow[], dayMap: Map<string, DaySummary>) {
  const dailyStress = new Map<string, number[]>();

  for (const row of rows) {
    const date = extractDate(row);
    if (!date) continue;

    const stressAliases = ["stress_level", "stress", "level"];
    for (const alias of stressAliases) {
      const value = parseFloat(row[alias]);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        if (!dailyStress.has(date)) dailyStress.set(date, []);
        dailyStress.get(date)!.push(value);
        break;
      }
    }
  }

  // Aggregate daily stress stats
  for (const [date, levels] of dailyStress) {
    if (levels.length === 0) continue;

    const day = getOrCreateDay(date, dayMap);
    day.stress = {
      avg: Math.round(levels.reduce((sum, l) => sum + l, 0) / levels.length),
      max: Math.max(...levels),
    };
  }
}

function processExerciseData(rows: CSVRow[], dayMap: Map<string, DaySummary>) {
  for (const row of rows) {
    const date = extractDate(row);
    if (!date) continue;

    const day = getOrCreateDay(date, dayMap);

    // Active minutes
    const minuteAliases = ["duration", "active_time", "exercise_time"];
    for (const alias of minuteAliases) {
      const value = parseFloat(row[alias]);
      if (!isNaN(value) && value > 0) {
        // If value is huge, assume milliseconds
        const minutes = value > 1000 ? Math.round(value / 60000) : value;
        day.activeMinutes += minutes;
        break;
      }
    }

    // Calories
    const calorieAliases = ["calorie", "calories_burned", "active_calorie"];
    for (const alias of calorieAliases) {
      const value = parseFloat(row[alias]);
      if (!isNaN(value) && value > 0) {
        day.activeCalories += value;
        break;
      }
    }

    // Distance
    const distanceAliases = ["distance", "total_distance"];
    for (const alias of distanceAliases) {
      const value = parseFloat(row[alias]);
      if (!isNaN(value) && value > 0) {
        day.distanceMeters += value;
        break;
      }
    }
  }
}

