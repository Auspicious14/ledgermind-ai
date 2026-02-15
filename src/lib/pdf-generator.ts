// src/lib/pdf-generator.ts

import type { ReportData } from '@/types';
import { formatCurrency, formatPercentage, formatDate } from './utils';

/**
 * Generates HTML for PDF report
 * This HTML will be converted to PDF server-side
 */
export function generateReportHTML(data: ReportData): string {
  const {
    business,
    period,
    analytics,
    forecast,
    anomalies,
    insights,
    healthMetrics,
    generatedAt,
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      padding: 40px;
      background: white;
    }
    
    .header {
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    
    .business-name {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 5px;
    }
    
    .period {
      font-size: 14px;
      color: #6b7280;
    }
    
    .generated-date {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 10px;
    }
    
    h2 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-top: 30px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .kpi-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
    }
    
    .kpi-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    
    .kpi-value {
      font-size: 24px;
      font-weight: bold;
      color: #111827;
    }
    
    .health-score {
      color: ${healthMetrics.score >= 70 ? '#059669' : healthMetrics.score >= 50 ? '#f59e0b' : '#dc2626'};
    }
    
    .executive-summary {
      background: linear-gradient(135deg, #eff6ff, #f3e8ff);
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    
    .executive-summary h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
      color: #1e40af;
    }
    
    .executive-summary p {
      font-size: 14px;
      line-height: 1.8;
      color: #374151;
    }
    
    .insight-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    
    .insight-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .insight-category {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .category-revenue { background: #dbeafe; color: #1e40af; }
    .category-profitability { background: #d1fae5; color: #065f46; }
    .category-risk { background: #fee2e2; color: #991b1b; }
    .category-opportunity { background: #ede9fe; color: #5b21b6; }
    .category-warning { background: #fed7aa; color: #9a3412; }
    
    .priority-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .priority-high { background: #fecaca; color: #991b1b; }
    .priority-medium { background: #fef3c7; color: #92400e; }
    .priority-low { background: #d1fae5; color: #065f46; }
    
    .insight-title {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }
    
    .insight-description {
      font-size: 13px;
      color: #374151;
      margin-bottom: 10px;
    }
    
    .insight-section {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
    }
    
    .insight-section-title {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    
    .insight-section-content {
      font-size: 12px;
      color: #374151;
    }
    
    .recommendation {
      background: #f0fdf4;
      border-left: 3px solid #10b981;
      padding: 10px;
      margin-top: 10px;
      font-weight: 500;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 13px;
    }
    
    th {
      background: #f9fafb;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    
    td {
      padding: 10px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    tr:hover {
      background: #f9fafb;
    }
    
    .metric-positive {
      color: #059669;
      font-weight: 600;
    }
    
    .metric-negative {
      color: #dc2626;
      font-weight: 600;
    }
    
    .anomaly-list {
      margin: 15px 0;
    }
    
    .anomaly-item {
      background: #fef2f2;
      border-left: 3px solid #ef4444;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 4px;
      font-size: 13px;
    }
    
    .anomaly-date {
      font-weight: 600;
      color: #991b1b;
      margin-bottom: 5px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
    }
    
    @media print {
      body { padding: 20px; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="logo">LedgerMind AI</div>
    <div class="business-name">${business.name}</div>
    <div class="period">
      Business Health Report: ${formatDate(period.startDate)} - ${formatDate(period.endDate)}
    </div>
    <div class="generated-date">Generated on ${formatDate(generatedAt)}</div>
  </div>

  <!-- Executive Summary -->
  <div class="executive-summary">
    <h3>Executive Summary</h3>
    <p>${insights.executiveSummary}</p>
  </div>

  <!-- Key Performance Indicators -->
  <h2>Key Performance Indicators</h2>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Total Revenue</div>
      <div class="kpi-value">${formatCurrency(analytics.totalRevenue)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Profit</div>
      <div class="kpi-value">${formatCurrency(analytics.totalProfit)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Profit Margin</div>
      <div class="kpi-value">${formatPercentage(analytics.profitMargin)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Health Score</div>
      <div class="kpi-value health-score">${analytics.healthScore}/100</div>
    </div>
  </div>

  <!-- Business Health Breakdown -->
  <h2>Health Score Breakdown</h2>
  <table>
    <tr>
      <th>Component</th>
      <th>Score</th>
      <th>Weight</th>
    </tr>
    <tr>
      <td>Profitability</td>
      <td>${healthMetrics.profitabilityScore}/100</td>
      <td>30%</td>
    </tr>
    <tr>
      <td>Growth</td>
      <td>${healthMetrics.growthScore}/100</td>
      <td>25%</td>
    </tr>
    <tr>
      <td>Stability</td>
      <td>${healthMetrics.stabilityScore}/100</td>
      <td>25%</td>
    </tr>
    <tr>
      <td>Diversification</td>
      <td>${healthMetrics.diversificationScore}/100</td>
      <td>20%</td>
    </tr>
  </table>

  <!-- Top Products -->
  <h2>Top Performing Products</h2>
  <table>
    <tr>
      <th>Product</th>
      <th>Revenue</th>
      <th>Profit</th>
      <th>Margin</th>
    </tr>
    ${analytics.topProducts.slice(0, 5).map(p => `
      <tr>
        <td>${p.productName}</td>
        <td>${formatCurrency(p.totalRevenue)}</td>
        <td class="${p.totalProfit >= 0 ? 'metric-positive' : 'metric-negative'}">
          ${formatCurrency(p.totalProfit)}
        </td>
        <td>${formatPercentage(p.profitMargin)}</td>
      </tr>
    `).join('')}
  </table>

  <!-- Revenue Forecast -->
  <div class="page-break"></div>
  <h2>30-Day Revenue Forecast</h2>
  <p>
    <strong>Trend:</strong> ${forecast.trend.charAt(0).toUpperCase() + forecast.trend.slice(1)}<br>
    <strong>Model Accuracy (R²):</strong> ${(forecast.r2 * 100).toFixed(1)}%<br>
    <strong>Average Predicted Daily Revenue:</strong> ${formatCurrency(
      forecast.forecast.reduce((sum, f) => sum + f.predicted, 0) / forecast.forecast.length
    )}
  </p>

  <!-- Anomalies -->
  ${anomalies.anomalies.length > 0 ? `
    <h2>Revenue Anomalies Detected</h2>
    <p>
      <strong>Total Anomalies:</strong> ${anomalies.anomalies.length}<br>
      <strong>Detection Threshold:</strong> ±${anomalies.threshold} standard deviations
    </p>
    <div class="anomaly-list">
      ${anomalies.anomalies.slice(0, 5).map(a => `
        <div class="anomaly-item">
          <div class="anomaly-date">${formatDate(a.date)} - ${a.type.toUpperCase()}</div>
          <div>${a.explanation}</div>
        </div>
      `).join('')}
    </div>
  ` : `
    <h2>Revenue Stability</h2>
    <p>✓ No significant anomalies detected. Revenue patterns are stable and predictable.</p>
  `}

  <!-- AI-Powered Insights -->
  <div class="page-break"></div>
  <h2>AI-Powered Business Insights</h2>
  ${insights.insights.map(insight => `
    <div class="insight-card">
      <div class="insight-header">
        <span class="insight-category category-${insight.category}">${insight.category}</span>
        <span class="priority-badge priority-${insight.priority}">${insight.priority}</span>
      </div>
      <div class="insight-title">${insight.title}</div>
      <div class="insight-description">${insight.description}</div>
      <div class="insight-section">
        <div class="insight-section-title">Impact</div>
        <div class="insight-section-content">${insight.impact}</div>
      </div>
      <div class="recommendation">
        <strong>Recommendation:</strong> ${insight.recommendation}
      </div>
    </div>
  `).join('')}

  <!-- Footer -->
  <div class="footer">
    <p>This report was generated by LedgerMind AI - Revenue Intelligence Engine</p>
    <p>Report ID: ${business.id.slice(0, 8)} | Generated: ${new Date(generatedAt).toLocaleString()}</p>
  </div>
</body>
</html>
  `.trim();
}