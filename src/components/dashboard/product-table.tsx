'use client';

import { useState } from 'react';
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/utils';
import type { ProductPerformance } from '@/types';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';

interface ProductTableProps {
  products: ProductPerformance[];
  title?: string;
  type?: 'top' | 'bottom';
  loading?: boolean;
}

type SortField = 'revenue' | 'profit' | 'margin' | 'quantity';
type SortDirection = 'asc' | 'desc';

export function ProductTable({
  products,
  title = 'Product Performance',
  type = 'top',
  loading = false,
}: ProductTableProps) {
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-400">No products found</div>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let aValue: number, bValue: number;
    
    switch (sortField) {
      case 'revenue':
        aValue = a.totalRevenue;
        bValue = b.totalRevenue;
        break;
      case 'profit':
        aValue = a.totalProfit;
        bValue = b.totalProfit;
        break;
      case 'margin':
        aValue = a.profitMargin;
        bValue = b.profitMargin;
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900 transition-colors"
    >
      {label}
      <ArrowUpDown className="w-4 h-4" />
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Product
              </th>
              <th className="text-right py-3 px-4 text-sm">
                <SortButton field="revenue" label="Revenue" />
              </th>
              <th className="text-right py-3 px-4 text-sm">
                <SortButton field="profit" label="Profit" />
              </th>
              <th className="text-right py-3 px-4 text-sm">
                <SortButton field="margin" label="Margin" />
              </th>
              <th className="text-right py-3 px-4 text-sm">
                <SortButton field="quantity" label="Units" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedProducts.map((product, index) => {
              const isPositiveMargin = product.profitMargin > 0.2;
              
              return (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        type === 'top' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium text-gray-900">
                        {product.productName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {formatCurrency(product.totalRevenue)}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${
                    product.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(product.totalProfit)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isPositiveMargin ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`font-medium ${
                        isPositiveMargin ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {formatPercentage(product.profitMargin)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {formatNumber(product.quantity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}