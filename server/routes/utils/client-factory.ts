/**
 * Client factory utilities for creating API clients
 */

import { SaleorClient, ERPNextClient } from '../../clients';

/**
 * Create ERPNext client for a tenant
 */
export function createERPNextClient(tenant: any): ERPNextClient {
  return new ERPNextClient({
    baseUrl: tenant.erpnextUrl,
    apiKey: tenant.erpnextApiKey || undefined,
    apiSecret: tenant.erpnextApiSecret || undefined,
    tenantId: tenant.id,
  });
}

/**
 * Create Saleor client for a tenant
 */
export function createSaleorClient(tenant: any): SaleorClient {
  return new SaleorClient({
    baseUrl: tenant.saleorUrl,
    token: tenant.saleorToken || undefined,
    apiVersion: process.env.SALEOR_API_VERSION || '2023-10',
    channelSlug: process.env.SALEOR_CHANNEL || 'default-channel',
    tenantId: tenant.id,
  });
}

/**
 * Create both clients for a tenant
 */
export function createClients(tenant: any) {
  return {
    erpnext: createERPNextClient(tenant),
    saleor: createSaleorClient(tenant),
  };
}
