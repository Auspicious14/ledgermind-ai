// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function parseCSVDate(dateStr: string): Date {
  // Handle common date formats: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try parsing MM/DD/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0]) - 1;
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    return new Date(year, month, day);
  }
  
  throw new Error(`Invalid date format: ${dateStr}`);
}

export function calculateHealthScore(metrics: {
  profitMargin: number;
  revenueGrowth: number;
  anomalyCount: number;
  diversificationScore: number;
}): number {
  // Weighted health score calculation
  const profitScore = Math.min(metrics.profitMargin * 100, 100);
  const growthScore = Math.min(Math.max(metrics.revenueGrowth * 50 + 50, 0), 100);
  const stabilityScore = Math.max(100 - (metrics.anomalyCount * 10), 0);
  const diversificationScore = metrics.diversificationScore * 100;
  
  const healthScore = (
    profitScore * 0.3 +
    growthScore * 0.25 +
    stabilityScore * 0.25 +
    diversificationScore * 0.2
  );
  
  return Math.round(Math.min(Math.max(healthScore, 0), 100));
}

export function getDateRange(days: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return { startDate, endDate };
}

export function groupByDate<T extends { date: Date | string }>(
  items: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  
  for (const item of items) {
    const date = typeof item.date === 'string' ? item.date : item.date.toISOString().split('T')[0];
    const existing = grouped.get(date) || [];
    grouped.set(date, [...existing, item]);
  }
  
  return grouped;
}

export function calculateMovingAverage(data: number[], windowSize: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(avg);
  }
  
  return result;
}