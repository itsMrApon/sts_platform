/**
 * Saleor GraphQL API Client
 * 
 * A comprehensive client for interacting with Saleor's GraphQL API.
 * Handles authentication, error handling, and logging automatically.
 */

import { BaseClient } from '../base-client';
import { 
  SaleorConfig, 
  SaleorCustomer, 
  SaleorProduct, 
  SaleorOrder, 
  SaleorChannel, 
  SaleorWebhook,
  SaleorQueryParams,
  SaleorGraphQLResponse 
} from '../types/saleor';

export class SaleorClient extends BaseClient {
  private config: SaleorConfig;

  constructor(config: SaleorConfig) {
    super(config);
    this.config = config;
  }

  protected getSourceName(): 'saleor' {
    return 'saleor';
  }

  /**
   * Build Saleor GraphQL endpoint URL
   */
  private getGraphQLUrl(): string {
    return `${this.config.baseUrl}/graphql/`;
  }

  /**
   * Get authentication headers for Saleor API
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Saleor-API-Version': this.config.apiVersion || process.env.SALEOR_API_VERSION || '2023-10'
    };
    
    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }
    
    return headers;
  }

  /**
   * Make GraphQL request to Saleor API
   */
  private async makeGraphQLRequest<T>(
    query: string, 
    variables: Record<string, any> = {},
    logAction?: string
  ): Promise<T> {
    const url = this.getGraphQLUrl();
    
    const response = await this.makeRequest<SaleorGraphQLResponse<T>>(
      url,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ query, variables })
      },
      logAction
    );

    if (response.errors && response.errors.length > 0) {
      const errorMessages = response.errors.map(e => e.message).join('; ');
      throw new Error(`GraphQL errors: ${errorMessages}`);
    }

    return response.data as T;
  }

  // ==================== CUSTOMER OPERATIONS ====================

  /**
   * Get customers with pagination
   */
  async getCustomers(params: SaleorQueryParams = {}): Promise<{ customers: { edges: Array<{ node: SaleorCustomer }> } }> {
    const { first = 20 } = params;
    
    const query = `
      query GetCustomers($first: Int!) {
        customers(first: $first) {
          edges {
            node {
              id
              email
              firstName
              lastName
              isActive
              dateJoined
              defaultBillingAddress {
                id
                firstName
                lastName
                streetAddress1
                streetAddress2
                city
                postalCode
                country {
                  code
                  country
                }
                phone
              }
              defaultShippingAddress {
                id
                firstName
                lastName
                streetAddress1
                streetAddress2
                city
                postalCode
                country {
                  code
                  country
                }
                phone
              }
            }
          }
        }
      }
    `;

    return this.makeGraphQLRequest(query, { first }, 'get_customers');
  }

  // ==================== PRODUCT OPERATIONS ====================

  /**
   * Get products with pagination and channel filtering
   */
  async getProducts(params: SaleorQueryParams = {}): Promise<{ products: { edges: Array<{ node: SaleorProduct }> } }> {
    const { first = 20, channel } = params;
    const channelSlug = channel || this.config.channelSlug || process.env.SALEOR_CHANNEL || 'default-channel';
    
    const query = `
      query GetProducts($first: Int!, $channel: String!) {
        products(first: $first, channel: $channel) {
          edges {
            node {
              id
              name
              slug
              description
              isActive
              variants {
                id
                name
                sku
                price {
                  amount
                  currency
                }
                isActive
                trackInventory
                quantityAvailable
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `;

    return this.makeGraphQLRequest(query, { first, channel: channelSlug }, 'get_products');
  }

  /**
   * Create a new product
   */
  async createProduct(input: any): Promise<{ productCreate: { product: SaleorProduct; errors: any[] } }> {
    const mutation = `
      mutation CreateProduct($input: ProductCreateInput!) {
        productCreate(input: $input) {
          product {
            id
            name
            slug
            description
            isActive
          }
          errors {
            field
            message
            code
          }
        }
      }
    `;

    return this.makeGraphQLRequest(mutation, { input }, 'create_product');
  }

  // ==================== ORDER OPERATIONS ====================

  /**
   * Get orders with pagination and channel filtering
   */
  async getOrders(params: SaleorQueryParams = {}): Promise<{ orders: { edges: Array<{ node: SaleorOrder }> } }> {
    const { first = 20, channel } = params;
    const channelSlug = channel || this.config.channelSlug || process.env.SALEOR_CHANNEL || 'default-channel';
    
    const query = `
      query GetOrders($first: Int!, $channel: String!) {
        orders(first: $first, channel: $channel) {
          edges {
            node {
              id
              number
              status
              created
              total {
                gross {
                  amount
                  currency
                }
              }
              user {
                email
                firstName
                lastName
              }
              lines {
                id
                productName
                variantName
                quantity
                unitPrice {
                  gross {
                    amount
                    currency
                  }
                }
                totalPrice {
                  gross {
                    amount
                    currency
                  }
                }
              }
              shippingAddress {
                id
                firstName
                lastName
                streetAddress1
                streetAddress2
                city
                postalCode
                country {
                  code
                  country
                }
                phone
              }
              billingAddress {
                id
                firstName
                lastName
                streetAddress1
                streetAddress2
                city
                postalCode
                country {
                  code
                  country
                }
                phone
              }
            }
          }
        }
      }
    `;

    return this.makeGraphQLRequest(query, { first, channel: channelSlug }, 'get_orders');
  }

  // ==================== CHANNEL OPERATIONS ====================

  /**
   * Get all channels
   */
  async getChannels(): Promise<{ channels: SaleorChannel[] }> {
    const query = `
      query GetChannels {
        channels {
          id
          name
          slug
          isActive
          currencyCode
          defaultCountry {
            code
            country
          }
        }
      }
    `;

    return this.makeGraphQLRequest(query, {}, 'get_channels');
  }

  // ==================== WEBHOOK OPERATIONS ====================

  /**
   * Get all webhooks
   * Note: This is temporarily disabled due to Saleor API changes
   */
  async getWebhooks(): Promise<{ webhooks: { edges: Array<{ node: SaleorWebhook }> } }> {
    // Note: Saleor latest version has changed webhook query structure
    // For now, return empty result to avoid errors
    return { webhooks: { edges: [] } };
  }

  /**
   * Create a new webhook
   */
  async createWebhook(input: {
    name: string;
    targetUrl: string;
    isActive?: boolean;
    secretKey?: string | null;
    events?: string[];
    asyncEvents?: string[];
  }): Promise<{ webhookCreate: { webhook: SaleorWebhook; errors: any[] } }> {
    const mutation = `
      mutation CreateWebhook($input: WebhookCreateInput!) {
        webhookCreate(input: $input) {
          webhook { 
            id 
            name 
            targetUrl 
            isActive 
            asyncEvents 
            events 
            secretKey
          }
          errors { 
            field 
            message 
            code 
          }
        }
      }
    `;
    
    return this.makeGraphQLRequest(mutation, { input }, 'create_webhook');
  }

  /**
   * Update an existing webhook
   */
  async updateWebhook(
    id: string, 
    input: {
      name?: string;
      targetUrl?: string;
      isActive?: boolean;
      secretKey?: string | null;
      events?: string[];
      asyncEvents?: string[];
    }
  ): Promise<{ webhookUpdate: { webhook: SaleorWebhook; errors: any[] } }> {
    const mutation = `
      mutation UpdateWebhook($id: ID!, $input: WebhookUpdateInput!) {
        webhookUpdate(id: $id, input: $input) {
          webhook { 
            id 
            name 
            targetUrl 
            isActive 
            asyncEvents 
            events 
            secretKey
          }
          errors { 
            field 
            message 
            code 
          }
        }
      }
    `;
    
    return this.makeGraphQLRequest(mutation, { id, input }, 'update_webhook');
  }

  /**
   * Create or update customer sync webhook
   */
  async upsertCustomerWebhook(
    targetUrl: string, 
    secretKey?: string | null
  ): Promise<{ created: boolean; webhook: SaleorWebhook }> {
    try {
      // Try to find an existing webhook with same targetUrl
      const existingList = await this.getWebhooks();
      const nodes = existingList?.webhooks?.edges?.map((e: any) => e.node) || [];
      const found = nodes.find((w: any) => (w?.targetUrl || '').toLowerCase() === targetUrl.toLowerCase());
      
      if (found) {
        return { created: false, webhook: found };
      }

      // Create new webhook
      const input = {
        name: 'ERPNext Customer Sync',
        targetUrl,
        isActive: true,
        secretKey: secretKey || null,
        asyncEvents: ['CUSTOMER_CREATED', 'CUSTOMER_UPDATED', 'USER_CREATED', 'USER_UPDATED']
      };

      const result = await this.createWebhook(input);
      const webhook = result?.webhookCreate?.webhook;
      
      if (!webhook) {
        const errors = (result?.webhookCreate?.errors || []).map((e: any) => e.message).join(', ');
        throw new Error(`Failed to create webhook: ${errors || 'unknown error'}`);
      }
      
      return { created: true, webhook };
    } catch (error) {
      await this.logEvent('upsert_customer_webhook', 'error', { targetUrl }, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Update customer webhook by name
   */
  async updateCustomerWebhookByName(
    name: string, 
    targetUrl: string, 
    secretKey?: string | null
  ): Promise<{ updated: boolean; created: boolean; webhook: SaleorWebhook }> {
    try {
      // Try to find webhook by name
      const existingList = await this.getWebhooks();
      const nodes = existingList?.webhooks?.edges?.map((e: any) => e.node) || [];
      const byName = nodes.find((w: any) => (w?.name || '') === name);
      
      if (byName) {
        const input = {
          name,
          targetUrl,
          isActive: true,
          secretKey: secretKey || null,
          asyncEvents: ['CUSTOMER_CREATED', 'CUSTOMER_UPDATED', 'USER_CREATED', 'USER_UPDATED']
        };
        
        const result = await this.updateWebhook(byName.id, input);
        const webhook = result?.webhookUpdate?.webhook;
        
        if (!webhook) {
          const errors = (result?.webhookUpdate?.errors || []).map((e: any) => e.message).join(', ');
          throw new Error(`Failed to update webhook: ${errors || 'unknown error'}`);
        }
        
        return { updated: true, created: false, webhook };
      }

      // Fallback: create if not found
      const created = await this.upsertCustomerWebhook(targetUrl, secretKey);
      return { updated: false, created: true, webhook: created.webhook };
    } catch (error) {
      await this.logEvent('update_customer_webhook_by_name', 'error', { name, targetUrl }, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}
