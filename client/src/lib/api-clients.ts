import { apiRequest } from "./queryClient";

export interface SyncStatus {
  lastSyncAt?: string;
  recordCount?: number;
  isActive?: boolean;
}

export interface IntegrationStatus {
  erpnext?: SyncStatus;
  saleor?: SyncStatus;
}

export const apiClients = {
  async getTenants() {
    const response = await apiRequest('GET', '/api/tenants');
    return response.json();
  },

  async getTenant(slug: string) {
    const response = await apiRequest('GET', `/api/tenants/${slug}`);
    return response.json();
  },

  async getSyncStatus(slug: string): Promise<IntegrationStatus> {
    const response = await apiRequest('GET', `/api/tenants/${slug}/sync-status`);
    return response.json();
  },

  async getERPNextItems(slug: string) {
    const response = await apiRequest('GET', `/api/tenants/${slug}/erpnext/items`);
    return response.json();
  },

  async getERPNextCustomers(slug: string) {
    const response = await apiRequest('GET', `/api/tenants/${slug}/erpnext/customers`);
    return response.json();
  },

  async getSaleorProducts(slug: string) {
    const response = await apiRequest('GET', `/api/tenants/${slug}/saleor/products`);
    return response.json();
  },

  async getSaleorOrders(slug: string) {
    const response = await apiRequest('GET', `/api/tenants/${slug}/saleor/orders`);
    return response.json();
  },

  async getIntegrationLogs(slug: string) {
    const response = await apiRequest('GET', `/api/tenants/${slug}/logs`);
    return response.json();
  }
};
