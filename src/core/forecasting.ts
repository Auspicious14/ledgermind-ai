// src/core/forecasting.ts

import type { DailyRevenue, ForecastPoint, ForecastResult } from '@/types';

/**
 * Linear regression calculation
 * Returns slope (m) and intercept (b) for y = mx + b
 */
function calculateLinearRegression(data: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = data.length;
  
  if (n === 0) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  // Calculate means
  const meanX = data.reduce((sum, point) => sum + point.x, 0) / n;
  const meanY = data.reduce((sum, point) => sum + point.y, 0) / n;

  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;
  
  for (const point of data) {
    const xDiff = point.x - meanX;
    const yDiff = point.y - meanY;
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;

  // Calculate R² (coefficient of determination)
  let ssRes = 0; // Sum of squares of residuals
  let ssTot = 0; // Total sum of squares
  
  for (const point of data) {
    const predicted = slope * point.x + intercept;
    ssRes += Math.pow(point.y - predicted, 2);
    ssTot += Math.pow(point.y - meanY, 2);
  }

  const r2 = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

  return {
    slope: parseFloat(slope.toFixed(4)),
    intercept: parseFloat(intercept.toFixed(4)),
    r2: parseFloat(Math.max(0, r2).toFixed(4)), // R² shouldn't be negative
  };
}

/**
 * Calculate standard error for confidence intervals
 */
function calculateStandardError(
  data: { x: number; y: number }[],
  slope: number,
  intercept: number
): number {
  const n = data.length;
  if (n <= 2) return 0;

  let sumSquaredErrors = 0;
  
  for (const point of data) {
    const predicted = slope * point.x + intercept;
    sumSquaredErrors += Math.pow(point.y - predicted, 2);
  }

  const variance = sumSquaredErrors / (n - 2);
  return Math.sqrt(variance);
}

/**
 * Determines trend direction based on slope and R²
 */
function determineTrend(slope: number, r2: number): 'increasing' | 'decreasing' | 'stable' {
  // Only call it a trend if R² is reasonably high (explains >30% variance)
  if (r2 < 0.3) {
    return 'stable';
  }

  const threshold = 0.5; // Daily change threshold
  
  if (slope > threshold) {
    return 'increasing';
  } else if (slope < -threshold) {
    return 'decreasing';
  } else {
    return 'stable';
  }
}

/**
 * Forecasts revenue for the next N days using linear regression
 */
export function forecastRevenue(
  dailyRevenue: DailyRevenue[],
  daysToForecast: number = 30
): ForecastResult {
  if (dailyRevenue.length === 0) {
    return {
      forecast: [],
      slope: 0,
      intercept: 0,
      r2: 0,
      trend: 'stable',
    };
  }

  // Prepare data for regression (x = day index, y = revenue)
  const sortedData = [...dailyRevenue].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const regressionData = sortedData.map((day, index) => ({
    x: index,
    y: day.revenue,
  }));

  // Calculate regression
  const { slope, intercept, r2 } = calculateLinearRegression(regressionData);
  const standardError = calculateStandardError(regressionData, slope, intercept);
  
  // Generate forecast
  const lastDate = new Date(sortedData[sortedData.length - 1].date);
  const forecast: ForecastPoint[] = [];

  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(lastDate.getDate() + i);
    
    const x = sortedData.length + i - 1;
    const predicted = slope * x + intercept;
    
    // 95% confidence interval (approximately ±2 standard errors)
    const marginOfError = 1.96 * standardError;
    
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      predicted: Math.max(0, parseFloat(predicted.toFixed(2))), // Revenue can't be negative
      confidence: {
        lower: Math.max(0, parseFloat((predicted - marginOfError).toFixed(2))),
        upper: parseFloat((predicted + marginOfError).toFixed(2)),
      },
    });
  }

  const trend = determineTrend(slope, r2);

  return {
    forecast,
    slope,
    intercept,
    r2,
    trend,
  };
}

/**
 * Calculates moving average for smoothing data
 */
export function calculateMovingAverage(
  dailyRevenue: DailyRevenue[],
  windowSize: number = 7
): DailyRevenue[] {
  const sorted = [...dailyRevenue].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return sorted.map((day, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = sorted.slice(start, index + 1);
    
    const avgRevenue = window.reduce((sum, d) => sum + d.revenue, 0) / window.length;
    const avgCost = window.reduce((sum, d) => sum + d.cost, 0) / window.length;
    const avgProfit = avgRevenue - avgCost;

    return {
      date: day.date,
      revenue: parseFloat(avgRevenue.toFixed(2)),
      cost: parseFloat(avgCost.toFixed(2)),
      profit: parseFloat(avgProfit.toFixed(2)),
    };
  });
}

/**
 * Calculates forecast accuracy by comparing predictions to actual values
 */
export function calculateForecastAccuracy(
  actual: DailyRevenue[],
  predictions: ForecastPoint[]
): {
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
} {
  if (actual.length === 0 || predictions.length === 0) {
    return { mape: 0, rmse: 0 };
  }

  const actualMap = new Map(actual.map(d => [d.date, d.revenue]));
  let totalPercentError = 0;
  let totalSquaredError = 0;
  let count = 0;

  for (const pred of predictions) {
    const actualValue = actualMap.get(pred.date);
    if (actualValue !== undefined && actualValue !== 0) {
      const percentError = Math.abs((actualValue - pred.predicted) / actualValue);
      totalPercentError += percentError;
      
      const squaredError = Math.pow(actualValue - pred.predicted, 2);
      totalSquaredError += squaredError;
      
      count++;
    }
  }

  const mape = count > 0 ? (totalPercentError / count) : 0;
  const rmse = count > 0 ? Math.sqrt(totalSquaredError / count) : 0;

  return {
    mape: parseFloat(mape.toFixed(4)),
    rmse: parseFloat(rmse.toFixed(2)),
  };
}