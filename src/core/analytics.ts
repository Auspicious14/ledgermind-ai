// src/core/analytics.ts

import type {
  Transaction,
  DailyRevenue,
  MonthlyRevenue,
  ProductPerformance,
  AnalyticsSummary,
  BusinessHealthMetrics,
} from '@/types';

/**
 * Aggregates transactions into daily revenue totals
 */
export function calculateDailyRevenue(transactions: Transaction[]): DailyRevenue[] {
  const dailyMap = new Map<string, { revenue: number; cost: number }>();

  for (const tx of transactions) {
    const dateKey = tx.date.toISOString().split('T')[0];
    const existing = dailyMap.get(dateKey) || { revenue: 0, cost: 0 };
    
    dailyMap.set(dateKey, {
      revenue: existing.revenue + tx.revenue,
      cost: existing.cost + tx.cost,
    });
  }

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: parseFloat(data.revenue.toFixed(2)),
      cost: parseFloat(data.cost.toFixed(2)),
      profit: parseFloat((data.revenue - data.cost).toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregates transactions into monthly revenue totals
 */
export function calculateMonthlyRevenue(transactions: Transaction[]): MonthlyRevenue[] {
  const monthlyMap = new Map<string, { revenue: number; cost: number }>();

  for (const tx of transactions) {
    const date = new Date(tx.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = monthlyMap.get(monthKey) || { revenue: 0, cost: 0 };
    
    monthlyMap.set(monthKey, {
      revenue: existing.revenue + tx.revenue,
      cost: existing.cost + tx.cost,
    });
  }

  return Array.from(monthlyMap.entries())
    .map(([month, data]) => {
      const profit = data.revenue - data.cost;
      const profitMargin = data.revenue > 0 ? profit / data.revenue : 0;
      
      return {
        month,
        revenue: parseFloat(data.revenue.toFixed(2)),
        cost: parseFloat(data.cost.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(4)),
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Calculates performance metrics for each product
 */
export function calculateProductPerformance(transactions: Transaction[]): ProductPerformance[] {
  const productMap = new Map<string, {
    revenue: number;
    cost: number;
    quantity: number;
    count: number;
  }>();

  for (const tx of transactions) {
    const existing = productMap.get(tx.productName) || {
      revenue: 0,
      cost: 0,
      quantity: 0,
      count: 0,
    };
    
    productMap.set(tx.productName, {
      revenue: existing.revenue + tx.revenue,
      cost: existing.cost + tx.cost,
      quantity: existing.quantity + tx.quantity,
      count: existing.count + 1,
    });
  }

  return Array.from(productMap.entries())
    .map(([productName, data]) => {
      const profit = data.revenue - data.cost;
      const profitMargin = data.revenue > 0 ? profit / data.revenue : 0;
      
      return {
        productName,
        totalRevenue: parseFloat(data.revenue.toFixed(2)),
        totalCost: parseFloat(data.cost.toFixed(2)),
        totalProfit: parseFloat(profit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(4)),
        quantity: parseFloat(data.quantity.toFixed(2)),
        transactionCount: data.count,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Gets top N products by revenue
 */
export function getTopProducts(
  products: ProductPerformance[],
  count: number = 5
): ProductPerformance[] {
  return products.slice(0, count);
}

/**
 * Gets bottom N products by profit
 */
export function getBottomProducts(
  products: ProductPerformance[],
  count: number = 5
): ProductPerformance[] {
  return [...products]
    .sort((a, b) => a.totalProfit - b.totalProfit)
    .slice(0, count);
}

/**
 * Calculates overall business totals
 */
export function calculateTotals(transactions: Transaction[]): {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
} {
  const totals = transactions.reduce(
    (acc, tx) => ({
      revenue: acc.revenue + tx.revenue,
      cost: acc.cost + tx.cost,
    }),
    { revenue: 0, cost: 0 }
  );

  const profit = totals.revenue - totals.cost;
  const profitMargin = totals.revenue > 0 ? profit / totals.revenue : 0;

  return {
    totalRevenue: parseFloat(totals.revenue.toFixed(2)),
    totalCost: parseFloat(totals.cost.toFixed(2)),
    totalProfit: parseFloat(profit.toFixed(2)),
    profitMargin: parseFloat(profitMargin.toFixed(4)),
  };
}

/**
 * Calculates revenue concentration risk
 */
export function calculateRevenueConcentration(
  products: ProductPerformance[]
): {
  topProductShare: number;
  top3ProductShare: number;
  diversificationScore: number;
} {
  const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
  
  if (totalRevenue === 0) {
    return { topProductShare: 0, top3ProductShare: 0, diversificationScore: 1 };
  }

  const topProductShare = products[0]?.totalRevenue / totalRevenue || 0;
  const top3ProductShare = products.slice(0, 3)
    .reduce((sum, p) => sum + p.totalRevenue, 0) / totalRevenue;

  // Diversification score: 1 is perfectly diversified, 0 is highly concentrated
  const diversificationScore = 1 - top3ProductShare;

  return {
    topProductShare: parseFloat(topProductShare.toFixed(4)),
    top3ProductShare: parseFloat(top3ProductShare.toFixed(4)),
    diversificationScore: parseFloat(diversificationScore.toFixed(4)),
  };
}

/**
 * Calculates revenue growth rate
 */
export function calculateGrowthRate(monthlyRevenue: MonthlyRevenue[]): number {
  if (monthlyRevenue.length < 2) return 0;

  const sorted = [...monthlyRevenue].sort((a, b) => a.month.localeCompare(b.month));
  const firstMonth = sorted[0];
  const lastMonth = sorted[sorted.length - 1];

  if (firstMonth.revenue === 0) return 0;

  const growthRate = (lastMonth.revenue - firstMonth.revenue) / firstMonth.revenue;
  return parseFloat(growthRate.toFixed(4));
}

/**
 * Calculates business health metrics
 */
export function calculateBusinessHealth(
  totals: ReturnType<typeof calculateTotals>,
  products: ProductPerformance[],
  monthlyRevenue: MonthlyRevenue[],
  anomalyCount: number
): BusinessHealthMetrics {
  const { profitMargin } = totals;
  const growthRate = calculateGrowthRate(monthlyRevenue);
  const { diversificationScore } = calculateRevenueConcentration(products);

  // Individual component scores (0-100)
  const profitabilityScore = Math.min(profitMargin * 100 * 3, 100); // 33%+ margin = 100
  const growthScore = Math.min(Math.max((growthRate + 0.5) * 100, 0), 100); // -50% to +50%
  const stabilityScore = Math.max(100 - (anomalyCount * 10), 0); // -10 per anomaly
  const diversificationScoreNormalized = diversificationScore * 100;

  // Weighted overall score
  const score = (
    profitabilityScore * 0.3 +
    growthScore * 0.25 +
    stabilityScore * 0.25 +
    diversificationScoreNormalized * 0.2
  );

  return {
    score: Math.round(Math.min(Math.max(score, 0), 100)),
    profitabilityScore: Math.round(profitabilityScore),
    growthScore: Math.round(growthScore),
    stabilityScore: Math.round(stabilityScore),
    diversificationScore: Math.round(diversificationScoreNormalized),
  };
}

/**
 * Main analytics function - computes all metrics
 */
export function computeAnalytics(
  transactions: Transaction[],
  anomalyCount: number = 0
): AnalyticsSummary {
  const totals = calculateTotals(transactions);
  const dailyRevenue = calculateDailyRevenue(transactions);
  const monthlyRevenue = calculateMonthlyRevenue(transactions);
  const products = calculateProductPerformance(transactions);
  const topProducts = getTopProducts(products, 5);
  const bottomProducts = getBottomProducts(products, 5);
  const healthMetrics = calculateBusinessHealth(totals, products, monthlyRevenue, anomalyCount);

  return {
    totalRevenue: totals.totalRevenue,
    totalCost: totals.totalCost,
    totalProfit: totals.totalProfit,
    profitMargin: totals.profitMargin,
    healthScore: healthMetrics.score,
    dailyRevenue,
    monthlyRevenue,
    topProducts,
    bottomProducts,
  };
}