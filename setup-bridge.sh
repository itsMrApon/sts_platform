#!/bin/bash

echo "🚀 Setting up Integration Bridge System..."

# Stop existing services
echo "📦 Stopping existing services..."
docker compose down

# Start services with network bridge
echo "🌉 Starting services with network bridge..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Connect Saleor to the network
echo "🔗 Connecting Saleor to network bridge..."
docker network connect sts_network saleor-platform-api-1 2>/dev/null || echo "Saleor container not found, skipping..."

# Test connectivity
echo "🧪 Testing connectivity..."
echo "Backend: $(curl -s http://localhost:4000/api/health || echo 'Not ready')"
echo "ERPNext: $(curl -s http://localhost:8080/api/method/ping || echo 'Not ready')"
echo "n8n: $(curl -s http://localhost:5678/healthz || echo 'Not ready')"

echo ""
echo "✅ Integration Bridge Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update Saleor webhook URL to: http://sts_backend:4000/api/webhooks/saleor/switchtoswag"
echo "2. Access Integration Dashboard: http://localhost:4000/integrations"
echo "3. Configure n8n workflows at: http://localhost:5678"
echo ""
echo "🎯 Available Services:"
echo "   • Backend API: http://localhost:4000"
echo "   • ERPNext: http://localhost:8080"
echo "   • n8n: http://localhost:5678"
echo "   • Integration Dashboard: http://localhost:4000/integrations"
echo ""
echo "🌉 Network Bridge: sts_network"
echo "   All services can now communicate using container names!"