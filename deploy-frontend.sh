#!/bin/bash

echo "🚀 Deploying Frontend to Vercel..."
echo ""

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  You have uncommitted changes. Please commit them first:"
  echo "   git add ."
  echo "   git commit -m 'Ready for deployment'"
  echo "   git push origin main"
  echo ""
  read -p "Press Enter after committing and pushing your changes..."
fi

echo "✅ Building frontend locally to test..."
npm run build:client

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  echo ""
  echo "📋 Next steps:"
  echo "1. Go to https://vercel.com"
  echo "2. Sign in with GitHub"
  echo "3. Click 'New Project'"
  echo "4. Import your repository"
  echo "5. Configure:"
  echo "   - Framework: Vite"
  echo "   - Build Command: npm run build:client"
  echo "   - Output Directory: dist/public"
  echo "6. Deploy!"
  echo ""
  echo "🎉 Your frontend will be available at: https://your-project-name.vercel.app"
  echo ""
  echo "📝 Note: API calls will fail until you deploy your backends, but the UI will work perfectly!"
else
  echo "❌ Build failed. Please fix the errors above before deploying."
  exit 1
fi
