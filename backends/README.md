# Multi-Tenant Backend APIs

This directory contains separate backend APIs for each tenant, designed for easy deployment to Docker and Vercel.

## 🏗️ Architecture

```
backends/
├── api-1-switchtoswag/          # E-commerce API (Port 4001)
├── api-2-sudotechserve/         # SaaS API (Port 4002)
├── api-3-strongtermstrategy/    # Supply Chain API (Port 4003)
├── shared/                      # Shared client libraries
├── docker-compose.yml           # Docker orchestration
└── start-all.sh                # Startup script
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for development)
- PostgreSQL and Redis (handled by Docker)

### Start All APIs

```bash
cd backends
./start-all.sh
```

### Individual Development

```bash
# API-1: SwitchToSwag (E-commerce)
cd api-1-switchtoswag
npm install
npm run dev

# API-2: SudoTechServe (SaaS)
cd api-2-sudotechserve
npm install
npm run dev

# API-3: StrongTermStrategy (Supply Chain)
cd api-3-strongtermstrategy
npm install
npm run dev
```

## 📡 API Endpoints

### API-1: SwitchToSwag (E-commerce) - Port 4001

- **Health**: `GET /health`
- **Dashboard**: `GET /api/ecommerce/dashboard`
- **Production Status**: `GET /api/ecommerce/production-status`
- **Inventory**: `GET /api/ecommerce/inventory`
- **Order Management**: `PATCH /api/ecommerce/orders/:id/status`

### API-2: SudoTechServe (SaaS) - Port 4002

- **Health**: `GET /health`
- **Dashboard**: `GET /api/saas/dashboard`
- **Conversions**: `GET /api/saas/conversions`
- **Projects**: `GET /api/saas/projects`
- **Analytics**: `GET /api/saas/analytics`
- **Client Management**: `POST /api/saas/clients`

### API-3: StrongTermStrategy (Supply Chain) - Port 4003

- **Health**: `GET /health`
- **Manufacturing Dashboard**: `GET /api/manufacturing/dashboard`
- **Production Overview**: `GET /api/manufacturing/production-overview`
- **Workflow Management**: `GET /api/manufacturing/workflow/:orderId`
- **Location Management**: `GET /api/manufacturing/locations`

## 🐳 Docker Deployment

### Build and Run

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables

Each API supports the following environment variables:

```env
# Common
NODE_ENV=production
PORT=4001
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
FRONTEND_URL=https://your-frontend.vercel.app

# API-1 Specific (SwitchToSwag)
SALEOR_URL=http://saleor-api:8000
SALEOR_TOKEN=your-token
ERPNEXT_URL=http://erpnext:8080
ERPNEXT_API_KEY=your-key
ERPNEXT_API_SECRET=your-secret

# API-2 Specific (SudoTechServe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# API-3 Specific (StrongTermStrategy)
ERPNEXT_URL=http://erpnext:8080
ERPNEXT_API_KEY=your-key
ERPNEXT_API_SECRET=your-secret
```

## 🌐 Frontend Integration

The frontend automatically routes to the correct API based on the selected tenant:

```typescript
// Frontend automatically uses:
// switchtoswag → http://localhost:4001
// sudotechserve → http://localhost:4002
// strongtermstrategy → http://localhost:4003
// superuser → http://localhost:4000 (legacy)
```

## 📦 Production Deployment

### Vercel Deployment

Each API can be deployed independently to Vercel:

```bash
# Deploy API-1
cd api-1-switchtoswag
vercel --prod

# Deploy API-2
cd api-2-sudotechserve
vercel --prod

# Deploy API-3
cd api-3-strongtermstrategy
vercel --prod
```

### Docker Deployment

Deploy to any Docker-compatible platform:

```bash
# Build images
docker-compose build

# Push to registry
docker-compose push

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Development

### Adding New Endpoints

1. Add route to appropriate API's `src/routes/` directory
2. Update frontend `api-clients.ts` with new methods
3. Test with the tenant-specific dashboard

### Shared Code

Common utilities and clients are in the `shared/` directory and can be imported by all APIs.

## 🏥 Health Monitoring

Each API provides a health endpoint:

- `GET /health` - Returns service status and timestamp

Monitor all APIs:

```bash
curl http://localhost:4001/health  # SwitchToSwag
curl http://localhost:4002/health  # SudoTechServe
curl http://localhost:4003/health  # StrongTermStrategy
```

## 🚨 Troubleshooting

### Saleor Not Working

1. Check if Saleor containers are running: `docker ps | grep saleor`
2. Verify Saleor URL and token in environment variables
3. Check Saleor logs: `docker logs saleor-platform-api-1`

### ERPNext Connection Issues

1. Verify ERPNext is running: `docker ps | grep frappe`
2. Check API credentials in environment variables
3. Test ERPNext connection: `curl http://localhost:8080/api/resource/Customer`

### Port Conflicts

If ports 4001-4003 are in use, update the ports in:

- `docker-compose.yml`
- Frontend `api-clients.ts`
- Individual API configurations
