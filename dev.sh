#!/bin/bash

# Development server startup script
export DATABASE_URL="postgres://sts:sTs@1535@localhost:5432/sts_db"
export SESSION_SECRET="supersecretkey"
export PORT=5001
export NODE_ENV=development

echo "🚀 Starting STS Platform Development Server..."
echo "📊 Database: $DATABASE_URL"
echo "🔑 Session Secret: $SESSION_SECRET"
echo "🌐 Port: $PORT"
echo ""

npm run dev
