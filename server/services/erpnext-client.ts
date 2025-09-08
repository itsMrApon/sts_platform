import { storage } from "../storage";

export interface ERPNextConfig {
  baseUrl: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface ERPNextResponse<T = any> {
  message: T;
}

export class ERPNextClient {
  private config: ERPNextConfig;
  private tenantId: string;

  constructor(config: ERPNextConfig, tenantId: string) {
    this.config = config;
    this.tenantId = tenantId;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}/api/resource/${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.config.apiKey && this.config.apiSecret && {
        'Authorization': `token ${this.config.apiKey}:${this.config.apiSecret}`
      }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`ERPNext API error: ${response.status} ${response.statusText}`);
      }

      const data: ERPNextResponse<T> = await response.json();
      
      // Log successful integration
      await storage.createIntegrationLog({
        tenantId: this.tenantId,
        source: "erpnext",
        action: `${options.method || 'GET'} ${endpoint}`,
        status: "success",
        payload: { url, method: options.method || 'GET' }
      });

      return data.message;
    } catch (error) {
      // Log error
      await storage.createIntegrationLog({
        tenantId: this.tenantId,
        source: "erpnext",
        action: `${options.method || 'GET'} ${endpoint}`,
        status: "error",
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        payload: { url, method: options.method || 'GET' }
      });
      
      throw error;
    }
  }

  async getItems(limit = 20): Promise<any[]> {
    return this.makeRequest(`Item?limit_page_length=${limit}`);
  }

  async getCustomers(limit = 20): Promise<any[]> {
    return this.makeRequest(`Customer?limit_page_length=${limit}`);
  }

  async getSuppliers(limit = 20): Promise<any[]> {
    return this.makeRequest(`Supplier?limit_page_length=${limit}`);
  }

  async getSalesInvoices(limit = 20): Promise<any[]> {
    return this.makeRequest(`Sales Invoice?limit_page_length=${limit}`);
  }

  async getCompanies(): Promise<any[]> {
    return this.makeRequest(`Company`);
  }

  async getWarehouses(): Promise<any[]> {
    return this.makeRequest(`Warehouse`);
  }

  async createItem(data: any): Promise<any> {
    return this.makeRequest(`Item`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async createCustomer(data: any): Promise<any> {
    return this.makeRequest(`Customer`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateSyncStatus(recordCount: number): Promise<void> {
    await storage.updateSyncStatus(this.tenantId, "erpnext", {
      lastSyncAt: new Date(),
      recordCount,
      isActive: true
    });
  }

  async handleWebhook(payload: any): Promise<void> {
    await storage.createIntegrationLog({
      tenantId: this.tenantId,
      source: "erpnext",
      action: "webhook",
      status: "success",
      payload
    });
  }
}
