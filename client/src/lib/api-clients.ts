import { apiRequest } from "./queryClient";

export interface SyncStatus {
  lastSyncAt?: string;
  recordCount?: number;
  isActive?: boolean;
}

export interface IntegrationStatus {
  erpnext?: SyncStatus;
  saleor?: SyncStatus;
  n8n?: SyncStatus;
}

// API Base URLs for each tenant
const API_BASE_URLS = {
  switchtoswag: import.meta.env.VITE_API_BASE_URL_SWITCHTOSWAG || 'http://localhost:4001',
  sudotechserve: import.meta.env.VITE_API_BASE_URL_SUDOTECHSERVE || 'http://localhost:4002',
  strongtermstrategy: import.meta.env.VITE_API_BASE_URL_STRONGTERMSTRATEGY || 'http://localhost:4003',
  superuser: import.meta.env.VITE_API_BASE_URL_SUPERUSER || 'http://localhost:4000' // Legacy API for superuser
};

// Helper function to get API base URL for tenant
const getApiBaseUrl = (tenant: string): string => {
  return API_BASE_URLS[tenant as keyof typeof API_BASE_URLS] || API_BASE_URLS.superuser;
};

// Helper function to make tenant-specific API requests
const makeTenantRequest = async (tenant: string, endpoint: string, options: RequestInit = {}) => {
  const baseUrl = getApiBaseUrl(tenant);
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  return response.json();
};

export const apiClients = {
  // Legacy API methods (for superuser and backward compatibility)
  async getTenants() {
    const response = await apiRequest('GET', '/api/tenants');
    return response.json();
  },

  async getTenant(slug: string) {
    const response = await apiRequest('GET', `/api/tenants/${slug}`);
    return response.json();
  },

  async getSyncStatus(slug: string): Promise<IntegrationStatus> {
    if (slug === 'superuser') {
      const response = await apiRequest('GET', `/api/tenants/${slug}/sync-status`);
      return response.json();
    }
    
    // For tenant-specific APIs, use health endpoint as sync status
    return makeTenantRequest(slug, '/health');
  },

  async getIntegrationLogs(slug: string) {
    if (slug === 'superuser') {
      const response = await apiRequest('GET', `/api/tenants/${slug}/logs`);
      const result = await response.json();
      // Ensure consistent data structure - return array directly or wrap in data property
      return Array.isArray(result) ? result : (result?.data || []);
    }
    
    return [];
  },

  async getN8nStatus(slug: string) {
    const response = await apiRequest('GET', `/api/n8n/status/${slug}`);
    return response.json();
  },

  // SwitchToSwag E-commerce API methods
  async getEcommerceDashboard(tenant: string) {
    return makeTenantRequest(tenant, '/api/ecommerce/dashboard');
  },

  async getProductionStatus(tenant: string) {
    return makeTenantRequest(tenant, '/api/ecommerce/production-status');
  },

  async updateOrderStatus(tenant: string, orderId: string, status: string) {
    return makeTenantRequest(tenant, `/api/ecommerce/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getInventory(tenant: string) {
    return makeTenantRequest(tenant, '/api/ecommerce/inventory');
  },

  // SudoTechServe SaaS API methods
  async getSaasDashboard(tenant: string) {
    return makeTenantRequest(tenant, '/api/saas/dashboard');
  },

  async getConversions(tenant: string) {
    return makeTenantRequest(tenant, '/api/saas/conversions');
  },

  async getProjects(tenant: string) {
    return makeTenantRequest(tenant, '/api/saas/projects');
  },

  async createClient(tenant: string, clientData: any) {
    return makeTenantRequest(tenant, '/api/saas/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },

  async getAnalytics(tenant: string, period?: string) {
    const query = period ? `?period=${period}` : '';
    return makeTenantRequest(tenant, `/api/saas/analytics${query}`);
  },

  // StrongTermStrategy Manufacturing API methods
  async getManufacturingDashboard(tenant: string) {
    return makeTenantRequest(tenant, '/api/manufacturing/dashboard');
  },

  async getProductionOverview(tenant: string) {
    return makeTenantRequest(tenant, '/api/manufacturing/production-overview');
  },

  async createManufacturingOrder(tenant: string, orderData: any) {
    return makeTenantRequest(tenant, '/api/manufacturing/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getManufacturingWorkflow(tenant: string, orderId: string) {
    return makeTenantRequest(tenant, `/api/manufacturing/workflow/${orderId}`);
  },

  async updateWorkflowStep(tenant: string, orderId: string, stepId: string, stepData: any) {
    return makeTenantRequest(tenant, `/api/manufacturing/workflow/${orderId}/step/${stepId}`, {
      method: 'PATCH',
      body: JSON.stringify(stepData),
    });
  },

  async getManufacturingLocations(tenant: string) {
    return makeTenantRequest(tenant, '/api/manufacturing/locations');
  },


  // Legacy methods for backward compatibility
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

  async refreshSync(slug: string) {
    const response = await apiRequest('POST', `/api/tenants/${slug}/refresh-sync`);
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
