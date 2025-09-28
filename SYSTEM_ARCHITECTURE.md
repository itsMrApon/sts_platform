# System Architecture - n8n Central Automation Hub

## 🏗️ How Everything Connects

```
┌─────────────────────────────────────────────────────────────────┐
│                    n8n Central Automation Hub                  │
│                     (Port: 5678)                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Single Webhook Endpoint                      │   │
│  │        POST /webhook/automation                         │   │
│  │                                                         │   │
│  │  Input: { tenant_slug, action, data }                   │   │
│  │  Actions: sync-products, sync-orders, sync-customers,   │   │
│  │           get-status                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Your Backend API                            │
│                     (Port: 3000)                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │        POST /api/n8n/automation/:slug                   │   │
│  │                                                         │   │
│  │  • Validates tenant                                     │   │
│  │  • Routes to existing APIs                              │   │
│  │  • No changes to your current code                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │     Saleor      │ │    ERPNext      │ │   PostgreSQL    │
    │   (E-commerce)  │ │      (ERP)      │ │   (Database)    │
    │                 │ │                 │ │                 │
    │ • Products      │ │ • Items         │ │ • Tenants       │
    │ • Orders        │ │ • Customers     │ │ • Sync Status   │
    │ • Customers     │ │ • Leads         │ │ • Logs          │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🔄 Data Flow

### 1. **Trigger** (External System or Manual)

```bash
curl -X POST http://localhost:5678/webhook/automation \
  -d '{"tenant_slug": "customer-a", "action": "sync-products"}'
```

### 2. **n8n Processing**

- ✅ Validates input
- ✅ Logs request
- ✅ Calls your backend

### 3. **Your Backend** (No Changes!)

- ✅ Validates tenant
- ✅ Calls existing Saleor/ERPNext APIs
- ✅ Returns results

### 4. **n8n Response**

- ✅ Logs execution
- ✅ Returns success/error
- ✅ Monitors performance

## 🏢 SaaS Multi-Tenant Ready

### For Each Customer:

```
Customer A: {"tenant_slug": "customer-a", "action": "sync-products"}
Customer B: {"tenant_slug": "customer-b", "action": "sync-orders"}
Customer C: {"tenant_slug": "customer-c", "action": "get-status"}
```

### Same Webhook, Different Tenants:

- **One n8n instance** handles all customers
- **Tenant isolation** in your backend
- **Centralized monitoring** and logging
- **Easy to scale** for SaaS

## 🚀 Quick Start Commands

```bash
# 1. Start everything
docker-compose up -d

# 2. Check status
docker-compose ps

# 3. Test automation
./test-n8n.sh

# 4. Access n8n
open http://localhost:5678
```

## 📊 What You Get

### ✅ **Centralized Control**

- One place to manage all automation
- Easy to add new actions
- Centralized logging and monitoring

### ✅ **SaaS Ready**

- Multi-tenant support
- Easy customer onboarding
- Scalable architecture

### ✅ **No Code Changes**

- Your existing APIs work unchanged
- Just added one new endpoint
- Backward compatible

### ✅ **Easy to Use**

- Simple webhook interface
- Clear action-based API
- Comprehensive documentation

## 🎯 Perfect for SaaS Business

This setup is ideal for:

- **Multi-tenant SaaS** applications
- **White-label** solutions
- **Customer self-service** automation
- **Centralized monitoring** and management
- **Easy scaling** as you grow

Your customers can use the same webhook with their tenant slug, and everything is automatically handled!
