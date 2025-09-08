import { storage } from "../storage";

export interface SaleorConfig {
  baseUrl: string;
  token?: string;
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
      ...(this.config.token && {
        'Authorization': `Bearer ${this.config.token}`
      }),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`Saleor API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`);
      }

      // Log successful integration
      await storage.createIntegrationLog({
        tenantId: this.tenantId,
        source: "saleor",
        action: "graphql_query",
        status: "success",
        payload: { query: query.slice(0, 100) + '...', variables }
      });

      return data.data;
    } catch (error) {
      // Log error
      await storage.createIntegrationLog({
        tenantId: this.tenantId,
        source: "saleor",
        action: "graphql_query", 
        status: "error",
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        payload: { query: query.slice(0, 100) + '...', variables }
      });
      
      throw error;
    }
  }

  async getProducts(first = 20): Promise<any> {
    const query = `
      query GetProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              name
              slug
              description
              category {
                name
              }
              variants {
                id
                name
                sku
                pricing {
                  price {
                    amount
                    currency
                  }
                }
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

    const data = await this.makeGraphQLRequest(query, { first });
    return data;
  }

  async getOrders(first = 20): Promise<any> {
    const query = `
      query GetOrders($first: Int!) {
        orders(first: $first) {
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

  async updateSyncStatus(recordCount: number): Promise<void> {
    await storage.updateSyncStatus(this.tenantId, "saleor", {
      lastSyncAt: new Date(),
      recordCount,
      isActive: true
    });
  }

  async handleWebhook(payload: any): Promise<void> {
    await storage.createIntegrationLog({
      tenantId: this.tenantId,
      source: "saleor",
      action: "webhook",
      status: "success",
      payload
    });
  }
}
