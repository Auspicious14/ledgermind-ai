// src/types/index.ts

export interface Transaction {
  id: string;
  businessId: string;
  date: Date;
  productName: string;
  category?: string;
  quantity: number;
  revenue: number;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CSVTransaction {
  date: string;
  productName: string;
  category?: string;
  quantity: number | string;
  revenue: number | string;
  cost: number | string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
}

export interface ProductPerformance {
  productName: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  quantity: number;
  transactionCount: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  healthScore: number;
  dailyRevenue: DailyRevenue[];
  monthlyRevenue: MonthlyRevenue[];
  topProducts: ProductPerformance[];
  bottomProducts: ProductPerformance[];
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  confidence?: {
    lower: number;
    upper: number;
  };
}

export interface ForecastResult {
  forecast: ForecastPoint[];
  slope: number;
  intercept: number;
  r2: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface Anomaly {
  date: string;
  revenue: number;
  expectedRevenue: number;
  deviation: number;
  zScore: number;
  severity: 'high' | 'medium' | 'low';
  type: 'spike' | 'drop';
  explanation: string;
}

export interface AnomalyDetectionResult {
  anomalies: Anomaly[];
  mean: number;
  stdDev: number;
  threshold: number;
}

export interface MetricsForInsight {
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  healthScore: number;
  revenueConcentration: {
    topProductShare: number;
    top3ProductShare: number;
  };
  trendAnalysis: {
    recentTrend: 'up' | 'down' | 'stable';
    growthRate: number;
  };
  anomalyCount: number;
  forecastTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface BusinessInsight {
  category: 'revenue' | 'profitability' | 'risk' | 'opportunity' | 'warning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
}

export interface InsightEngineResult {
  insights: BusinessInsight[];
  executiveSummary: string;
  keyMetrics: Record<string, number | string>;
  generatedAt: Date;
}

export interface BusinessHealthMetrics {
  score: number;
  profitabilityScore: number;
  growthScore: number;
  stabilityScore: number;
  diversificationScore: number;
}

export interface ReportData {
  business: {
    id: string;
    name: string;
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
  analytics: AnalyticsSummary;
  forecast: ForecastResult;
  anomalies: AnomalyDetectionResult;
  insights: InsightEngineResult;
  healthMetrics: BusinessHealthMetrics;
  generatedAt: Date;
}