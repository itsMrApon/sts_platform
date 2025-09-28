/**
 * Common types and interfaces for API clients
 */

export interface BaseConfig {
  baseUrl: string;
  tenantId: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: T;
  success?: boolean;
  error?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface SyncStatus {
  lastSyncAt: Date;
  recordCount: number;
  isActive: boolean;
  lastError?: string;
}

export interface IntegrationLog {
  tenantId: string;
  source: 'saleor' | 'erpnext' | 'n8n' | 'integration';
  action: string;
  status: 'success' | 'error' | 'pending';
  errorMessage?: string;
  payload?: Record<string, any>;
  timestamp?: Date;
}

export interface WebhookInfo {
  id: string;
  name: string;
  targetUrl: string;
  isActive: boolean;
  events?: string[];
  asyncEvents?: string[];
  secretKey?: string;
}

export interface CustomerData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  dateJoined?: string;
  defaultBillingAddress?: AddressData;
  defaultShippingAddress?: AddressData;
}

export interface AddressData {
  id?: string;
  firstName?: string;
  lastName?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: {
    code: string;
    country: string;
  };
  phone?: string;
}

export interface ProductData {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  price?: number;
  currency?: string;
  isActive?: boolean;
}

export interface OrderData {
  id?: string;
  number?: string;
  status?: string;
  created?: string;
  total?: {
    gross: {
      amount: number;
      currency: string;
    };
  };
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
