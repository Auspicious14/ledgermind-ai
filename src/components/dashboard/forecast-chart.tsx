'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { DailyRevenue, ForecastPoint } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ForecastChartProps {
  historicalData: DailyRevenue[];
  forecastData: ForecastPoint[];
  trend: 'increasing' | 'decreasing' | 'stable';
  r2: number;
  loading?: boolean;
}

export function ForecastChart({
  historicalData,
  forecastData,
  trend,
  r2,
  loading = false,
}: ForecastChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-80 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!historicalData || !forecastData || historicalData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">30-Day Revenue Forecast</h3>
        <div className="h-80 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  // Take last 30 days of historical data
  const recentHistorical = historicalData.slice(-30);

  // Combine historical and forecast data
  const chartData = [
    ...recentHistorical.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: d.revenue,
      forecast: null,
      upper: null,
      lower: null,
      isForecast: false,
    })),
    ...forecastData.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: null,
      forecast: d.predicted,
      upper: d.confidence?.upper,
      lower: d.confidence?.lower,
      isForecast: true,
    })),
  ];

  const getTrendIcon = () => {
    if (trend === 'increasing') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === 'decreasing') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  const getTrendText = () => {
    if (trend === 'increasing') return 'Increasing';
    if (trend === 'decreasing') return 'Decreasing';
    return 'Stable';
  };

  const getTrendColor = () => {
    if (trend === 'increasing') return 'text-green-600';
    if (trend === 'decreasing') return 'text-red-600';
    return 'text-gray-600';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {data.actual !== null && (
            <div className="flex items-center gap-2 text-sm mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Actual:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(data.actual)}
              </span>
            </div>
          )}
          {data.forecast !== null && (
            <>
              <div className="flex items-center gap-2 text-sm mb-1">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-gray-600">Forecast:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(data.forecast)}
                </span>
              </div>
              {data.upper !== null && (
                <div className="text-xs text-gray-500 mt-1">
                  Range: {formatCurrency(data.lower)} - {formatCurrency(data.upper)}
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">30-Day Revenue Forecast</h3>
          <p className="text-sm text-gray-500 mt-1">
            R² = {(r2 * 100).toFixed(1)}% accuracy
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`font-medium ${getTrendColor()}`}>{getTrendText()}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="#a855f7"
            fillOpacity={0.1}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="#fff"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#a855f7"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-500"></div>
          <span className="text-gray-600">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-purple-500 border-dashed border-t-2 border-purple-500"></div>
          <span className="text-gray-600">Forecast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-purple-100"></div>
          <span className="text-gray-600">95% Confidence</span>
        </div>
      </div>
    </div>
  );
}