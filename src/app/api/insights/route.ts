// src/app/api/insights/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { computeAnalytics } from '@/core/analytics';
import { forecastRevenue } from '@/core/forecasting';
import { detectAnomalies } from '@/core/anomaly';
import { generateInsights, prepareMetricsForInsight } from '@/core/insight-engine';

/**
 * GET /api/insights?businessId=xxx
 * Generates AI-powered business insights
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }
    
    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }
    
    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: { businessId },
      orderBy: { date: 'asc' },
    });
    
    if (transactions.length === 0) {
      return NextResponse.json({
        error: 'No transactions found',
        message: 'Please upload transaction data first',
      }, { status: 404 });
    }
    
    // Compute analytics
    const dailyRevenue = transactions.map((t: any) => ({
      date: t.date.toISOString().split('T')[0],
      revenue: t.revenue,
      cost: t.cost,
      profit: t.revenue - t.cost,
    }));
    
    const anomalyResult = detectAnomalies(dailyRevenue);
    const analytics = computeAnalytics(transactions as any, anomalyResult.anomalies.length);
    const forecast = forecastRevenue(analytics.dailyRevenue, 30);
    
    // Prepare metrics and generate insights
    const metrics = prepareMetricsForInsight(analytics, forecast, anomalyResult);
    const insights = await generateInsights(metrics);
    
    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
      },
      insights,
      generatedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Insights generation error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/insights
 * Generates insights from provided metrics (for manual refresh)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metrics } = body;
    
    if (!metrics) {
      return NextResponse.json(
        { error: 'Metrics are required' },
        { status: 400 }
      );
    }
    
    const insights = await generateInsights(metrics);
    
    return NextResponse.json({
      insights,
      generatedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Insights generation error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
