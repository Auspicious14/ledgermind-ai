// src/app/api/business/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const userId = 'demo-user-1';

    const businesses = await prisma.business.findMany({
      where: {
        userId,
      },
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

export async function POST(request: NextRequest) {
  try {
    const userId = 'demo-user-1';

    const body = await request.json();
    const { name, industry } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }
    
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'demo-user-1@example.com',
      },
    });

    const business = await prisma.business.create({
      data: {
        name,
        industry: industry || null,
        userId,
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
