'use client';

import { formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Percent, Activity } from 'lucide-react';

interface KPICardsProps {
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  healthScore: number;
  trend?: 'up' | 'down' | 'stable';
  loading?: boolean;
}

export function KPICards({
  totalRevenue,
  totalProfit,
  profitMargin,
  healthScore,
  trend = 'stable',
  loading = false,
}: KPICardsProps) {
  const getHealthScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    if (score >= 40) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: trend === 'up' ? '+12.5%' : trend === 'down' ? '-3.2%' : '0.0%',
      trendUp: trend === 'up',
    },
    {
      title: 'Total Profit',
      value: formatCurrency(totalProfit),
      icon: PiggyBank,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: profitMargin > 0.3 ? 'Healthy' : profitMargin > 0.15 ? 'Moderate' : 'Low',
      trendUp: profitMargin > 0.3,
    },
    {
      title: 'Profit Margin',
      value: formatPercentage(profitMargin),
      icon: Percent,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trend: profitMargin >= 0.3 ? 'Excellent' : profitMargin >= 0.2 ? 'Good' : 'Fair',
      trendUp: profitMargin >= 0.2,
    },
    {
      title: 'Health Score',
      value: `${healthScore}/100`,
      icon: Activity,
      iconBg: getHealthScoreBg(healthScore),
      iconColor: getHealthScoreColor(healthScore),
      trend: healthScore >= 70 ? 'Strong' : healthScore >= 50 ? 'Stable' : 'At Risk',
      trendUp: healthScore >= 70,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.iconBg} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              {card.trendUp ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
              <p className={`text-xs font-medium ${card.trendUp ? 'text-green-600' : 'text-gray-500'}`}>
                {card.trend}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}