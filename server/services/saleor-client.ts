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
      'Accept': 'application/json',
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
        const bodyText = await response.text().catch(() => '');
        throw new Error(`Saleor API error: ${response.status} ${response.statusText}${bodyText ? ` :: ${bodyText}` : ''}`);
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
    try {
      const eventType = payload.event_type || 'unknown';
      const objectId = payload.object_id || 'unknown';
      
      // Log the webhook event
      await storage.createIntegrationLog({
        tenantId: this.tenantId,
        source: "saleor",
        action: `webhook_${eventType}`,
        status: "success",
        payload: {
          event_type: eventType,
          object_id: objectId,
          timestamp: new Date().toISOString()
        }
      });

      // Handle different webhook events
      switch (eventType) {
        // Product Events
        case 'PRODUCT_CREATED':
        case 'PRODUCT_UPDATED':
        case 'PRODUCT_DELETED':
          await this.updateSyncStatus(await this.getProductCount());
          break;
        
        // Product Variant Events
        case 'PRODUCT_VARIANT_CREATED':
        case 'PRODUCT_VARIANT_UPDATED':
        case 'PRODUCT_VARIANT_DELETED':
          await this.logVariantEvent(eventType, objectId);
          break;
        
        // Stock Events
        case 'PRODUCT_VARIANT_STOCK_UPDATED':
        case 'PRODUCT_VARIANT_BACK_IN_STOCK':
        case 'PRODUCT_VARIANT_OUT_OF_STOCK':
          await this.logStockEvent(eventType, objectId);
          break;
        
        // Order Events
        case 'ORDER_CREATED':
        case 'ORDER_UPDATED':
        case 'ORDER_CANCELLED':
          await this.logOrderEvent(eventType, objectId);
          break;
        
        // Customer Events
        case 'CUSTOMER_CREATED':
        case 'CUSTOMER_UPDATED':
          await this.logCustomerEvent(eventType, objectId);
          break;
        
        // Inventory Events
        case 'PRODUCT_VARIANT_STOCK_UPDATED':
          await this.logInventoryEvent(eventType, objectId);
          break;
        
        // Collection Events
        case 'COLLECTION_CREATED':
        case 'COLLECTION_UPDATED':
        case 'COLLECTION_DELETED':
          await this.logCollectionEvent(eventType, objectId);
          break;
        
        // Category Events
        case 'CATEGORY_CREATED':
        case 'CATEGORY_UPDATED':
        case 'CATEGORY_DELETED':
          await this.logCategoryEvent(eventType, objectId);
          break;
        
        // Checkout Events
        case 'CHECKOUT_CREATED':
        case 'CHECKOUT_UPDATED':
          await this.logCheckoutEvent(eventType, objectId);
          break;
        
        default:
          console.log(`Unhandled webhook event: ${eventType}`);
      }
    } catch (error) {
      await storage.createIntegrationLog({
        tenantId: this.tenantId,
        source: "saleor",
        action: "webhook_error",
        status: "error",
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        payload
      });
      throw error;
    }
  }

  private async getProductCount(): Promise<number> {
    try {
      const products = await this.getProducts(1);
      return products.products?.edges?.length || 0;
    } catch {
      return 0;
    }
  }

  private async logOrderEvent(eventType: string, objectId: string): Promise<void> {
    await storage.createIntegrationLog({
      tenantId: this.tenantId,
      source: "saleor",
      action: `order_${eventType.toLowerCase()}`,
      status: "success",
      payload: {
        event_type: eventType,
        order_id: objectId,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async logCustomerEvent(eventType: string, objectId: string): Promise<void> {
    await storage.createIntegrationLog({
      tenantId: this.tenantId,
      source: "saleor",
      action: `customer_${eventType.toLowerCase()}`,
      status: "success",
      payload: {
        event_type: eventType,
        customer_id: objectId,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async logInventoryEvent(eventType: string, objectId: string): Promise<void> {
    await storage.createIntegrationLog({
      tenantId: this.tenantId,
      source: "saleor",
      action: `inventory_${eventType.toLowerCase()}`,
      status: "success",
      payload: {
        event_type: eventType,
        variant_id: objectId,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async logCollectionEvent(eventType: string, objectId: string): Promise<void> {
    await storage.createIntegrationLog({
      tenantId: this.tenantId,
      source: "saleor",
      action: `collection_${eventType.toLowerCase()}`,
      status: "success",
      payload: {
        event_type: eventType,
        collection_id: objectId,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async logCategoryEvent(eventType: string, objectId: string): Promise<void> {
    await storage.createIntegrationLog({
      tenantId: this.tenantId,
      source: "saleor",
      action: `category_${eventType.toLowerCase()}`,
      status: "success",
      payload: {
        event_type: eventType,
        category_id: objectId,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async logCheckoutEvent(eventType: string, objectId: string): Promise<void> {
    await storage.createIntegrationLog({
      tenantId: this.tenantId,
      source: "saleor",
      action: `checkout_${eventType.toLowerCase()}`,
      status: "success",
      payload: {
        event_type: eventType,
        checkout_id: objectId,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async logVariantEvent(eventType: string, objectId: string): Promise<void> {
    await storage.createIntegrationLog({
      tenantId: this.tenantId,
      source: "saleor",
      action: `variant_${eventType.toLowerCase()}`,
      status: "success",
      payload: {
        event_type: eventType,
        variant_id: objectId,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async logStockEvent(eventType: string, objectId: string): Promise<void> {
    await storage.createIntegrationLog({
      tenantId: this.tenantId,
      source: "saleor",
      action: `stock_${eventType.toLowerCase()}`,
      status: "success",
      payload: {
        event_type: eventType,
        variant_id: objectId,
        timestamp: new Date().toISOString()
      }
    });
  }
}
