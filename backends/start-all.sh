#!/bin/bash

echo "🚀 Starting all backend APIs..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if the network exists
if ! docker network ls | grep -q "sts-network"; then
    echo "📡 Creating sts-network..."
    docker network create sts-network
fi

# Start all backend services
echo "🔧 Starting backend services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check health of all services
echo "🏥 Checking service health..."

# API-1: SwitchToSwag
if curl -f http://localhost:4001/health > /dev/null 2>&1; then
    echo "✅ API-1 (SwitchToSwag) is healthy"
else
    echo "❌ API-1 (SwitchToSwag) is not responding"
fi

# API-2: SudoTechServe
if curl -f http://localhost:4002/health > /dev/null 2>&1; then
    echo "✅ API-2 (SudoTechServe) is healthy"
else
    echo "❌ API-2 (SudoTechServe) is not responding"
fi

# API-3: StrongTermStrategy
if curl -f http://localhost:4003/health > /dev/null 2>&1; then
    echo "✅ API-3 (StrongTermStrategy) is healthy"
else
    echo "❌ API-3 (StrongTermStrategy) is not responding"
fi

echo ""
echo "🎉 All backend APIs are running!"
echo ""
echo "📊 API Endpoints:"
echo "   • SwitchToSwag (E-commerce): http://localhost:4001"
echo "   • SudoTechServe (SaaS):      http://localhost:4002"
echo "   • StrongTermStrategy (Supply): http://localhost:4003"
echo ""
echo "🔍 Health Checks:"
echo "   • http://localhost:4001/health"
echo "   • http://localhost:4002/health"
echo "   • http://localhost:4003/health"
echo ""
echo "📱 Frontend should connect to these APIs automatically."
echo "   Make sure your frontend is running on http://localhost:5173"
