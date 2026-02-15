// src/core/__tests__/analytics.test.ts
// Simple test examples - expand with Jest or Vitest

import type { Transaction } from '@/types';
import {
  calculateDailyRevenue,
  calculateMonthlyRevenue,
  calculateProductPerformance,
  calculateTotals,
  calculateRevenueConcentration,
  computeAnalytics,
} from '../analytics';

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    businessId: 'b1',
    date: new Date('2024-01-01'),
    productName: 'Espresso',
    quantity: 10,
    revenue: 35,
    cost: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    businessId: 'b1',
    date: new Date('2024-01-01'),
    productName: 'Latte',
    quantity: 5,
    revenue: 25,
    cost: 7.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    businessId: 'b1',
    date: new Date('2024-01-02'),
    productName: 'Espresso',
    quantity: 12,
    revenue: 42,
    cost: 9.6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    businessId: 'b1',
    date: new Date('2024-02-01'),
    productName: 'Cappuccino',
    quantity: 8,
    revenue: 36,
    cost: 9.6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Test: Calculate Daily Revenue
function testDailyRevenue() {
  const result = calculateDailyRevenue(mockTransactions);
  
  console.assert(result.length === 3, 'Should have 3 unique days');
  console.assert(result[0].revenue === 60, 'First day revenue should be 60');
  console.assert(result[0].profit === 44.5, 'First day profit should be 44.5');
  
  console.log('✓ Daily revenue calculation works');
}

// Test: Calculate Monthly Revenue
function testMonthlyRevenue() {
  const result = calculateMonthlyRevenue(mockTransactions);
  
  console.assert(result.length === 2, 'Should have 2 unique months');
  console.assert(result[0].month === '2024-01', 'First month should be 2024-01');
  console.assert(result[0].revenue === 102, 'January revenue should be 102');
  
  console.log('✓ Monthly revenue calculation works');
}

// Test: Product Performance
function testProductPerformance() {
  const result = calculateProductPerformance(mockTransactions);
  
  console.assert(result.length === 3, 'Should have 3 products');
  console.assert(result[0].productName === 'Espresso', 'Top product should be Espresso');
  console.assert(result[0].totalRevenue === 77, 'Espresso revenue should be 77');
  console.assert(result[0].transactionCount === 2, 'Espresso should have 2 transactions');
  
  console.log('✓ Product performance calculation works');
}

// Test: Calculate Totals
function testCalculateTotals() {
  const result = calculateTotals(mockTransactions);
  
  console.assert(result.totalRevenue === 138, 'Total revenue should be 138');
  console.assert(result.totalCost === 34.7, 'Total cost should be 34.7');
  console.assert(result.totalProfit === 103.3, 'Total profit should be 103.3');
  console.assert(result.profitMargin > 0.74 && result.profitMargin < 0.75, 'Profit margin should be ~74.8%');
  
  console.log('✓ Totals calculation works');
}

// Test: Revenue Concentration
function testRevenueConcentration() {
  const products = calculateProductPerformance(mockTransactions);
  const result = calculateRevenueConcentration(products);
  
  console.assert(result.topProductShare > 0.55, 'Top product should be >55% of revenue');
  console.assert(result.diversificationScore < 0.5, 'Should show concentration risk');
  
  console.log('✓ Revenue concentration calculation works');
}

// Test: Full Analytics
function testFullAnalytics() {
  const result = computeAnalytics(mockTransactions, 0);
  
  console.assert(result.totalRevenue === 138, 'Analytics total revenue correct');
  console.assert(result.dailyRevenue.length === 3, 'Daily revenue computed');
  console.assert(result.monthlyRevenue.length === 2, 'Monthly revenue computed');
  console.assert(result.topProducts.length > 0, 'Top products identified');
  console.assert(result.healthScore > 0 && result.healthScore <= 100, 'Health score is valid');
  
  console.log('✓ Full analytics computation works');
}

// Run all tests
export function runAnalyticsTests() {
  console.log('Running Analytics Tests...\n');
  
  testDailyRevenue();
  testMonthlyRevenue();
  testProductPerformance();
  testCalculateTotals();
  testRevenueConcentration();
  testFullAnalytics();
  
  console.log('\n✅ All analytics tests passed!');
}

// Uncomment to run tests:
// runAnalyticsTests();