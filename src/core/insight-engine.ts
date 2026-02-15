// src/core/insight-engine.ts

import type {
  MetricsForInsight,
  BusinessInsight,
  InsightEngineResult,
  ProductPerformance,
  Anomaly,
} from '@/types';

/**
 * Formats metrics into a structured prompt for LLM
 */
export function formatMetricsForLLM(metrics: MetricsForInsight): string {
  return `
You are a senior business analyst reviewing financial data for a small business. Based on the following metrics, provide actionable insights:

## Key Metrics
- Total Revenue: $${metrics.totalRevenue.toFixed(2)}
- Total Profit: $${metrics.totalProfit.toFixed(2)}
- Profit Margin: ${(metrics.profitMargin * 100).toFixed(1)}%
- Business Health Score: ${metrics.healthScore}/100

## Revenue Concentration
- Top Product Share: ${(metrics.revenueConcentration.topProductShare * 100).toFixed(1)}%
- Top 3 Products Share: ${(metrics.revenueConcentration.top3ProductShare * 100).toFixed(1)}%

## Trend Analysis
- Recent Trend: ${metrics.trendAnalysis.recentTrend}
- Growth Rate: ${(metrics.trendAnalysis.growthRate * 100).toFixed(1)}%

## Anomaly Detection
- Anomalies Detected: ${metrics.anomalyCount}

## Forecast
- Forecast Trend: ${metrics.forecastTrend}

## Instructions
Generate 4-6 business insights based on this data. For EACH insight, you MUST respond with EXACTLY this JSON structure (no extra text):

{
  "insights": [
    {
      "category": "revenue" | "profitability" | "risk" | "opportunity" | "warning",
      "priority": "high" | "medium" | "low",
      "title": "Brief title (max 8 words)",
      "description": "What the data shows (1-2 sentences)",
      "impact": "Potential business impact (1 sentence)",
      "recommendation": "Specific action to take (1-2 sentences)"
    }
  ],
  "executiveSummary": "A 2-3 sentence executive summary of the overall business health and key priorities"
}

Focus on:
1. Revenue concentration risk (if top 3 products > 70%)
2. Margin health (flag if < 20%)
3. Growth trajectory concerns or opportunities
4. Anomaly patterns that need attention
5. Forecast implications

Be specific and actionable. Avoid generic advice. Use exact numbers from the metrics.
`.trim();
}

/**
 * Calls Claude API to generate insights
 */
export async function generateInsights(
  metrics: MetricsForInsight
): Promise<InsightEngineResult> {
  const prompt = formatMetricsForLLM(metrics);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate insights from AI');
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    // Parse JSON response
    const parsed = JSON.parse(content);

    return {
      insights: parsed.insights,
      executiveSummary: parsed.executiveSummary,
      keyMetrics: {
        totalRevenue: metrics.totalRevenue,
        totalProfit: metrics.totalProfit,
        profitMargin: metrics.profitMargin,
        healthScore: metrics.healthScore,
        growthRate: metrics.trendAnalysis.growthRate,
      },
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Insight generation error:', error);

    // Fallback to deterministic insights if API fails
    return generateFallbackInsights(metrics);
  }
}

/**
 * Generates deterministic insights when AI is unavailable
 */
export function generateFallbackInsights(
  metrics: MetricsForInsight
): InsightEngineResult {
  const insights: BusinessInsight[] = [];

  // Revenue concentration risk
  if (metrics.revenueConcentration.top3ProductShare > 0.7) {
    insights.push({
      category: 'risk',
      priority: 'high',
      title: 'High Revenue Concentration Risk',
      description: `Your top 3 products account for ${(
        metrics.revenueConcentration.top3ProductShare * 100
      ).toFixed(1)}% of total revenue, creating dependency risk.`,
      impact:
        'Loss of any top product could severely impact overall business revenue.',
      recommendation:
        'Diversify product portfolio and develop new revenue streams to reduce concentration risk.',
    });
  }

  // Profit margin analysis
  if (metrics.profitMargin < 0.15) {
    insights.push({
      category: 'warning',
      priority: 'high',
      title: 'Low Profit Margin Alert',
      description: `Current profit margin of ${(metrics.profitMargin * 100).toFixed(
        1
      )}% is below healthy threshold of 15%.`,
      impact:
        'Thin margins leave little buffer for unexpected costs or market changes.',
      recommendation:
        'Review pricing strategy, negotiate better supplier terms, or reduce operational costs.',
    });
  } else if (metrics.profitMargin > 0.3) {
    insights.push({
      category: 'profitability',
      priority: 'medium',
      title: 'Strong Profit Margins',
      description: `Excellent profit margin of ${(metrics.profitMargin * 100).toFixed(
        1
      )}% indicates efficient operations.`,
      impact: 'Strong margins provide financial cushion and growth capital.',
      recommendation:
        'Maintain current efficiency while exploring reinvestment opportunities for growth.',
    });
  }

  // Growth analysis
  if (metrics.trendAnalysis.recentTrend === 'up') {
    insights.push({
      category: 'opportunity',
      priority: 'medium',
      title: 'Positive Growth Trajectory',
      description: `Revenue growing at ${(
        metrics.trendAnalysis.growthRate * 100
      ).toFixed(1)}% with upward trend.`,
      impact: 'Growth momentum creates opportunities for expansion and market share.',
      recommendation:
        'Capitalize on growth by increasing inventory, hiring capacity, or expanding marketing.',
    });
  } else if (metrics.trendAnalysis.recentTrend === 'down') {
    insights.push({
      category: 'warning',
      priority: 'high',
      title: 'Declining Revenue Trend',
      description: `Revenue declining at ${Math.abs(
        metrics.trendAnalysis.growthRate * 100
      ).toFixed(1)}% with downward trend.`,
      impact: 'Continued decline could threaten business sustainability.',
      recommendation:
        'Investigate root causes: market conditions, competition, product quality, or customer satisfaction.',
    });
  }

  // Anomaly analysis
  if (metrics.anomalyCount > 5) {
    insights.push({
      category: 'risk',
      priority: 'medium',
      title: 'Revenue Volatility Detected',
      description: `${metrics.anomalyCount} revenue anomalies detected, indicating unstable patterns.`,
      impact: 'High volatility makes forecasting and planning difficult.',
      recommendation:
        'Stabilize revenue streams through consistent marketing, pricing, and customer retention efforts.',
    });
  } else if (metrics.anomalyCount === 0) {
    insights.push({
      category: 'profitability',
      priority: 'low',
      title: 'Stable Revenue Patterns',
      description: 'No significant anomalies detected, indicating stable operations.',
      impact: 'Predictable revenue enables confident business planning.',
      recommendation:
        'Maintain operational consistency while exploring controlled growth initiatives.',
    });
  }

  // Health score analysis
  if (metrics.healthScore >= 80) {
    insights.push({
      category: 'opportunity',
      priority: 'low',
      title: 'Excellent Business Health',
      description: `Health score of ${metrics.healthScore}/100 indicates strong overall performance.`,
      impact: 'Strong position enables strategic investments and expansion.',
      recommendation:
        'Focus on sustainable growth and market leadership opportunities.',
    });
  } else if (metrics.healthScore < 50) {
    insights.push({
      category: 'warning',
      priority: 'high',
      title: 'Business Health Concerns',
      description: `Health score of ${metrics.healthScore}/100 requires immediate attention.`,
      impact: 'Low health score indicates multiple risk factors need addressing.',
      recommendation:
        'Prioritize profitability improvement, cost reduction, and revenue stabilization.',
    });
  }

  // Executive summary
  let executiveSummary = '';
  if (metrics.healthScore >= 70) {
    executiveSummary = `Business is performing well with ${(
      metrics.profitMargin * 100
    ).toFixed(1)}% profit margin and ${
      metrics.trendAnalysis.recentTrend
    } revenue trend. `;
  } else if (metrics.healthScore >= 50) {
    executiveSummary = `Business shows moderate health with room for improvement. `;
  } else {
    executiveSummary = `Business requires urgent attention across multiple areas. `;
  }

  executiveSummary += `Key priorities: ${insights
    .filter((i) => i.priority === 'high')
    .map((i) => i.title.toLowerCase())
    .join(', ')}.`;

  return {
    insights: insights.slice(0, 6), // Max 6 insights
    executiveSummary,
    keyMetrics: {
      totalRevenue: metrics.totalRevenue,
      totalProfit: metrics.totalProfit,
      profitMargin: metrics.profitMargin,
      healthScore: metrics.healthScore,
      growthRate: metrics.trendAnalysis.growthRate,
    },
    generatedAt: new Date(),
  };
}

/**
 * Prepares metrics from analytics data
 */
export function prepareMetricsForInsight(
  analytics: any,
  forecast: any,
  anomalies: any
): MetricsForInsight {
  const recentMonths = analytics.monthlyRevenue.slice(-3);
  const growthRate =
    recentMonths.length >= 2
      ? (recentMonths[recentMonths.length - 1].revenue - recentMonths[0].revenue) /
        recentMonths[0].revenue
      : 0;

  return {
    totalRevenue: analytics.totalRevenue,
    totalProfit: analytics.totalProfit,
    profitMargin: analytics.profitMargin,
    healthScore: analytics.healthScore,
    revenueConcentration: {
      topProductShare:
        analytics.topProducts[0]?.totalRevenue / analytics.totalRevenue || 0,
      top3ProductShare:
        analytics.topProducts
          .slice(0, 3)
          .reduce((sum: number, p: any) => sum + p.totalRevenue, 0) /
        analytics.totalRevenue,
    },
    trendAnalysis: {
      recentTrend: forecast.trend,
      growthRate,
    },
    anomalyCount: anomalies.anomalies.length,
    forecastTrend: forecast.trend,
  };
}