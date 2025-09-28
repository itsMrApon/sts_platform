# API Clients

This directory contains refactored, eloquent API clients for integrating with external services.

## Structure

```
clients/
├── types/           # TypeScript type definitions
│   ├── common.ts    # Shared types and interfaces
│   ├── erpnext.ts   # ERPNext-specific types
│   └── saleor.ts    # Saleor-specific types
├── erpnext/         # ERPNext client implementation
│   ├── erpnext-client.ts
│   └── index.ts
├── saleor/          # Saleor client implementation
│   ├── saleor-client.ts
│   └── index.ts
├── base-client.ts   # Base client with common functionality
├── index.ts         # Centralized exports
└── README.md        # This file
```

## Features

### 🏗️ **Base Client**

- Common HTTP request handling
- Automatic error handling and logging
- Integration event logging
- Sync status management

### 🔧 **ERPNext Client**

- **Customer Management**: Create, update, find customers by email
- **Address Management**: Create billing/shipping addresses
- **Item Management**: Get and create items
- **Supplier Management**: Get suppliers
- **Sales Invoice Management**: Get sales invoices
- **Project Management**: Get projects
- **Webhook Management**: Create webhooks
- **System Operations**: Get companies, warehouses

### 🛒 **Saleor Client**

- **Customer Management**: Get customers with full details
- **Product Management**: Get and create products
- **Order Management**: Get orders with full details
- **Channel Management**: Get channels
- **Webhook Management**: Create, update, and manage webhooks
- **GraphQL Integration**: Full GraphQL support with error handling

## Usage

### Import Clients

```typescript
import { ERPNextClient, SaleorClient } from "./clients";
```

### ERPNext Example

```typescript
const erpnext = new ERPNextClient({
  baseUrl: "https://your-erpnext.com",
  apiKey: "your-api-key",
  apiSecret: "your-api-secret",
  tenantId: "tenant-id",
});

// Get customers
const customers = await erpnext.getCustomers({ limit: 20 });

// Create customer
const newCustomer = await erpnext.createCustomer({
  customer_name: "John Doe",
  customer_type: "Individual",
  email_id: "john@example.com",
  mobile_no: "+1234567890",
});

// Find customer by email
const customer = await erpnext.findCustomerByEmail("john@example.com");
```

### Saleor Example

```typescript
const saleor = new SaleorClient({
  baseUrl: "https://your-saleor.com",
  token: "your-token",
  apiVersion: "2023-10",
  channelSlug: "default-channel",
  tenantId: "tenant-id",
});

// Get customers
const customers = await saleor.getCustomers({ first: 20 });

// Get products
const products = await saleor.getProducts({ first: 20 });

// Create webhook
const webhook = await saleor.upsertCustomerWebhook(
  "https://your-app.com/webhook",
  "secret-key"
);
```

## Type Safety

All clients are fully typed with TypeScript interfaces:

- **Common Types**: BaseConfig, ApiResponse, PaginationParams, etc.
- **ERPNext Types**: ERPNextCustomer, ERPNextAddress, ERPNextItem, etc.
- **Saleor Types**: SaleorCustomer, SaleorProduct, SaleorOrder, etc.

## Error Handling

All clients include comprehensive error handling:

- **Automatic Logging**: All requests and errors are logged
- **Graceful Degradation**: Errors don't break the main flow
- **Detailed Error Messages**: Clear error messages for debugging
- **Integration Monitoring**: Track success/failure rates

## Logging

Every operation is automatically logged:

```typescript
// Success logs
{
  source: 'erpnext',
  action: 'create_customer',
  status: 'success',
  payload: { duration: 150, status: 201 }
}

// Error logs
{
  source: 'saleor',
  action: 'get_products',
  status: 'error',
  errorMessage: 'HTTP 401: Unauthorized',
  payload: { duration: 50, status: 401 }
}
```

## Benefits

✅ **Maintainable**: Clean, organized code structure  
✅ **Type Safe**: Full TypeScript support  
✅ **Documented**: Comprehensive JSDoc comments  
✅ **Testable**: Easy to unit test  
✅ **Extensible**: Easy to add new methods  
✅ **Consistent**: Uniform API across all clients  
✅ **Robust**: Comprehensive error handling  
✅ **Observable**: Full logging and monitoring

## Migration from Old Clients

The new clients are backward compatible with the existing codebase. Simply update your imports:

```typescript
// Old
import { ERPNextClient } from "./services/erpnext-client";

// New
import { ERPNextClient } from "./clients";
```

All existing method calls will continue to work, but you can now take advantage of the improved type safety and error handling.
