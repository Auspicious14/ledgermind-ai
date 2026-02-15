// src/core/anomaly.ts

import type { DailyRevenue, Anomaly, AnomalyDetectionResult } from '@/types';

/**
 * Calculates mean (average) of an array of numbers
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculates standard deviation of an array of numbers
 */
function calculateStandardDeviation(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
  
  return Math.sqrt(variance);
}

/**
 * Calculates z-score for a value
 * z-score = (value - mean) / standard deviation
 */
function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Determines anomaly severity based on z-score magnitude
 */
function determineSeverity(zScore: number): 'high' | 'medium' | 'low' {
  const absZ = Math.abs(zScore);
  
  if (absZ >= 3) return 'high';
  if (absZ >= 2.5) return 'medium';
  return 'low';
}

/**
 * Generates human-readable explanation for an anomaly
 */
function generateExplanation(
  date: string,
  revenue: number,
  mean: number,
  type: 'spike' | 'drop',
  severity: 'high' | 'medium' | 'low'
): string {
  const percentDiff = Math.abs(((revenue - mean) / mean) * 100).toFixed(1);
  const direction = type === 'spike' ? 'higher' : 'lower';
  
  const severityText = {
    high: 'significantly',
    medium: 'notably',
    low: 'moderately',
  }[severity];

  const dateObj = new Date(date);
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  return `Revenue on ${dayOfWeek}, ${dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })} was ${severityText} ${direction} than average (${percentDiff}% deviation). This may indicate ${
    type === 'spike' 
      ? 'exceptional sales performance, promotion impact, or seasonal demand' 
      : 'operational issues, reduced traffic, or external factors'
  }.`;
}

/**
 * Detects anomalies in daily revenue using z-score method
 * 
 * @param dailyRevenue - Array of daily revenue data
 * @param threshold - Z-score threshold for anomaly detection (default: 2.0)
 * @returns Anomaly detection results including detected anomalies and statistics
 */
export function detectAnomalies(
  dailyRevenue: DailyRevenue[],
  threshold: number = 2.0
): AnomalyDetectionResult {
  if (dailyRevenue.length === 0) {
    return {
      anomalies: [],
      mean: 0,
      stdDev: 0,
      threshold,
    };
  }

  // Extract revenue values
  const revenues = dailyRevenue.map(day => day.revenue);
  
  // Calculate statistics
  const mean = calculateMean(revenues);
  const stdDev = calculateStandardDeviation(revenues, mean);

  // Detect anomalies
  const anomalies: Anomaly[] = [];

  for (const day of dailyRevenue) {
    const zScore = calculateZScore(day.revenue, mean, stdDev);
    const absZScore = Math.abs(zScore);

    // Check if beyond threshold
    if (absZScore >= threshold) {
      const type: 'spike' | 'drop' = zScore > 0 ? 'spike' : 'drop';
      const severity = determineSeverity(zScore);
      const deviation = day.revenue - mean;

      anomalies.push({
        date: day.date,
        revenue: day.revenue,
        expectedRevenue: parseFloat(mean.toFixed(2)),
        deviation: parseFloat(deviation.toFixed(2)),
        zScore: parseFloat(zScore.toFixed(2)),
        severity,
        type,
        explanation: generateExplanation(day.date, day.revenue, mean, type, severity),
      });
    }
  }

  // Sort anomalies by severity and absolute z-score
  anomalies.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    
    if (severityDiff !== 0) return severityDiff;
    return Math.abs(b.zScore) - Math.abs(a.zScore);
  });

  return {
    anomalies,
    mean: parseFloat(mean.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    threshold,
  };
}

/**
 * Filters anomalies by severity
 */
export function filterAnomaliesBySeverity(
  anomalies: Anomaly[],
  severity: 'high' | 'medium' | 'low'
): Anomaly[] {
  const severityOrder = { high: 3, medium: 2, low: 1 };
  const minSeverity = severityOrder[severity];
  
  return anomalies.filter(a => severityOrder[a.severity] >= minSeverity);
}

/**
 * Groups anomalies by type
 */
export function groupAnomaliesByType(anomalies: Anomaly[]): {
  spikes: Anomaly[];
  drops: Anomaly[];
} {
  return {
    spikes: anomalies.filter(a => a.type === 'spike'),
    drops: anomalies.filter(a => a.type === 'drop'),
  };
}

/**
 * Calculates anomaly frequency over time
 */
export function calculateAnomalyFrequency(
  anomalies: Anomaly[],
  totalDays: number
): {
  frequency: number; // Anomalies per day
  percentage: number; // Percentage of days with anomalies
} {
  if (totalDays === 0) {
    return { frequency: 0, percentage: 0 };
  }

  const frequency = anomalies.length / totalDays;
  const percentage = (anomalies.length / totalDays) * 100;

  return {
    frequency: parseFloat(frequency.toFixed(4)),
    percentage: parseFloat(percentage.toFixed(2)),
  };
}

/**
 * Detects consecutive anomalies (potential patterns)
 */
export function detectAnomalyPatterns(anomalies: Anomaly[]): {
  consecutiveStreaks: Array<{
    startDate: string;
    endDate: string;
    length: number;
    type: 'spike' | 'drop';
  }>;
} {
  if (anomalies.length === 0) {
    return { consecutiveStreaks: [] };
  }

  const sorted = [...anomalies].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const streaks: Array<{
    startDate: string;
    endDate: string;
    length: number;
    type: 'spike' | 'drop';
  }> = [];

  let currentStreak: Anomaly[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    
    const prevDate = new Date(prev.date);
    const currDate = new Date(curr.date);
    const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    // Check if consecutive (within 2 days) and same type
    if (dayDiff <= 2 && prev.type === curr.type) {
      currentStreak.push(curr);
    } else {
      // Save streak if it's 2+ days
      if (currentStreak.length >= 2) {
        streaks.push({
          startDate: currentStreak[0].date,
          endDate: currentStreak[currentStreak.length - 1].date,
          length: currentStreak.length,
          type: currentStreak[0].type,
        });
      }
      currentStreak = [curr];
    }
  }

  // Check final streak
  if (currentStreak.length >= 2) {
    streaks.push({
      startDate: currentStreak[0].date,
      endDate: currentStreak[currentStreak.length - 1].date,
      length: currentStreak.length,
      type: currentStreak[0].type,
    });
  }

  return { consecutiveStreaks: streaks };
}