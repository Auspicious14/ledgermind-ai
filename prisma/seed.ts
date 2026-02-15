// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create a demo business
  const business = await prisma.business.create({
    data: {
      name: 'Demo Coffee Shop',
      industry: 'Food & Beverage',
    },
  });

  console.log('Created business:', business.name);

  // Generate 90 days of transaction data
  const products = [
    { name: 'Espresso', avgRevenue: 3.5, avgCost: 0.8 },
    { name: 'Cappuccino', avgRevenue: 4.5, avgCost: 1.2 },
    { name: 'Latte', avgRevenue: 5.0, avgCost: 1.5 },
    { name: 'Americano', avgRevenue: 3.0, avgCost: 0.7 },
    { name: 'Croissant', avgRevenue: 3.5, avgCost: 1.0 },
    { name: 'Muffin', avgRevenue: 3.0, avgCost: 0.9 },
    { name: 'Sandwich', avgRevenue: 7.5, avgCost: 2.5 },
    { name: 'Salad', avgRevenue: 8.5, avgCost: 3.0 },
  ];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  const transactions = [];

  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Generate 15-30 transactions per day
    const dailyTransactions = Math.floor(Math.random() * 16) + 15;

    for (let j = 0; j < dailyTransactions; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      
      // Add some variance
      const variance = 0.8 + Math.random() * 0.4; // 80% to 120%
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      // Add seasonality and trend
      const seasonality = 1 + 0.2 * Math.sin((i / 90) * Math.PI * 2);
      const trend = 1 + (i / 90) * 0.3; // 30% growth over period
      
      const revenue = product.avgRevenue * quantity * variance * seasonality * trend;
      const cost = product.avgCost * quantity * variance;

      // Add some anomalies (5% of days)
      let anomalyMultiplier = 1;
      if (Math.random() < 0.05) {
        anomalyMultiplier = Math.random() < 0.5 ? 0.3 : 2.5; // Drop or spike
      }

      transactions.push({
        businessId: business.id,
        date: date,
        productName: product.name,
        category: product.name.includes('Coffee') || product.name.includes('Espresso') 
          || product.name.includes('Cappuccino') || product.name.includes('Latte')
          || product.name.includes('Americano')
          ? 'Beverage' 
          : 'Food',
        quantity: quantity,
        revenue: parseFloat((revenue * anomalyMultiplier).toFixed(2)),
        cost: parseFloat(cost.toFixed(2)),
      });
    }
  }

  console.log(`Creating ${transactions.length} transactions...`);

  await prisma.transaction.createMany({
    data: transactions,
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });