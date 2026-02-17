// src/app/api/analytics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { computeAnalytics } from '@/core/analytics';
import { forecastRevenue } from '@/core/forecasting';
import { detectAnomalies } from '@/core/anomaly';
import { Transaction } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const userId = 'demo-user-1';

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }
    
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId,
      },
    });
    
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }
    
    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }
    
    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        businessId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      orderBy: {
        date: 'asc',
      },
    });
    
    if (transactions.length === 0) {
      return NextResponse.json({
        error: 'No transactions found for this business',
        message: 'Please upload transaction data first',
      }, { status: 404 });
    }
    
    // Detect anomalies first (needed for health score)
    const anomalyResult = detectAnomalies(
      transactions.map((t: any) => ({
        date: t.date.toISOString().split('T')[0],
        revenue: t.revenue,
        cost: t.cost,
        profit: t.revenue - t.cost,
      }))
    );
    
    // Compute analytics
    const analytics = computeAnalytics(
      transactions.map((t: any) => ({
        id: t.id,
        businessId: t.businessId,
        date: t.date,
        productName: t.productName,
        category: t.category ?? undefined,
        quantity: t.quantity,
        revenue: t.revenue,
        cost: t.cost,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      anomalyResult.anomalies.length
    );
    
    // Generate forecast
    const forecast = forecastRevenue(analytics.dailyRevenue, 30);
    
    // Calculate revenue concentration
    const revenueConcentration = {
      topProductShare: analytics.topProducts[0]?.totalRevenue / analytics.totalRevenue || 0,
      top3ProductShare: analytics.topProducts.slice(0, 3)
        .reduce((sum, p) => sum + p.totalRevenue, 0) / analytics.totalRevenue,
    };
    
    // Calculate trend
    const recentRevenue = analytics.monthlyRevenue.slice(-3);
    const trendAnalysis = {
      recentTrend: forecast.trend,
      growthRate: recentRevenue.length >= 2
        ? (recentRevenue[recentRevenue.length - 1].revenue - recentRevenue[0].revenue) / recentRevenue[0].revenue
        : 0,
    };
    
    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
      },
      period: {
        startDate: transactions[0].date,
        endDate: transactions[transactions.length - 1].date,
        totalDays: analytics.dailyRevenue.length,
      },
      analytics,
      forecast,
      anomalies: anomalyResult,
      metrics: {
        totalRevenue: analytics.totalRevenue,
        totalProfit: analytics.totalProfit,
        profitMargin: analytics.profitMargin,
        healthScore: analytics.healthScore,
        revenueConcentration,
        trendAnalysis,
        anomalyCount: anomalyResult.anomalies.length,
        forecastTrend: forecast.trend,
      },
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to compute analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
