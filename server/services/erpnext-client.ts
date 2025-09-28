import { storage } from "../storage";

export interface ERPNextConfig {
  baseUrl: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface ERPNextResponse<T = any> {
  message?: T;
  data?: T;
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

      const payload = (data && (data.message as T)) ?? (data && (data.data as T));
      return (payload as T);
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
    const fields = encodeURIComponent('["name","customer_name","email_id","mobile_no"]');
    return this.makeRequest(`Customer?fields=${fields}&limit_page_length=${limit}`);
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

  async getProjects(limit = 20): Promise<any[]> {
    return this.makeRequest(`Project?limit_page_length=${limit}`);
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

  async updateCustomer(name: string, data: any): Promise<any> {
    return this.makeRequest(`Customer/${encodeURIComponent(name)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async findCustomerByEmail(email: string): Promise<any | undefined> {
    const fields = encodeURIComponent(JSON.stringify(["name", "customer_name", "email_id", "mobile_no"]));
    const filters = encodeURIComponent(JSON.stringify([["Customer", "email_id", "=", email]]));
    const results = await this.makeRequest<any[]>(`Customer?fields=${fields}&filters=${filters}&limit_page_length=1`);
    if (Array.isArray(results) && results.length > 0) return results[0];
    return undefined;
  }

  async createAddress(data: any): Promise<any> {
    // ERPNext Address must include links to relate with Customer
    // Expected shape:
    // {
    //   address_title, address_type, address_line1, city, country,
    //   phone, email_id,
    //   links: [{ link_doctype: 'Customer', link_name: '<Customer Name>' }]
    // }
    return this.makeRequest(`Address`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async createWebhook(data: any): Promise<any> {
    // Minimal fields for ERPNext Webhook DocType
    // Example data:
    // {
    //   webhook_docevent: 'after_insert',
    //   webhook_doctype: 'Customer',
    //   request_url: 'http://localhost:4000/api/webhooks/erpnext/<slug>',
    //   name: 'ERPNext → Backend',
    //   is_enabled: 1
    // }
    return this.makeRequest(`Webhook`, {
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
    // Extract event type from payload for better logging
    const eventType = payload.event || 'webhook';
    const doctype = payload.doctype || 'Unknown';
    
    await storage.createIntegrationLog({
      tenantId: this.tenantId,
      source: "erpnext",
      action: `${eventType}_${doctype}`.toLowerCase(),
      status: "success",
      payload
    });
  }
}
