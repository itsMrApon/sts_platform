# Legacy Server (Port 4000)

This server now serves as the **Superuser API** and handles system-wide operations that are shared across all tenants.

## 🎯 Current Purpose

### **Superuser Dashboard**

- Admin functions and system overview
- Integration status monitoring
- Cross-tenant operations

### **Shared Services**

- n8n automation workflows
- Webhook management
- Database operations
- Frontend serving (development)

### **System Management**

- Tenant management
- Global settings
- Health monitoring

## 📡 API Endpoints

### **System Management**

- `GET /api/tenants` - List all tenants
- `GET /api/tenants/:slug` - Get tenant details
- `GET /api/tenants/:slug/sync-status` - Integration status

### **n8n Integration**

- `GET /api/n8n/status/:tenant` - n8n workflow status
- `POST /api/n8n/automation/:tenant` - Trigger automation

### **Webhooks**

- `POST /api/webhooks/saleor/:tenant` - Saleor webhook handler
- `GET /api/tenants/:slug/webhooks/status` - Webhook status

### **Health & Monitoring**

- `GET /health` - System health check
- `GET /api/system/status` - Overall system status

## 🔄 Migration Status

### **Moved to Separate APIs:**

- ✅ **SwitchToSwag** → API-1 (Port 4001)
- ✅ **SudoTechServe** → API-2 (Port 4002)
- ✅ **StrongTermStrategy** → API-3 (Port 4003)

### **Still Handled Here:**

- 🔄 **Superuser** → Port 4000 (this server)
- 🔄 **n8n Integration** → Shared service
- 🔄 **Webhooks** → System-wide handling

## 🚀 Future Optimization

This server can be further simplified by:

1. Moving n8n to a separate microservice
2. Using a dedicated webhook service
3. Keeping only superuser and system management functions

## 📊 Port Allocation

- **Port 4000**: Superuser API (this server)
- **Port 4001**: SwitchToSwag E-commerce API
- **Port 4002**: SudoTechServe SaaS API
- **Port 4003**: StrongTermStrategy Supply Chain API
- **Port 5173**: Frontend (development)
