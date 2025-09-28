/**
 * ERPNext API Client
 * 
 * A comprehensive client for interacting with ERPNext's REST API.
 * Handles authentication, error handling, and logging automatically.
 */

import { BaseClient } from '../base-client';
import { 
  ERPNextConfig, 
  ERPNextCustomer, 
  ERPNextAddress, 
  ERPNextItem, 
  ERPNextSupplier, 
  ERPNextSalesInvoice, 
  ERPNextProject, 
  ERPNextWebhook,
  ERPNextQueryParams 
} from '../types/erpnext';

export class ERPNextClient extends BaseClient {
  private config: ERPNextConfig;

  constructor(config: ERPNextConfig) {
    super(config);
    this.config = config;
  }

  protected getSourceName(): 'erpnext' {
    return 'erpnext';
  }

  /**
   * Build ERPNext API URL for a given resource
   */
  private buildUrl(endpoint: string): string {
    return `${this.config.baseUrl}/api/resource/${endpoint}`;
  }

  /**
   * Get authentication headers for ERPNext API
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.config.apiKey && this.config.apiSecret) {
      headers['Authorization'] = `token ${this.config.apiKey}:${this.config.apiSecret}`;
    }
    
    return headers;
  }

  /**
   * Make authenticated request to ERPNext API
   */
  private async makeERPNextRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    logAction?: string
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    
    return this.makeRequest<T>(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    }, logAction);
  }

  // ==================== CUSTOMER OPERATIONS ====================

  /**
   * Get customers with optional filtering and pagination
   */
  async getCustomers(params: ERPNextQueryParams = {}): Promise<ERPNextCustomer[]> {
    const { limit = 20, fields = ['name', 'customer_name', 'email_id', 'mobile_no'] } = params;
    
    const queryParams = new URLSearchParams({
      limit_page_length: limit.toString(),
      fields: JSON.stringify(fields)
    });

    if (params.filters) {
      queryParams.set('filters', JSON.stringify(params.filters));
    }

    if (params.order_by) {
      queryParams.set('order_by', params.order_by);
    }

    const endpoint = `Customer?${queryParams.toString()}`;
    return this.makeERPNextRequest<ERPNextCustomer[]>(endpoint, {}, 'get_customers');
  }

  /**
   * Find customer by email address
   */
  async findCustomerByEmail(email: string): Promise<ERPNextCustomer | undefined> {
    const filters = [['Customer', 'email_id', '=', email]];
    const customers = await this.getCustomers({ 
      filters, 
      limit: 1 
    });
    
    return customers.length > 0 ? customers[0] : undefined;
  }

  /**
   * Create a new customer
   */
  async createCustomer(customerData: Partial<ERPNextCustomer>): Promise<ERPNextCustomer> {
    const payload = {
      customer_name: customerData.customer_name || customerData.name,
      customer_type: customerData.customer_type || 'Individual',
      email_id: customerData.email_id || customerData.email,
      mobile_no: customerData.mobile_no || customerData.phone,
      ...customerData
    };

    return this.makeERPNextRequest<ERPNextCustomer>(
      'Customer',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      'create_customer'
    );
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(customerName: string, customerData: Partial<ERPNextCustomer>): Promise<ERPNextCustomer> {
    return this.makeERPNextRequest<ERPNextCustomer>(
      `Customer/${encodeURIComponent(customerName)}`,
      {
        method: 'PUT',
        body: JSON.stringify(customerData)
      },
      'update_customer'
    );
  }

  // ==================== ADDRESS OPERATIONS ====================

  /**
   * Create a new address linked to a customer
   */
  async createAddress(addressData: Partial<ERPNextAddress>): Promise<ERPNextAddress> {
    const payload = {
      address_title: addressData.address_title || 'Address',
      address_type: addressData.address_type || 'Billing',
      address_line1: addressData.address_line1 || '',
      address_line2: addressData.address_line2,
      city: addressData.city || '',
      state: addressData.state,
      pincode: addressData.pincode,
      country: addressData.country,
      phone: addressData.phone,
      email_id: addressData.email_id,
      links: addressData.links || [],
      ...addressData
    };

    return this.makeERPNextRequest<ERPNextAddress>(
      'Address',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      'create_address'
    );
  }

  // ==================== ITEM OPERATIONS ====================

  /**
   * Get items with optional filtering
   */
  async getItems(params: ERPNextQueryParams = {}): Promise<ERPNextItem[]> {
    const { limit = 20 } = params;
    const queryParams = new URLSearchParams({
      limit_page_length: limit.toString()
    });

    if (params.filters) {
      queryParams.set('filters', JSON.stringify(params.filters));
    }

    const endpoint = `Item?${queryParams.toString()}`;
    return this.makeERPNextRequest<ERPNextItem[]>(endpoint, {}, 'get_items');
  }

  /**
   * Create a new item
   */
  async createItem(itemData: Partial<ERPNextItem>): Promise<ERPNextItem> {
    return this.makeERPNextRequest<ERPNextItem>(
      'Item',
      {
        method: 'POST',
        body: JSON.stringify(itemData)
      },
      'create_item'
    );
  }

  // ==================== SUPPLIER OPERATIONS ====================

  /**
   * Get suppliers
   */
  async getSuppliers(params: ERPNextQueryParams = {}): Promise<ERPNextSupplier[]> {
    const { limit = 20 } = params;
    const queryParams = new URLSearchParams({
      limit_page_length: limit.toString()
    });

    const endpoint = `Supplier?${queryParams.toString()}`;
    return this.makeERPNextRequest<ERPNextSupplier[]>(endpoint, {}, 'get_suppliers');
  }

  // ==================== SALES INVOICE OPERATIONS ====================

  /**
   * Get sales invoices
   */
  async getSalesInvoices(params: ERPNextQueryParams = {}): Promise<ERPNextSalesInvoice[]> {
    const { limit = 20 } = params;
    const queryParams = new URLSearchParams({
      limit_page_length: limit.toString()
    });

    const endpoint = `Sales Invoice?${queryParams.toString()}`;
    return this.makeERPNextRequest<ERPNextSalesInvoice[]>(endpoint, {}, 'get_sales_invoices');
  }

  // ==================== PROJECT OPERATIONS ====================

  /**
   * Get projects
   */
  async getProjects(params: ERPNextQueryParams = {}): Promise<ERPNextProject[]> {
    const { limit = 20 } = params;
    const queryParams = new URLSearchParams({
      limit_page_length: limit.toString()
    });

    const endpoint = `Project?${queryParams.toString()}`;
    return this.makeERPNextRequest<ERPNextProject[]>(endpoint, {}, 'get_projects');
  }

  // ==================== SYSTEM OPERATIONS ====================

  /**
   * Get companies
   */
  async getCompanies(): Promise<any[]> {
    return this.makeERPNextRequest<any[]>('Company', {}, 'get_companies');
  }

  /**
   * Get warehouses
   */
  async getWarehouses(): Promise<any[]> {
    return this.makeERPNextRequest<any[]>('Warehouse', {}, 'get_warehouses');
  }

  // ==================== WEBHOOK OPERATIONS ====================

  /**
   * Create a webhook in ERPNext
   */
  async createWebhook(webhookData: Partial<ERPNextWebhook>): Promise<ERPNextWebhook> {
    const payload = {
      name: webhookData.name || 'API Webhook',
      webhook_doctype: webhookData.webhook_doctype || 'Customer',
      webhook_docevent: webhookData.webhook_docevent || 'after_insert',
      request_url: webhookData.request_url,
      is_enabled: webhookData.is_enabled !== false,
      request_method: webhookData.request_method || 'POST',
      ...webhookData
    };

    return this.makeERPNextRequest<ERPNextWebhook>(
      'Webhook',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      'create_webhook'
    );
  }
}
