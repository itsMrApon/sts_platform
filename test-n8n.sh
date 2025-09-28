#!/bin/bash

# Test script for n8n Central Automation Hub
# This script tests all automation actions

echo "🚀 Testing n8n Central Automation Hub"
echo "======================================"

# Configuration
N8N_WEBHOOK_URL="http://localhost:5678/webhook/automation"
TENANT_SLUG="test-tenant"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test an action
test_action() {
    local action=$1
    local description=$2
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Action: $action"
    echo "URL: $N8N_WEBHOOK_URL"
    
    response=$(curl -s -X POST "$N8N_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"tenant_slug\": \"$TENANT_SLUG\", \"action\": \"$action\"}")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Success${NC}"
        echo "Response: $response" | jq '.' 2>/dev/null || echo "Response: $response"
    else
        echo -e "${RED}❌ Failed${NC}"
        echo "Error: Failed to connect to n8n"
    fi
}

# Check if n8n is running
echo "🔍 Checking if n8n is running..."
if curl -s http://localhost:5678/healthz > /dev/null 2>&1; then
    echo -e "${GREEN}✅ n8n is running${NC}"
else
    echo -e "${RED}❌ n8n is not running${NC}"
    echo "Please start n8n with: docker-compose up -d"
    exit 1
fi

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:3000/api/tenants > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Backend might not be running${NC}"
    echo "Please start your backend with: npm run dev"
fi

echo -e "\n🧪 Running automation tests..."
echo "================================"

# Test all actions
test_action "get-status" "Get System Status"
test_action "sync-customers" "Sync Customers"
test_action "sync-products" "Sync Products"
test_action "sync-orders" "Sync Orders"

echo -e "\n🎉 Testing completed!"
echo "===================="
echo "Check n8n executions at: http://localhost:5678/executions"
echo "Check backend logs with: docker-compose logs -f"
