// src/lib/api-client.ts

/**
 * Type-safe API client for frontend use
 */

export interface UploadResult {
  success: boolean;
  message: string;
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    imported: number;
  };
  warnings?: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
}

export interface AnalyticsResponse {
  business: {
    id: string;
    name: string;
  };
  period: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  };
  analytics: any;
  forecast: any;
  anomalies: any;
  metrics: any;
}

/**
 * Uploads CSV file and imports transactions
 */
export async function uploadTransactions(
  file: File,
  businessId: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('businessId', businessId);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }
  
  return response.json();
}

/**
 * Fetches analytics data for a business
 */
export async function fetchAnalytics(
  businessId: string,
  options?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<AnalyticsResponse> {
  const params = new URLSearchParams({ businessId });
  
  if (options?.startDate) {
    params.append('startDate', options.startDate);
  }
  if (options?.endDate) {
    params.append('endDate', options.endDate);
  }
  
  const response = await fetch(`/api/analytics?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch analytics');
  }
  
  return response.json();
}

/**
 * Creates a new business
 */
export async function createBusiness(data: {
  name: string;
  industry?: string;
}): Promise<{ business: any }> {
  const response = await fetch('/api/business', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create business');
  }
  
  return response.json();
}

/**
 * Fetches list of all businesses
 */
export async function fetchBusinesses(): Promise<{ businesses: any[] }> {
  const response = await fetch('/api/business');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch businesses');
  }
  
  return response.json();
}

/**
 * Fetches transactions with pagination
 */
export async function fetchTransactions(
  businessId: string,
  options?: {
    limit?: number;
    offset?: number;
    productName?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{
  transactions: any[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}> {
  const params = new URLSearchParams({ businessId });
  
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());
  if (options?.productName) params.append('productName', options.productName);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  
  const response = await fetch(`/api/transactions?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch transactions');
  }
  
  return response.json();
}

/**
 * Deletes all transactions for a business
 */
export async function deleteTransactions(businessId: string): Promise<{
  success: boolean;
  deletedCount: number;
}> {
  const response = await fetch(`/api/transactions?businessId=${businessId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete transactions');
  }
  
  return response.json();
}

/**
 * Downloads sample CSV template
 */
export async function downloadSampleCSV(): Promise<void> {
  const response = await fetch('/api/upload');
  
  if (!response.ok) {
    throw new Error('Failed to download sample CSV');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_transactions.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Add these functions to the existing src/lib/api-client.ts file

/**
 * Fetches AI-generated insights for a business
 */
export async function fetchInsights(businessId: string): Promise<{
  business: {
    id: string;
    name: string;
  };
  insights: any;
  generatedAt: string;
}> {
  const response = await fetch(`/api/insights?businessId=${businessId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch insights');
  }
  
  return response.json();
}

/**
 * Generates insights from provided metrics
 */
export async function generateInsightsFromMetrics(metrics: any): Promise<{
  insights: any;
  generatedAt: string;
}> {
  const response = await fetch('/api/insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ metrics }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate insights');
  }
  
  return response.json();
}