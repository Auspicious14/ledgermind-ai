// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/csv-parser';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const userId = 'demo-user-1';

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const businessId = formData.get('businessId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }
    
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId,
      },
    });
    
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }
    
    // Read file content
    const content = await file.text();
    
    // Parse CSV
    const parseResult = await parseCSV(content);
    
    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json(
        {
          error: 'CSV parsing failed',
          details: parseResult.errors,
        },
        { status: 400 }
      );
    }
    
    // Transform and insert transactions
    const transactions = parseResult.data.map(row => ({
      businessId,
      date: new Date(row.date),
      productName: row.productName,
      category: row.category || null,
      quantity: row.quantity,
      revenue: row.revenue,
      cost: row.cost,
    }));
    
    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: any) => {
      // Delete existing transactions for this business (optional - for re-uploads)
      // await tx.transaction.deleteMany({ where: { businessId } });
      
      // Insert new transactions in batches (for large datasets)
      const batchSize = 1000;
      let insertedCount = 0;
      
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        await tx.transaction.createMany({
          data: batch,
        });
        insertedCount += batch.length;
      }
      
      return insertedCount;
    });
    
    return NextResponse.json({
      success: true,
      message: 'Transactions imported successfully',
      summary: {
        ...parseResult.summary,
        imported: result,
      },
      warnings: parseResult.errors,
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process upload',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * Returns sample CSV template
 */
export async function GET() {
  const sampleCSV = `date,productName,category,quantity,revenue,cost
2024-01-01,Espresso,Beverage,10,35.00,8.00
2024-01-01,Croissant,Food,5,17.50,5.00
2024-01-02,Latte,Beverage,8,40.00,12.00
2024-01-02,Muffin,Food,6,18.00,5.40`;

  return new NextResponse(sampleCSV, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="sample_transactions.csv"',
    },
  });
}
