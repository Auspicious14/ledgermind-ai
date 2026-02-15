// src/app/api/business/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/business
 * Lists all businesses
 */
export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });
    
    return NextResponse.json({ businesses });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch businesses',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/business
 * Creates a new business
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, industry } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }
    
    const business = await prisma.business.create({
      data: {
        name,
        industry: industry || null,
      },
    });
    
    return NextResponse.json({ business }, { status: 201 });
  } catch (error) {
    console.error('Error creating business:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to create business',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}