// src/lib/api-error.ts

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

/**
 * Standard API error response
 */
export interface APIError {
  error: string;
  message: string;
  details?: any;
  code?: string;
}

/**
 * Handles Prisma database errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
  status: number;
  response: APIError;
} {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      return {
        status: 409,
        response: {
          error: 'Duplicate entry',
          message: 'A record with this data already exists',
          code: error.code,
          details: error.meta,
        },
      };
      
    case 'P2025':
      // Record not found
      return {
        status: 404,
        response: {
          error: 'Not found',
          message: 'The requested record does not exist',
          code: error.code,
        },
      };
      
    case 'P2003':
      // Foreign key constraint violation
      return {
        status: 400,
        response: {
          error: 'Invalid reference',
          message: 'Referenced record does not exist',
          code: error.code,
          details: error.meta,
        },
      };
      
    default:
      return {
        status: 500,
        response: {
          error: 'Database error',
          message: 'An error occurred while accessing the database',
          code: error.code,
        },
      };
  }
}

/**
 * Handles Zod validation errors
 */
function handleZodError(error: ZodError): {
  status: number;
  response: APIError;
} {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  
  return {
    status: 400,
    response: {
      error: 'Validation error',
      message: 'Invalid request data',
      details: errors,
    },
  };
}

/**
 * Central error handler for API routes
 */
export function handleAPIError(error: unknown): NextResponse<APIError> {
  console.error('API Error:', error);
  
  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { status, response } = handlePrismaError(error);
    return NextResponse.json(response, { status });
  }
  
  // Zod validation errors
  if (error instanceof ZodError) {
    const { status, response } = handleZodError(error);
    return NextResponse.json(response, { status });
  }
  
  // Generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
  
  // Unknown errors
  return NextResponse.json(
    {
      error: 'Unknown error',
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

/**
 * Validates request parameters
 */
export function validateRequired(
  params: Record<string, string | null | undefined>,
  required: string[]
): { valid: boolean; error?: APIError } {
  const missing = required.filter(key => !params[key]);
  
  if (missing.length > 0) {
    return {
      valid: false,
      error: {
        error: 'Missing required parameters',
        message: `Required parameters: ${missing.join(', ')}`,
        details: { missing },
      },
    };
  }
  
  return { valid: true };
}

/**
 * Validates date range parameters
 */
export function validateDateRange(
  startDate: string | null,
  endDate: string | null
): { valid: boolean; error?: APIError; dates?: { start: Date; end: Date } } {
  if (!startDate || !endDate) {
    return { valid: true }; // Optional parameters
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      valid: false,
      error: {
        error: 'Invalid date format',
        message: 'Dates must be in ISO format (YYYY-MM-DD)',
      },
    };
  }
  
  if (start > end) {
    return {
      valid: false,
      error: {
        error: 'Invalid date range',
        message: 'Start date must be before end date',
      },
    };
  }
  
  return {
    valid: true,
    dates: { start, end },
  };
}

/**
 * Validates pagination parameters
 */
export function validatePagination(
  limit: string | null,
  offset: string | null
): { valid: boolean; error?: APIError; pagination?: { limit: number; offset: number } } {
  const parsedLimit = limit ? parseInt(limit) : 100;
  const parsedOffset = offset ? parseInt(offset) : 0;
  
  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 1000) {
    return {
      valid: false,
      error: {
        error: 'Invalid limit',
        message: 'Limit must be between 1 and 1000',
      },
    };
  }
  
  if (isNaN(parsedOffset) || parsedOffset < 0) {
    return {
      valid: false,
      error: {
        error: 'Invalid offset',
        message: 'Offset must be a non-negative number',
      },
    };
  }
  
  return {
    valid: true,
    pagination: { limit: parsedLimit, offset: parsedOffset },
  };
}