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

  async getERPNextProjects(slug: string) {
    const response = await apiRequest('GET', `/api/tenants/${slug}/erpnext/projects`);
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

  async getSaleorCustomers(slug: string) {
    const response = await apiRequest('GET', `/api/tenants/${slug}/saleor/customers`);
    return response.json();
  },

  async syncCustomers(slug: string) {
    const response = await apiRequest('POST', `/api/tenants/${slug}/sync/customers`);
    return response.json();
  },

  async getIntegrationLogs(slug: string) {
    const response = await apiRequest('GET', `/api/tenants/${slug}/logs`);
    return response.json();
  },

  async refreshSync(slug: string) {
    const response = await apiRequest('POST', `/api/tenants/${slug}/refresh-sync`);
    return response.json();
  },

  async getN8nStatus(slug: string) {
    const response = await apiRequest('GET', `/api/n8n/status/${slug}`);
    return response.json();
  },

  async triggerAutomation(slug: string, action: string, data: unknown = {}) {
    const response = await apiRequest('POST', `/api/n8n/automation/${slug}`, {
      action,
      data,
    });
    return response.json();
  },

  async getWebhookStatus(slug: string) {
    const response = await apiRequest('GET', `/api/tenants/${slug}/webhooks/status`);
    return response.json();
  }
};
