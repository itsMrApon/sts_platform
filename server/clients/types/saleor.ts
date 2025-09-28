/**
 * Saleor-specific types and interfaces
 */

import { BaseConfig, CustomerData, AddressData, ProductData, OrderData, PaginationParams } from './common';

export interface SaleorConfig extends BaseConfig {
  token?: string;
  apiVersion?: string;
  channelSlug?: string;
}

export interface SaleorCustomer extends CustomerData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  dateJoined: string;
  defaultBillingAddress?: SaleorAddress;
  defaultShippingAddress?: SaleorAddress;
}

export interface SaleorAddress extends AddressData {
  id: string;
  firstName?: string;
  lastName?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  postalCode?: string;
  country: {
    code: string;
    country: string;
  };
  phone?: string;
}

export interface SaleorProduct extends ProductData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  variants?: SaleorProductVariant[];
  category?: SaleorCategory;
  collections?: SaleorCollection[];
}

export interface SaleorProductVariant {
  id: string;
  name: string;
  sku?: string;
  price: {
    amount: number;
    currency: string;
  };
  isActive: boolean;
  trackInventory: boolean;
  quantityAvailable?: number;
}

export interface SaleorCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface SaleorCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface SaleorOrder extends OrderData {
  id: string;
  number: string;
  status: string;
  created: string;
  total: {
    gross: {
      amount: number;
      currency: string;
    };
  };
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  lines?: SaleorOrderLine[];
  shippingAddress?: SaleorAddress;
  billingAddress?: SaleorAddress;
}

export interface SaleorOrderLine {
  id: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: {
    gross: {
      amount: number;
      currency: string;
    };
  };
  totalPrice: {
    gross: {
      amount: number;
      currency: string;
    };
  };
}

export interface SaleorChannel {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  currencyCode: string;
  defaultCountry: {
    code: string;
    country: string;
  };
}

export interface SaleorWebhook {
  id: string;
  name: string;
  targetUrl: string;
  isActive: boolean;
  events: string[];
  asyncEvents: string[];
  secretKey?: string;
  created?: string;
  updated?: string;
}

export interface SaleorWebhookEvent {
  id: string;
  name: string;
  eventType: string;
  objectId: string;
  payload: any;
  created: string;
}

export interface SaleorQueryParams extends PaginationParams {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
  channel?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface SaleorGraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}
