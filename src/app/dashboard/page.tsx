'use client';

import { useEffect, useState } from 'react';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ForecastChart } from '@/components/dashboard/forecast-chart';
import { AnomalyMarkers } from '@/components/dashboard/anomaly-markers';
import { ProductTable } from '@/components/dashboard/product-table';
import { InsightPanel } from '@/components/dashboard/insight-panel';
import { ExportButton } from '@/components/dashboard/export-button';
import { fetchAnalytics, fetchInsights } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, AlertTriangle, Package } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  
  // For demo purposes, using a hardcoded business ID
  // In production, get this from URL params or auth context
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    // Get business ID from localStorage or create one
    const loadBusinessId = async () => {
      let id = localStorage.getItem('currentBusinessId');
      
      if (!id) {
        // In production, redirect to business selection or creation
        // For now, we'll use the seeded business
        router.push('/upload');
        return;
      }
      
      setBusinessId(id);
    };
    
    loadBusinessId();
  }, [router]);

  useEffect(() => {
    if (!businessId) return;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchAnalytics(businessId);
        setData(result);
        
        // Load insights after analytics
        loadInsights();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    const loadInsights = async () => {
      try {
        setInsightsLoading(true);
        const insightResult = await fetchInsights(businessId);
        setInsights(insightResult.insights);
      } catch (err) {
        console.error('Failed to load insights:', err);
        // Don't block UI if insights fail
      } finally {
        setInsightsLoading(false);
      }
    };

    loadAnalytics();
  }, [businessId]);

  if (!businessId) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/upload')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Upload Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LedgerMind AI</h1>
                <p className="text-sm text-gray-600">
                  {data?.business.name || 'Loading...'}
                </p>
              </div>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/upload')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Upload New Data
              </button>
              {data && (
                <ExportButton 
                  businessId={businessId!} 
                  businessName={data.business.name}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Period Info */}
        {data && (
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
            <span>Period:</span>
            <span className="font-medium text-gray-900">
              {new Date(data.period.startDate).toLocaleDateString()} - {new Date(data.period.endDate).toLocaleDateString()}
            </span>
            <span>•</span>
            <span>{data.period.totalDays} days</span>
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-8">
          <KPICards
            totalRevenue={data?.analytics.totalRevenue || 0}
            totalProfit={data?.analytics.totalProfit || 0}
            profitMargin={data?.analytics.profitMargin || 0}
            healthScore={data?.analytics.healthScore || 0}
            trend={data?.forecast.trend}
            loading={loading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart
            data={data?.analytics.dailyRevenue || []}
            loading={loading}
          />
          <ForecastChart
            historicalData={data?.analytics.dailyRevenue || []}
            forecastData={data?.forecast.forecast || []}
            trend={data?.forecast.trend || 'stable'}
            r2={data?.forecast.r2 || 0}
            loading={loading}
          />
        </div>

        {/* Anomalies and Products Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <AnomalyMarkers
              anomalies={data?.anomalies.anomalies || []}
              loading={loading}
            />
          </div>
          
          <div className="lg:col-span-2">
            <ProductTable
              products={data?.analytics.topProducts || []}
              title="Top Products by Revenue"
              type="top"
              loading={loading}
            />
          </div>
        </div>

        {/* Bottom Products */}
        <div className="mb-8">
          <ProductTable
            products={data?.analytics.bottomProducts || []}
            title="Products Requiring Attention"
            type="bottom"
            loading={loading}
          />
        </div>

        {/* AI Insights Panel */}
        <div>
          <InsightPanel
            insights={insights}
            loading={insightsLoading}
            onRefresh={async () => {
              if (!businessId) return;
              try {
                setInsightsLoading(true);
                const insightResult = await fetchInsights(businessId);
                setInsights(insightResult.insights);
              } catch (err) {
                console.error('Failed to refresh insights:', err);
              } finally {
                setInsightsLoading(false);
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}
