'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import type { Anomaly } from '@/types';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface AnomalyMarkersProps {
  anomalies: Anomaly[];
  loading?: boolean;
}

export function AnomalyMarkers({ anomalies, loading = false }: AnomalyMarkersProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Anomalies</h3>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No anomalies detected</p>
          <p className="text-sm text-gray-400 mt-1">Revenue patterns are stable</p>
        </div>
      </div>
    );
  }

  const getSeverityStyles = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-700',
        };
      case 'medium':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-700',
        };
      case 'low':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-700',
        };
    }
  };

  // Show top 5 anomalies
  const topAnomalies = anomalies.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Anomalies</h3>
        <span className="text-sm font-medium text-gray-500">
          {anomalies.length} detected
        </span>
      </div>

      <div className="space-y-4">
        {topAnomalies.map((anomaly, index) => {
          const styles = getSeverityStyles(anomaly.severity);
          const Icon = anomaly.type === 'spike' ? TrendingUp : TrendingDown;

          return (
            <div
              key={index}
              className={`${styles.bg} border ${styles.border} rounded-lg p-4`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Icon className={`w-5 h-5 ${styles.icon}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {formatDate(anomaly.date)}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles.badge}`}>
                      {anomaly.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{anomaly.explanation}</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Actual</span>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(anomaly.revenue)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Expected</span>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(anomaly.expectedRevenue)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Deviation</span>
                      <p className={`font-semibold ${anomaly.type === 'spike' ? 'text-green-600' : 'text-red-600'}`}>
                        {anomaly.deviation > 0 ? '+' : ''}{formatCurrency(anomaly.deviation)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {anomalies.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all {anomalies.length} anomalies
          </button>
        </div>
      )}
    </div>
  );
}