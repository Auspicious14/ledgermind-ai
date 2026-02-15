// src/lib/csv-parser.ts

import Papa from 'papaparse';
import { z } from 'zod';
import type { CSVTransaction } from '@/types';

/**
 * Zod schema for CSV transaction validation
 */
const CSVTransactionSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  productName: z.string().min(1, 'Product name is required'),
  category: z.string().optional(),
  quantity: z.union([z.number(), z.string()]).transform(val => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num) || num <= 0) {
      throw new Error('Quantity must be a positive number');
    }
    return num;
  }),
  revenue: z.union([z.number(), z.string()]).transform(val => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num) || num < 0) {
      throw new Error('Revenue must be a non-negative number');
    }
    return num;
  }),
  cost: z.union([z.number(), z.string()]).transform(val => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num) || num < 0) {
      throw new Error('Cost must be a non-negative number');
    }
    return num;
  }),
});

/**
 * Result of CSV parsing operation
 */
export interface CSVParseResult {
  success: boolean;
  data?: CSVTransaction[];
  errors?: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  summary?: {
    totalRows: number;
    validRows: number;
    errorRows: number;
  };
}

/**
 * Normalizes CSV headers to match expected format
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Maps common header variations to standard field names
 */
function mapHeaderToField(header: string): string {
  const normalized = normalizeHeader(header);
  
  const mappings: Record<string, string> = {
    'date': 'date',
    'transaction_date': 'date',
    'sale_date': 'date',
    'order_date': 'date',
    
    'product': 'productName',
    'product_name': 'productName',
    'item': 'productName',
    'item_name': 'productName',
    
    'category': 'category',
    'product_category': 'category',
    'type': 'category',
    
    'quantity': 'quantity',
    'qty': 'quantity',
    'units': 'quantity',
    'amount': 'quantity',
    
    'revenue': 'revenue',
    'sales': 'revenue',
    'total': 'revenue',
    'price': 'revenue',
    'sale_amount': 'revenue',
    
    'cost': 'cost',
    'cogs': 'cost',
    'expense': 'cost',
    'cost_of_goods': 'cost',
  };
  
  return mappings[normalized] || header;
}

/**
 * Parses date string to Date object with multiple format support
 */
function parseDate(dateStr: string): Date {
  // Try ISO format first
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try MM/DD/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0]) - 1;
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Try DD-MM-YYYY
  const dashParts = dateStr.split('-');
  if (dashParts.length === 3) {
    const day = parseInt(dashParts[0]);
    const month = parseInt(dashParts[1]) - 1;
    const year = parseInt(dashParts[2]);
    date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  throw new Error(`Invalid date format: ${dateStr}`);
}

/**
 * Validates and parses a single CSV row
 */
function parseCSVRow(row: any, rowIndex: number): {
  success: boolean;
  data?: CSVTransaction;
  error?: { row: number; field?: string; message: string };
} {
  try {
    // Map headers to standard field names
    const mappedRow: any = {};
    for (const [key, value] of Object.entries(row)) {
      const mappedKey = mapHeaderToField(key);
      mappedRow[mappedKey] = value;
    }
    
    // Validate with Zod
    const validated = CSVTransactionSchema.parse(mappedRow);
    
    // Validate date
    try {
      parseDate(validated.date);
    } catch (error) {
      return {
        success: false,
        error: {
          row: rowIndex,
          field: 'date',
          message: error instanceof Error ? error.message : 'Invalid date',
        },
      };
    }
    
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: {
          row: rowIndex,
          field: firstError.path[0]?.toString(),
          message: firstError.message,
        },
      };
    }
    
    return {
      success: false,
      error: {
        row: rowIndex,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Parses CSV file contents into validated transaction data
 */
export async function parseCSV(fileContent: string): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const validData: CSVTransaction[] = [];
        const errors: Array<{ row: number; field?: string; message: string }> = [];
        
        // Parse and validate each row
        results.data.forEach((row, index) => {
          const rowNumber = index + 2; // +2 for header row and 0-indexing
          const parseResult = parseCSVRow(row, rowNumber);
          
          if (parseResult.success && parseResult.data) {
            validData.push(parseResult.data);
          } else if (parseResult.error) {
            errors.push(parseResult.error);
          }
        });
        
        // If no valid data, return error
        if (validData.length === 0) {
          resolve({
            success: false,
            errors: errors.length > 0 ? errors : [{
              row: 0,
              message: 'No valid data found in CSV file',
            }],
          });
          return;
        }
        
        // Return results
        resolve({
          success: true,
          data: validData,
          errors: errors.length > 0 ? errors : undefined,
          summary: {
            totalRows: results.data.length,
            validRows: validData.length,
            errorRows: errors.length,
          },
        });
      },
      error: (error: any) => {
        resolve({
          success: false,
          errors: [{
            row: 0,
            message: `CSV parsing failed: ${error.message}`,
          }],
        });
      },
    });
  });
}

/**
 * Validates CSV file before parsing
 */
export function validateCSVFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/csv',
  ];
  
  if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a CSV file.',
    };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }
  
  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty.',
    };
  }
  
  return { valid: true };
}

/**
 * Generates a sample CSV template
 */
export function generateSampleCSV(): string {
  const headers = ['date', 'productName', 'category', 'quantity', 'revenue', 'cost'];
  const sampleData = [
    ['2024-01-01', 'Espresso', 'Beverage', '10', '35.00', '8.00'],
    ['2024-01-01', 'Croissant', 'Food', '5', '17.50', '5.00'],
    ['2024-01-02', 'Latte', 'Beverage', '8', '40.00', '12.00'],
    ['2024-01-02', 'Muffin', 'Food', '6', '18.00', '5.40'],
  ];
  
  const rows = [headers, ...sampleData];
  return rows.map(row => row.join(',')).join('\n');
}