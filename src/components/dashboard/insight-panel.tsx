'use client';

import { useState } from 'react';
import type { BusinessInsight, InsightEngineResult } from '@/types';
import {
  Lightbulb,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Target,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface InsightPanelProps {
  insights: InsightEngineResult | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export function InsightPanel({ insights, loading = false, onRefresh }: InsightPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!insights || !insights.insights || insights.insights.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
        <div className="text-center py-8 text-gray-400">No insights available</div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue':
        return DollarSign;
      case 'profitability':
        return TrendingUp;
      case 'risk':
        return AlertTriangle;
      case 'opportunity':
        return Target;
      case 'warning':
        return AlertCircle;
      default:
        return Lightbulb;
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'revenue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700',
        };
      case 'profitability':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-700',
        };
      case 'risk':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-700',
        };
      case 'opportunity':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          icon: 'text-purple-600',
          badge: 'bg-purple-100 text-purple-700',
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-700',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700',
        };
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Sort by priority
  const sortedInsights = [...insights.insights].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (
      priorityOrder[b.priority as keyof typeof priorityOrder] -
      priorityOrder[a.priority as keyof typeof priorityOrder]
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
            <p className="text-xs text-gray-500">
              Generated {new Date(insights.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh insights"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Executive Summary */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Executive Summary</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{insights.executiveSummary}</p>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {sortedInsights.map((insight, index) => {
          const styles = getCategoryStyles(insight.category);
          const Icon = getCategoryIcon(insight.category);
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={index}
              className={`border ${styles.border} rounded-lg overflow-hidden transition-all`}
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className={`w-full ${styles.bg} p-4 text-left hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <Icon className={`w-5 h-5 ${styles.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityStyles(
                            insight.priority
                          )}`}
                        >
                          {insight.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{insight.description}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="bg-white p-4 border-t border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-semibold text-gray-600 uppercase mb-1">
                        Impact
                      </h5>
                      <p className="text-sm text-gray-700">{insight.impact}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-gray-600 uppercase mb-1">
                        Recommendation
                      </h5>
                      <p className="text-sm text-gray-900 font-medium">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Key Metrics Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(insights.keyMetrics).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim()}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {typeof value === 'number'
                  ? key.includes('Rate') || key.includes('Margin')
                    ? `${(value * 100).toFixed(1)}%`
                    : key.includes('Revenue') || key.includes('Profit')
                    ? `$${value.toLocaleString()}`
                    : value
                  : value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}