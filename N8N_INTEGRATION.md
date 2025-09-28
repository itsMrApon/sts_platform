# n8n Integration with Saleor-ERPNext Sync System

This document outlines the n8n automation integration with your Saleor-ERPNext sync system, enabling powerful workflow automation for your business processes.

## Overview

n8n is a powerful workflow automation tool that has been integrated into your Docker setup to provide automated synchronization between Saleor (e-commerce) and ERPNext (ERP) systems. This integration allows you to create sophisticated automation workflows without coding.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Saleor      │    │   Your App      │    │    ERPNext      │
│   (E-commerce)  │◄──►│  (Sync System)  │◄──►│     (ERP)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │      n8n        │
                       │  (Automation)   │
                       └─────────────────┘
```

## Docker Services

The following services are now available in your `docker-compose.yml`:

### 1. PostgreSQL Database

- **Container**: `sts_postgres`
- **Port**: 5432
- **Purpose**: Shared database for both your app and n8n

### 2. Redis Cache

- **Container**: `sts_redis`
- **Port**: 6379
- **Purpose**: Queue management for n8n workflows

### 3. n8n Automation

- **Container**: `sts_n8n`
- **Port**: 5678
- **Purpose**: Workflow automation and orchestration

## Getting Started

### 1. Start the Services

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f n8n
```

### 2. Access n8n Interface

1. Open your browser and go to: `http://localhost:5678`
2. Login with the default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

### 3. Configure Environment Variables

Create a `.env` file based on `env.example`:

```bash
cp env.example .env
```

Update the following variables in your `.env` file:

```env
# n8n Configuration
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-secure-password
N8N_HOST=localhost
WEBHOOK_URL=http://localhost:5678

# Your API Credentials
SALEOR_API_URL=https://your-saleor-instance.com/graphql/
SALEOR_API_TOKEN=your-saleor-api-token
ERPNEXT_API_URL=https://your-erpnext-instance.com/api/resource
ERPNEXT_API_KEY=your-erpnext-api-key
ERPNEXT_API_SECRET=your-erpnext-api-secret
```

## Available API Endpoints

Your Express server now includes the following n8n-specific endpoints:

### Webhook Triggers

- `POST /api/n8n/trigger/sync-products/:slug` - Trigger product synchronization
- `POST /api/n8n/trigger/sync-orders/:slug` - Trigger order synchronization
- `POST /api/n8n/trigger/sync-customers/:slug` - Trigger customer synchronization

### Status and Monitoring

- `GET /api/n8n/status/:slug` - Get n8n and system status
- `POST /api/n8n/execute/:slug` - Execute custom workflows

## Pre-built Workflow Templates

### 1. Product Sync Workflow (`product-sync-workflow.json`)

**Purpose**: Automatically synchronize products between Saleor and ERPNext

**Features**:

- Compares products from both systems
- Identifies products that need synchronization
- Logs sync operations for audit trail
- Provides detailed sync reports

**Webhook URL**: `http://localhost:5678/webhook/sync-products`

**Usage**:

```bash
curl -X POST http://localhost:5678/webhook/sync-products \
  -H "Content-Type: application/json" \
  -d '{"tenant_slug": "your-tenant-slug"}'
```

### 2. Order Sync Workflow (`order-sync-workflow.json`)

**Purpose**: Process orders from Saleor and create customer leads in ERPNext

**Features**:

- Fetches orders from Saleor
- Checks for existing customers in ERPNext
- Creates new leads for unknown customers
- Processes order data for ERPNext integration

**Webhook URL**: `http://localhost:5678/webhook/sync-orders`

**Usage**:

```bash
curl -X POST http://localhost:5678/webhook/sync-orders \
  -H "Content-Type: application/json" \
  -d '{"tenant_slug": "your-tenant-slug"}'
```

## Importing Workflow Templates

1. Access n8n at `http://localhost:5678`
2. Go to **Workflows** → **Import from File**
3. Select the JSON files from the `n8n-workflows/` directory
4. Configure the webhook URLs to match your setup
5. Activate the workflows

## Creating Custom Workflows

### Basic Workflow Structure

1. **Webhook Trigger**: Start point for external triggers
2. **HTTP Request**: Call your API endpoints
3. **Code Node**: Process and transform data
4. **Conditional Logic**: Make decisions based on data
5. **Logging**: Record workflow execution
6. **Response**: Return results to caller

### Example: Custom Product Update Workflow

```javascript
// Code Node Example
const products = $input.first().json.products?.edges || [];
const updatedProducts = [];

for (const productEdge of products) {
  const product = productEdge.node;

  // Check if product needs price update
  if (product.pricing?.priceRange?.start?.gross?.amount > 100) {
    updatedProducts.push({
      id: product.id,
      name: product.name,
      price: product.pricing.priceRange.start.gross.amount,
      action: "update_price",
    });
  }
}

return { json: { updatedProducts, count: updatedProducts.length } };
```

## Monitoring and Logging

### View Workflow Executions

1. Go to **Executions** in n8n interface
2. Monitor workflow runs, success rates, and errors
3. View detailed execution logs

### Application Logs

```bash
# View n8n logs
docker-compose logs -f n8n

# View application logs
docker-compose logs -f your-app-container

# View all logs
docker-compose logs -f
```

### Database Monitoring

```bash
# Connect to PostgreSQL
docker exec -it sts_postgres psql -U sts -d sts_db

# Check n8n tables
\dt n8n.*

# View workflow executions
SELECT * FROM n8n.execution_entity ORDER BY started_at DESC LIMIT 10;
```

## Security Considerations

### 1. Change Default Credentials

```env
N8N_BASIC_AUTH_USER=your-username
N8N_BASIC_AUTH_PASSWORD=your-secure-password
```

### 2. Use Environment Variables

Never hardcode sensitive data in workflows. Use n8n's credential system:

1. Go to **Settings** → **Credentials**
2. Add your API keys and secrets
3. Reference them in workflows using `{{ $credentials.yourCredentialName }}`

### 3. Network Security

- Use HTTPS in production
- Configure proper firewall rules
- Consider using VPN for internal communications

## Troubleshooting

### Common Issues

1. **n8n won't start**

   ```bash
   # Check logs
   docker-compose logs n8n

   # Restart service
   docker-compose restart n8n
   ```

2. **Webhook not receiving data**

   - Verify webhook URL is correct
   - Check if workflow is active
   - Ensure proper authentication

3. **Database connection issues**

   ```bash
   # Check PostgreSQL status
   docker-compose ps postgres

   # Test connection
   docker exec -it sts_postgres pg_isready -U sts
   ```

### Performance Optimization

1. **Redis Configuration**

   - Monitor Redis memory usage
   - Configure appropriate timeout values
   - Use Redis persistence for critical workflows

2. **Database Optimization**
   - Regular database maintenance
   - Monitor query performance
   - Clean up old execution logs

## Advanced Features

### 1. Scheduled Workflows

Create workflows that run on a schedule:

1. Add **Cron** trigger node
2. Set your desired schedule (e.g., `0 9 * * *` for daily at 9 AM)
3. Connect to your sync logic

### 2. Error Handling

Implement robust error handling:

1. Use **Try/Catch** nodes
2. Set up error notifications
3. Implement retry logic for failed operations

### 3. Data Transformation

Use **Code** nodes for complex data processing:

```javascript
// Advanced data transformation example
const inputData = $input.all();
const processedData = inputData.map((item) => {
  const data = item.json;

  return {
    ...data,
    processed_at: new Date().toISOString(),
    hash: require("crypto")
      .createHash("md5")
      .update(JSON.stringify(data))
      .digest("hex"),
  };
});

return processedData.map((item) => ({ json: item }));
```

## Support and Resources

- **n8n Documentation**: https://docs.n8n.io/
- **n8n Community**: https://community.n8n.io/
- **Workflow Examples**: Check the `n8n-workflows/` directory
- **API Documentation**: Available at `/api/docs` when running your application

## Next Steps

1. **Import the workflow templates** into n8n
2. **Configure your API credentials** in n8n
3. **Test the workflows** with sample data
4. **Create custom workflows** for your specific needs
5. **Set up monitoring** and alerting
6. **Schedule regular sync operations**

This integration provides a powerful foundation for automating your Saleor-ERPNext synchronization processes while maintaining flexibility for custom business logic.
