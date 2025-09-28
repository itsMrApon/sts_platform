import { storage } from "../storage";

export interface SaleorConfig {
  baseUrl: string;
  token?: string;
  apiVersion?: string;
  channelSlug?: string;
}

export class SaleorClient {
  private config: SaleorConfig;
  private tenantId: string;

  constructor(config: SaleorConfig, tenantId: string) {
    this.config = config;
    this.tenantId = tenantId;
  }

  private async makeGraphQLRequest<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
    const url = `${this.config.baseUrl}/graphql/`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.config.token && {
        'Authorization': `Bearer ${this.config.token}`
      }),
      // Ensure we speak the correct API version to avoid enum mismatches (e.g., OrderStatus UNCONFIRMED)
      'Saleor-API-Version': this.config.apiVersion || process.env.SALEOR_API_VERSION || '2023-10'
    } as Record<string, string>;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Saleor request failed: ${response.status} ${text}`);
      }

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors.map((e: any) => e.message).join("; "));
      }

      // Persist basic stats (best-effort)
      try {
        await storage.createIntegrationLog({
          tenantId: this.tenantId,
          source: 'saleor',
          action: 'graphql_request',
          status: 'success',
          payload: {
            operationSummary: query.slice(0, 80),
            variables,
            timestamp: new Date().toISOString()
          }
        });
      } catch {}

      return result.data as T;
    } catch (error) {
      try {
        await storage.createIntegrationLog({
          tenantId: this.tenantId,
          source: 'saleor',
          action: 'graphql_error',
          status: 'error',
          errorMessage: error instanceof Error ? error.message : String(error),
          payload: { timestamp: new Date().toISOString() }
        });
      } catch {}
      throw error;
    }
  }

  async getProducts(first = 20): Promise<any> {
    const query = `
      query GetProducts($first: Int!, $channel: String!) {
        products(first: $first, channel: $channel) {
          edges {
            node {
              id
              name
              slug
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `;

    const channel = this.config.channelSlug || process.env.SALEOR_CHANNEL || 'default-channel';
    const data = await this.makeGraphQLRequest(query, { first, channel });
    return data;
  }

  async getOrders(first = 20): Promise<any> {
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
            }
          }
        }
      }
    `;

    const channel = this.config.channelSlug || process.env.SALEOR_CHANNEL || 'default-channel';
    const data = await this.makeGraphQLRequest(query, { first, channel });
    return data;
  }

  async getCustomers(first = 20): Promise<any> {
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

    const data = await this.makeGraphQLRequest(query, { first });
    return data;
  }

  async getChannels(): Promise<any> {
    const query = `
      query GetChannels {
        channels {
          id
          name
          slug
          isActive
          currencyCode
        }
      }
    `;

    return this.makeGraphQLRequest(query);
  }

  async createProduct(input: any): Promise<any> {
    const mutation = `
      mutation CreateProduct($input: ProductCreateInput!) {
        productCreate(input: $input) {
          product {
            id
            name
            slug
          }
          errors {
            field
            message
          }
        }
      }
    `;

    return this.makeGraphQLRequest(mutation, { input });
  }

  async updateSyncStatus(count: number): Promise<void> {
    await storage.updateSyncStatus(this.tenantId, 'saleor', {
      lastSyncAt: new Date(),
      recordCount: count,
      isActive: true
    }).catch(() => {});
  }

  async handleWebhook(payload: any): Promise<void> {
    await storage.createIntegrationLog({
      tenantId: this.tenantId,
      source: 'saleor',
      action: 'webhook_received',
      status: 'success',
      payload
    }).catch(() => {});
  }

  // Webhook management
  async getWebhooks(): Promise<any> {
    // Note: Saleor latest version has changed webhook query structure
    // For now, return empty result to avoid errors
    return { webhooks: { edges: [] } };
  }

  async createWebhook(input: { name: string; targetUrl: string; isActive?: boolean; secretKey?: string | null; events?: string[]; asyncEvents?: string[]; }): Promise<any> {
    const mutation = `
      mutation CreateWebhook($input: WebhookCreateInput!) {
        webhookCreate(input: $input) {
          webhook { id name targetUrl isActive asyncEvents events }
          errors { field message code }
        }
      }
    `;
    return this.makeGraphQLRequest(mutation, { input });
  }

  async updateWebhook(id: string, input: { name?: string; targetUrl?: string; isActive?: boolean; secretKey?: string | null; events?: string[]; asyncEvents?: string[]; }): Promise<any> {
    const mutation = `
      mutation UpdateWebhook($id: ID!, $input: WebhookUpdateInput!) {
        webhookUpdate(id: $id, input: $input) {
          webhook { id name targetUrl isActive asyncEvents events }
          errors { field message code }
        }
      }
    `;
    return this.makeGraphQLRequest(mutation, { id, input });
  }

  async updateCustomerWebhookByName(name: string, targetUrl: string, secretKey?: string | null): Promise<{ updated: boolean; created: boolean; webhook: any; }> {
    // Try find by name first
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
      } as any;
      const result = await this.updateWebhook(byName.id, input);
      const webhook = result?.webhookUpdate?.webhook;
      if (!webhook) {
        const err = (result?.webhookUpdate?.errors || []).map((e: any) => e.message).join(", ");
        throw new Error(`Failed to update webhook: ${err || 'unknown error'}`);
      }
      return { updated: true, created: false, webhook };
    }

    // Fallback: create if not found
    const created = await this.upsertCustomerWebhook(targetUrl, secretKey);
    return { updated: false, created: true, webhook: created.webhook };
  }
  async upsertCustomerWebhook(targetUrl: string, secretKey?: string | null): Promise<{ created: boolean; webhook: any; }> {
    // Try to find an existing webhook with same targetUrl
    const existingList = await this.getWebhooks();
    const nodes = existingList?.webhooks?.edges?.map((e: any) => e.node) || [];
    const found = nodes.find((w: any) => (w?.targetUrl || '').toLowerCase() === targetUrl.toLowerCase());
    if (found) {
      return { created: false, webhook: found };
    }

    // Minimal create: asyncEvents for customer created/updated
    const input = {
      name: 'ERPNext Customer Sync',
      targetUrl,
      isActive: true,
      secretKey: secretKey || null,
      asyncEvents: ['CUSTOMER_CREATED', 'CUSTOMER_UPDATED', 'USER_CREATED', 'USER_UPDATED']
    } as any;

    const result = await this.createWebhook(input);
    const webhook = result?.webhookCreate?.webhook;
    if (!webhook) {
      const err = (result?.webhookCreate?.errors || []).map((e: any) => e.message).join(", ");
      throw new Error(`Failed to create webhook: ${err || 'unknown error'}`);
    }
    return { created: true, webhook };
  }
}
