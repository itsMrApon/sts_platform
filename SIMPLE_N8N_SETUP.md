# Simple n8n Setup - Central Automation Hub

## 🎯 What This Does

n8n acts as the **central brain** that connects all 4 systems:

- **Saleor** (E-commerce)
- **ERPNext** (ERP)
- **Your Backend** (Sync System)
- **n8n** (Automation Hub)

## 🚀 Quick Start (5 Minutes)

### 1. Start Everything

```bash
# Start all services
docker-compose up -d

# Check if n8n is running
docker-compose ps n8n
```

### 2. Access n8n

- Open: `http://localhost:5678`
- Login: `admin` / `admin123`

### 3. Import the Central Hub Workflow

1. In n8n, go to **Workflows** → **Import from File**
2. Select: `n8n-workflows/central-automation-hub.json`
3. Click **Import** and **Activate**

## 🔧 How to Use (SaaS Ready)

### Single Webhook for Everything

Your n8n automation hub has **ONE webhook** that handles all automation:

```
POST http://localhost:5678/webhook/automation
```

### Available Actions

#### 1. Sync Products

```bash
curl -X POST http://localhost:5678/webhook/automation \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_slug": "your-tenant",
    "action": "sync-products"
  }'
```

#### 2. Sync Orders

```bash
curl -X POST http://localhost:5678/webhook/automation \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_slug": "your-tenant",
    "action": "sync-orders"
  }'
```

#### 3. Sync Customers

```bash
curl -X POST http://localhost:5678/webhook/automation \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_slug": "your-tenant",
    "action": "sync-customers"
  }'
```

#### 4. Get Status

```bash
curl -X POST http://localhost:5678/webhook/automation \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_slug": "your-tenant",
    "action": "get-status"
  }'
```

## 🏢 SaaS Multi-Tenant Ready

### For Each Customer/Tenant:

1. **Same webhook URL** for all tenants
2. **Different `tenant_slug`** for each customer
3. **Automatic tenant isolation** in your backend
4. **Centralized logging** and monitoring

### Example for Multiple Tenants:

```bash
# Customer A
curl -X POST http://localhost:5678/webhook/automation \
  -d '{"tenant_slug": "customer-a", "action": "sync-products"}'

# Customer B
curl -X POST http://localhost:5678/webhook/automation \
  -d '{"tenant_slug": "customer-b", "action": "sync-orders"}'
```

## 📊 What Happens Automatically

1. **n8n receives** your webhook request
2. **Validates** tenant and action
3. **Calls your backend** API (no changes to your existing code)
4. **Your backend** syncs Saleor ↔ ERPNext
5. **n8n logs** everything for monitoring
6. **Returns** success/error response

## 🔍 Monitoring & Logs

### View n8n Executions

- Go to n8n → **Executions**
- See all automation runs
- Check success/failure rates

### View Backend Logs

```bash
# See all logs
docker-compose logs -f

# See just n8n logs
docker-compose logs -f n8n
```

## ⚡ Advanced Features (Optional)

### 1. Schedule Automatic Sync

In n8n, add a **Cron** trigger to run syncs automatically:

- Daily at 9 AM: `0 9 * * *`
- Every 6 hours: `0 */6 * * *`

### 2. Add More Actions

Edit the workflow and add new actions in the **Decision Engine** node:

```javascript
// Add new action
'sync-inventory': {
  description: 'Sync inventory levels',
  priority: 'medium',
  estimatedTime: '15s'
}
```

### 3. Error Notifications

Add **Email** or **Slack** nodes to get notified when automations fail.

## 🛠️ Troubleshooting

### n8n Won't Start

```bash
# Check logs
docker-compose logs n8n

# Restart
docker-compose restart n8n
```

### Webhook Not Working

1. Check if workflow is **Active** in n8n
2. Verify webhook URL: `http://localhost:5678/webhook/automation`
3. Check tenant exists in your backend

### Backend Connection Issues

```bash
# Test your backend
curl http://localhost:3000/api/tenants

# Check if n8n can reach backend
docker exec -it sts_n8n curl http://host.docker.internal:3000/api/tenants
```

## 🎉 You're Done!

Your n8n automation hub is now:

- ✅ **Connected** to all 4 systems
- ✅ **SaaS ready** for multiple tenants
- ✅ **Monitoring** all automation
- ✅ **Easy to use** with simple webhooks
- ✅ **No changes** to your existing workflows

Just use the webhook URL with different tenant slugs for each customer!
