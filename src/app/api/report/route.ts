// src/app/api/report/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { computeAnalytics, calculateBusinessHealth } from '@/core/analytics';
import { forecastRevenue } from '@/core/forecasting';
import { detectAnomalies } from '@/core/anomaly';
import { generateInsights, prepareMetricsForInsight } from '@/core/insight-engine';
import { generateReportHTML } from '@/lib/pdf-generator';
import type { ReportData, Transaction } from '@/types';

/**
 * GET /api/report?businessId=xxx&format=html|pdf
 * Generates business health report
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const format = searchParams.get('format') || 'html';
    
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
    
    // Compute all analytics
    const dailyRevenue = transactions.map((t: Transaction) => ({
      date: t.date.toISOString().split('T')[0],
      revenue: t.revenue,
      cost: t.cost,
      profit: t.revenue - t.cost,
    }));
    
    const anomalyResult = detectAnomalies(dailyRevenue);
    const analytics = computeAnalytics(transactions as Transaction[], anomalyResult.anomalies.length);
    const forecast = forecastRevenue(analytics.dailyRevenue, 30);
    
    // Generate insights
    const metrics = prepareMetricsForInsight(analytics, forecast, anomalyResult);
    const insights = await generateInsights(metrics);
    
    // Calculate detailed health metrics
    const healthMetrics = calculateBusinessHealth(
      {
        totalRevenue: analytics.totalRevenue,
        totalCost: analytics.totalCost,
        totalProfit: analytics.totalProfit,
        profitMargin: analytics.profitMargin,
      },
      analytics.topProducts,
      analytics.monthlyRevenue,
      anomalyResult.anomalies.length
    );
    
    // Prepare report data
    const reportData: ReportData = {
      business: {
        id: business.id,
        name: business.name,
      },
      period: {
        startDate: transactions[0].date,
        endDate: transactions[transactions.length - 1].date,
      },
      analytics,
      forecast,
      anomalies: anomalyResult,
      insights,
      healthMetrics,
      generatedAt: new Date(),
    };
    
    // Generate HTML
    const html = generateReportHTML(reportData);
    
    if (format === 'html') {
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="${business.name}-report.html"`,
        },
      });
    }
    
    // For PDF format, return HTML that can be printed to PDF in browser
    // In production, use a library like Puppeteer or a PDF service
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${business.name}-report.html"`,
      },
    });
    
  } catch (error) {
    console.error('Report generation error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}