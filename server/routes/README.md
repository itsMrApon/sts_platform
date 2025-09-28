# Routes Structure

This directory contains a clean, eloquent, and maintainable route structure following standard practices.

## 📁 Directory Structure

```
routes/
├── handlers/           # Route handler functions
│   ├── tenant.ts      # Tenant-related handlers
│   ├── sync.ts        # Sync status handlers
│   ├── erpnext.ts     # ERPNext API handlers
│   ├── saleor.ts      # Saleor API handlers
│   ├── customer-sync.ts # Customer sync handlers
│   ├── webhooks.ts    # Webhook handlers
│   └── n8n.ts         # n8n automation handlers
├── middleware/         # Reusable middleware
│   ├── tenant.ts      # Tenant validation middleware
│   └── validation.ts  # Request validation middleware
├── types/             # TypeScript type definitions
│   └── index.ts       # Route types and interfaces
├── utils/             # Utility functions
│   ├── client-factory.ts # API client factory functions
│   └── response.ts    # Response utility functions
├── index.ts           # Main routes configuration
└── README.md          # This file
```

## 🎯 Key Features

### **🏗️ Modular Architecture**

- **Separation of Concerns**: Each domain has its own handler file
- **Reusable Middleware**: Common functionality extracted into middleware
- **Type Safety**: Full TypeScript support with proper interfaces
- **Clean Imports**: Organized imports and exports

### **🛡️ Middleware System**

- **Tenant Validation**: Automatic tenant lookup and validation
- **Service Validation**: Ensure required services are configured
- **Request Validation**: Zod-based request validation
- **Error Handling**: Consistent error handling across all routes

### **📝 Handler Organization**

- **Single Responsibility**: Each handler has one clear purpose
- **Consistent Patterns**: All handlers follow the same structure
- **Error Handling**: Proper error handling and logging
- **Type Safety**: Full TypeScript support

## 🚀 Usage Examples

### **Basic Route Handler**

```typescript
export const getItems: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const client = createERPNextClient(tenant);
    const items = await client.getItems({ limit: 20 });
    sendSuccess(res, items);
  } catch (error) {
    sendError(res, 500, "Failed to fetch items", error);
  }
};
```

### **Using Middleware**

```typescript
// Automatic tenant validation
app.get("/api/tenants/:slug/items", withTenant(getItems));

// Tenant + service validation
app.get(
  "/api/tenants/:slug/erpnext/items",
  withTenantAndService("erpnext")(getItems)
);

// With validation
app.post(
  "/api/tenants/:slug/webhook",
  validateBody(webhookSchemas.createWebhook),
  withTenant(createWebhook)
);
```

### **Response Helpers**

```typescript
// Success response
sendSuccess(res, data, "Operation completed");

// Error response
sendError(res, 404, "Resource not found");

// Validation error
sendValidationError(res, validationErrors);
```

## 📊 Route Categories

### **🏢 Tenant Routes**

- `GET /api/tenants` - Get all tenants
- `GET /api/tenants/:slug` - Get tenant by slug

### **🔄 Sync Routes**

- `GET /api/tenants/:slug/sync-status` - Get sync status
- `POST /api/tenants/:slug/refresh-sync` - Refresh sync status

### **🔧 ERPNext Routes**

- `GET /api/tenants/:slug/erpnext/items` - Get items
- `GET /api/tenants/:slug/erpnext/customers` - Get customers
- `GET /api/tenants/:slug/erpnext/projects` - Get projects
- `POST /api/tenants/:slug/erpnext/create-webhook` - Create webhook

### **🛒 Saleor Routes**

- `GET /api/tenants/:slug/saleor/customers` - Get customers
- `GET /api/tenants/:slug/saleor/products` - Get products
- `GET /api/tenants/:slug/saleor/orders` - Get orders
- `POST /api/tenants/:slug/saleor/create-customer-webhook` - Create webhook

### **🔄 Sync Routes**

- `POST /api/tenants/:slug/sync/customers` - Sync customers

### **🔗 Webhook Routes**

- `GET /api/tenants/:slug/webhooks/status` - Get webhook status
- `POST /api/webhooks/erpnext/:slug` - ERPNext webhook
- `POST /api/webhooks/saleor/:slug` - Saleor webhook

### **🤖 n8n Routes**

- `POST /api/n8n/automation/:slug` - Handle automation
- `GET /api/n8n/status/:slug` - Get n8n status
- `POST /api/n8n/execute/:slug` - Execute workflow

## 🎨 Benefits

✅ **Maintainable**: Easy to find and modify specific functionality  
✅ **Testable**: Each handler can be unit tested independently  
✅ **Scalable**: Easy to add new routes and handlers  
✅ **Type Safe**: Full TypeScript support with proper interfaces  
✅ **Consistent**: Uniform patterns across all routes  
✅ **Reusable**: Middleware and utilities can be reused  
✅ **Documented**: Clear structure and naming conventions  
✅ **Error Handling**: Consistent error handling and logging

## 🔧 Adding New Routes

1. **Create Handler**: Add handler function in appropriate domain file
2. **Add Types**: Define any new types in `types/index.ts`
3. **Register Route**: Add route in `index.ts` with appropriate middleware
4. **Test**: Ensure proper error handling and validation

## 📈 Migration from Old Structure

The new structure is fully backward compatible. All existing API endpoints work exactly the same, but now with:

- Better organization and maintainability
- Improved error handling and validation
- Type safety and better developer experience
- Easier testing and debugging
- Cleaner, more readable code

This structure follows industry best practices and makes the codebase much more maintainable and scalable! 🚀
