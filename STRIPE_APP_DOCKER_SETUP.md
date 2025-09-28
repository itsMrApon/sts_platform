# Saleor Stripe App Docker Setup Guide

## Overview

This document details the complete process of containerizing a Saleor Stripe payment app to work with Saleor e-commerce platform running in Docker containers. The app is part of a pnpm monorepo workspace with complex dependencies.

## Project Structure

```
saleor-platform/
├── docker-compose.yml (Saleor services)
├── docker-compose.override.yml (Stripe app service)
└── apps/ (separate monorepo)
    ├── package.json
    ├── pnpm-workspace.yaml
    ├── apps/stripe/ (the Stripe payment app)
    └── packages/ (shared workspace packages)
```

## Issues Encountered and Solutions

### 1. Initial Problem: Manifest URL Accessibility

**Issue**: Saleor Dashboard (running in Docker) couldn't access locally running Stripe app at `http://localhost:3000`
**Error**: `Can't fetch manifest data. Please try later. Error code INVALID on field manifestUrl`

**Root Cause**: Saleor's `requests_hardened` library blocks private IP addresses for security
**Error Details**: `requests_hardened.ip_filter Forbidden IP address`

**Solutions**:

1. **Containerize the Stripe app** to run alongside Saleor in Docker
2. **Add host IP to ALLOWED_HOSTS** in `backend.env`:
   ```
   ALLOWED_HOSTS=localhost,127.0.0.1,192.168.86.41,stripe-app
   ```
3. **Use Docker service networking**: `http://stripe-app:3000` for internal communication

### 2. Monorepo Dependencies Issue

**Issue**: The Stripe app is part of a pnpm workspace with catalog references like `"@sentry/nextjs": "catalog:"`
**Error**: Initial Dockerfile failed because workspace dependencies weren't properly resolved

**Solution**:

- Copy entire workspace structure including `packages/` and `apps/` directories
- Install dependencies for the entire workspace: `pnpm install --no-frozen-lockfile`
- Use pnpm filter to build only the stripe app: `pnpm --filter saleor-app-payment-stripe build`

### 3. Node.js Version Compatibility

**Issue**: Workspace requires Node.js 22+ but initially used Node 18
**Error**: Build failures due to incompatible Node version

**Solution**: Updated Dockerfile to use `node:22-alpine` base image

### 4. Next.js Binary Path Issue

**Issue**: Container couldn't find the `next` binary to run `next start`
**Error**: `Cannot find module '/app/node_modules/.bin/next'`

**Root Cause**:

- pnpm workspace structure stores binaries in `.pnpm` directory with complex paths
- The `next` binary was located at `/app/node_modules/.pnpm/next@15.2.4_.../node_modules/next/dist/bin/next`
- No symlink existed in the main `node_modules/.bin/` directory

**Solution**: Use Next.js standalone output feature instead of trying to resolve complex pnpm paths

### 5. Next.js Standalone Output Implementation

**Issue**: Missing dependencies when using standalone output
**Error**: `Cannot find module 'react/jsx-runtime'` and `Cannot find module 'next/dist/compiled/next-server/app-route.runtime.prod.js'`

**Solution**:

- Use Next.js `output: 'standalone'` configuration (already present in `next.config.ts`)
- Copy standalone output from build stage: `COPY --from=builder /app/apps/stripe/.next/standalone ./`
- Copy static files: `COPY --from=builder /app/apps/stripe/.next/static ./.next/static`
- Use the generated `server.js` file: `CMD ["node", "apps/stripe/server.js"]`

### 6. Production Dependencies Installation

**Issue**: `pnpm install --prod` failed due to husky prepare scripts
**Error**: `ELIFECYCLE Command failed. prepare$ husky sh: husky: not found`

**Solution**: Skip prepare scripts during production install: `pnpm install --prod --frozen-lockfile --ignore-scripts`

### 7. Docker App Blank Page Issue

**Issue**: Docker Stripe app showing blank page while local version worked fine
**Root Cause**:

- Development volumes in `docker-compose.override.yml` were overriding production build
- Incorrect static file paths in Dockerfile for Next.js standalone build

**Solutions**:

1. **Remove volumes section** from `docker-compose.override.yml` that mounts local code
2. **Fix static file paths** in Dockerfile:
   ```dockerfile
   COPY --from=builder /app/apps/stripe/.next/static ./apps/stripe/.next/static
   COPY --from=builder /app/apps/stripe/public ./apps/stripe/public
   ```

### 8. Payment Flow Issues

**Issue**: Capture button not appearing or failing with various errors
**Errors Encountered**:

- `Cannot find successful auth transaction`
- `Unrecognized request URL (POST: /v1/payment_intents//capture)`
- `TypeError: TaxedMoney.__init__() got an unexpected keyword argument 'currency'`

**Root Causes & Solutions**:

1. **Missing Auth Transaction**: Create `TransactionKind.AUTH` before attempting capture
2. **Empty Payment Intent ID**: Update transaction `gateway_response` with valid Stripe Payment Intent ID
3. **Automatic Capture Enabled**: Disable `automatic_payment_capture` in Stripe plugin settings
4. **Incorrect Object Creation**: Use proper Saleor model constructors for orders, payments, and transactions

### 9. Real Stripe API Integration

**Issue**: Testing with fake data doesn't work for real payment flows
**Solution**: Create real Stripe Payment Intents using Stripe API:

```python
import stripe
stripe.api_key = "sk_test_..."

# Create real payment intent
payment_intent = stripe.PaymentIntent.create(
    amount=100,  # $1.00
    currency='usd',
    automatic_payment_methods={'enabled': True}
)
```

## Final Working Dockerfile

```dockerfile
# Multi-stage build for a monorepo pnpm workspace
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Install dependencies
FROM base AS deps
# Copy root workspace files including .npmrc
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
# Copy ALL the packages with their full content
COPY packages/ ./packages/
# Copy ALL apps to ensure proper workspace resolution
COPY apps/ ./apps/
# Install all dependencies for the entire workspace
RUN pnpm install --no-frozen-lockfile
# Verify installation
RUN pnpm list --depth=0 --filter saleor-app-payment-stripe

# Build stage
FROM base AS builder
WORKDIR /app
# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
# Copy root configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
# Copy the entire stripe app directory
COPY apps/stripe ./apps/stripe
# Build just the stripe app
RUN pnpm --filter saleor-app-payment-stripe build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the build stage
COPY --from=builder /app/apps/stripe/.next/standalone ./
COPY --from=builder /app/apps/stripe/.next/static ./.next/static
COPY --from=builder /app/apps/stripe/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/stripe/server.js"]
```

## Docker Compose Configuration

### docker-compose.override.yml

```yaml
services:
  stripe-app:
    build:
      context: /Users/itsmrapon/Dev/docker/apps
      dockerfile: apps/stripe/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - SECRET_KEY=8a9b5c2e3f4d6e8a1b3c5d7e9f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a
      - ALLOWED_DOMAIN_PATTERN=/.*/
      - APP_IFRAME_BASE_URL=http://192.168.86.41:3000
      - APP_API_BASE_URL=http://192.168.86.41:3000
      - STRIPE_SECRET_KEY find it on note 
      - STRIPE_PUBLISHABLE_KEY find it on note
      - AWS_REGION=localhost
      - AWS_ACCESS_KEY_ID=test
      - AWS_SECRET_ACCESS_KEY=test
      - AWS_ENDPOINT_URL=http://localhost:8000
      - DYNAMODB_MAIN_TABLE_NAME=stripe-main-table
      - APL=file
      - APP_LOG_LEVEL=info
    networks:
      - saleor-backend-tier
    depends_on:
      - api
```

### backend.env (Saleor Configuration)

```bash
# Add your host IP to allow manifest fetching
ALLOWED_HOSTS=localhost,127.0.0.1,192.168.86.41,stripe-app
```

**Important Notes**:

- Replace `192.168.86.41` with your actual host IP address
- Use `/.*/` for `ALLOWED_DOMAIN_PATTERN` during development
- Remove any `volumes` section that mounts local development code

## Key Learnings

### 1. Pnpm Workspace Complexity

- Pnpm workspaces create complex dependency structures with `.pnpm` directories
- Standard `node_modules/.bin/` symlinks may not exist for workspace dependencies
- Always copy the entire workspace structure, not just individual apps

### 2. Next.js Standalone Output

- Use `output: 'standalone'` in `next.config.ts` for Docker deployments
- Standalone output bundles all dependencies into a single `server.js` file
- Much more reliable than trying to resolve complex dependency paths

### 3. Multi-stage Docker Builds

- Separate dependency installation, building, and runtime stages
- Install all workspace dependencies in deps stage
- Build only the target app in builder stage
- Use minimal runtime image with standalone output

### 4. Environment Variables

- Ensure all required environment variables are set in docker-compose
- Use Docker service names for internal communication (`http://stripe-app:3000`)
- Keep localhost URLs for external access

## Testing Checklist

- [ ] Container builds successfully
- [ ] Container starts without errors
- [ ] Next.js server starts and shows "Ready" message
- [ ] Manifest endpoint accessible: `http://localhost:3000/api/manifest`
- [ ] Returns valid JSON with app configuration
- [ ] Docker networking works (can access from other containers)

## Complete Setup Instructions

### 1. Initial Setup

```bash
# Clone the Stripe app repository
cd /Users/itsmrapon/Dev/docker/apps
git clone <stripe-app-repo>

# Navigate to saleor-platform directory
cd /Users/itsmrapon/Dev/docker/saleor-platform
```

### 2. Configure Environment Variables

**Update docker-compose.override.yml**:

- Replace `192.168.86.41` with your host IP
- Add your Stripe API keys
- Set proper `ALLOWED_DOMAIN_PATTERN`

**Update backend.env**:

```bash
ALLOWED_HOSTS=localhost,127.0.0.1,YOUR_HOST_IP,stripe-app
```

### 3. Build and Start Services

```bash
# Build the Stripe app container
docker-compose build stripe-app

# Start all services
docker-compose up -d

# Check if Stripe app is running
curl -s http://localhost:3000/api/manifest | jq '.name, .id, .version'
```

### 4. Install in Saleor Dashboard

**Option A: Direct Installation**

1. Navigate to Extensions → Install app
2. Use manifest URL: `http://YOUR_HOST_IP:3000/api/manifest`

**Option B: Manual Installation (if direct fails)**

```bash
# Create app via manage.py
docker-compose exec api python manage.py create_app

# Update app URLs in database
docker-compose exec api python manage.py shell
```

### 5. Configure Stripe Plugin

1. Go to Configuration → Plugins
2. Find "Stripe" plugin and click Configure
3. Add your Stripe API keys
4. **Important**: Set `automatic_payment_capture` to `False`
5. Save configuration

### 6. Test Payment Flow

1. Create a test product in Saleor
2. Create an order with the product
3. Verify capture button appears
4. Test capture functionality

## Next Steps for Production

1. **Environment Variables**:

   - Replace test keys with production Stripe keys
   - Configure proper AWS/DynamoDB settings
   - Set up proper domain patterns

2. **Security Considerations**:

   - Use proper secret management
   - Configure HTTPS in production
   - Set up proper network isolation
   - Replace `/.*/` with specific domain patterns

3. **Monitoring & Logging**:
   - Set up proper logging levels
   - Configure monitoring for payment failures
   - Set up webhook endpoint monitoring

## Troubleshooting

### Container Won't Start

- Check logs: `docker-compose logs stripe-app`
- Verify Next.js config has `output: 'standalone'`
- Ensure all workspace dependencies are copied

### Manifest Not Accessible

- Verify container is running: `docker-compose ps`
- Test from host: `curl http://localhost:3000/api/manifest`
- Check Docker networking configuration
- Verify `ALLOWED_HOSTS` includes your host IP

### Build Failures

- Ensure Node.js 22+ is used
- Verify all workspace files are copied
- Check pnpm lockfile is up to date

### Payment Issues

- **Capture button not showing**: Check `automatic_payment_capture` is `False`
- **"Cannot find successful auth transaction"**: Create auth transaction first
- **"Unrecognized request URL"**: Ensure valid Stripe Payment Intent ID in gateway_response
- **Blank page**: Remove volumes section from docker-compose.override.yml

### App Installation Issues

- **"Can't fetch manifest data"**: Add host IP to `ALLOWED_HOSTS` in backend.env
- **Installation failed**: Try manual installation via `manage.py create_app`
- **App shows blank**: Check static file paths in Dockerfile

## Quick Reference Commands

```bash
# Check if Stripe app is running
curl -s http://localhost:3000/api/manifest

# View container logs
docker-compose logs stripe-app

# Rebuild Stripe app
docker-compose build stripe-app

# Restart all services
docker-compose restart

# Access Saleor shell for manual app creation
docker-compose exec api python manage.py shell
```

## Current Working Status ✅

- ✅ Docker container builds successfully
- ✅ Stripe app runs and serves manifest
- ✅ App installs in Saleor Dashboard
- ✅ Payment capture button appears
- ✅ Real Stripe API integration works
- ✅ Documentation complete

This setup provides a robust, containerized solution for running Saleor Stripe payment apps in Docker environments.
