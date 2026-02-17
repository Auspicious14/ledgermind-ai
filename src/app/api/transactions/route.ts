// src/app/api/transactions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = 'demo-user-1';

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const productName = searchParams.get('productName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
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

    const where: any = { businessId };
    
    if (productName) {
      where.productName = { contains: productName, mode: 'insensitive' };
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    // Get total count
    const total = await prisma.transaction.count({ where });
    
    // Get paginated transactions
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      take: limit,
      skip: offset,
    });
    
    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch transactions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = 'demo-user-1';

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    
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

    const result = await prisma.transaction.deleteMany({
      where: { businessId },
    });
    
    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Error deleting transactions:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to delete transactions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
