# Vercel Deployment Guide

## 🚀 Deploying Frontend to Vercel

### **Prerequisites:**

1. Vercel account (free at [vercel.com](https://vercel.com))
2. GitHub repository with your code
3. Backend APIs deployed (optional for testing)

### **Step 1: Prepare Repository**

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

### **Step 2: Deploy to Vercel**

#### **Option A: Deploy via Vercel Dashboard (Recommended)**

1. **Go to [vercel.com](https://vercel.com) and sign in**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**

   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root of your project)
   - **Build Command**: `npm run build:client`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

5. **Add Environment Variables:**

   ```
   VITE_API_BASE_URL_SUPERUSER=https://your-superuser-backend.com
   VITE_API_BASE_URL_SWITCHTOSWAG=https://your-switchtoswag-backend.com
   VITE_API_BASE_URL_SUDOTECHSERVE=https://your-sudotechserve-backend.com
   VITE_API_BASE_URL_STRONGTERMSTRATEGY=https://your-strongtermstrategy-backend.com
   ```

6. **Click "Deploy"**

#### **Option B: Deploy via Vercel CLI**

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy:**

   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project or create new one
   - Set build command: `npm run build:client`
   - Set output directory: `dist/public`

### **Step 3: Configure Environment Variables**

In your Vercel dashboard:

1. **Go to Project Settings → Environment Variables**
2. **For now, you can skip these variables (they'll fallback to localhost):**

   ```
   VITE_API_BASE_URL_SUPERUSER=http://localhost:4000
   VITE_API_BASE_URL_SWITCHTOSWAG=http://localhost:4001
   VITE_API_BASE_URL_SUDOTECHSERVE=http://localhost:4002
   VITE_API_BASE_URL_STRONGTERMSTRATEGY=http://localhost:4003
   ```

   **Note:** Since you don't have backend domains yet, the frontend will work but API calls will fail. This is normal for now.

3. **Optional Discord Variables:**
   ```
   VITE_DISCORD_WEBHOOK_SWITCHTOSWAG=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
   VITE_DISCORD_WEBHOOK_SUDOTECHSERVE=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
   VITE_DISCORD_WEBHOOK_STRONGTERMSTRATEGY=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
   ```

### **Step 4: Backend APIs (Optional for Now)**

**You can deploy the frontend now without backends!** The frontend will work, but API calls will show errors (which is expected).

When you're ready to deploy backends, you have these options:

#### **Option A: Deploy Backends to Vercel (Serverless Functions)**

- Convert your Express backends to Vercel serverless functions
- Each API becomes a separate Vercel project

#### **Option B: Deploy Backends to Docker Hosting**

- Use services like Railway, Render, or DigitalOcean
- Deploy each API as a Docker container

#### **Option C: Deploy Backends to VPS**

- Use your own server or cloud VPS
- Deploy using Docker Compose

### **Step 5: Test Frontend Deployment (Without Backends)**

Your frontend should work immediately! You'll get a Vercel URL like:

- `https://your-project-name.vercel.app`

**What will work:**

- ✅ All tenant dashboards
- ✅ Navigation between tenants
- ✅ Discord links (if configured)
- ✅ UI components and styling

**What won't work yet:**

- ❌ API calls (will show errors)
- ❌ Data fetching
- ❌ Real-time updates

This is completely normal and expected!

### **Step 6: Update API URLs (Later)**

When you deploy your backends, update the environment variables in Vercel:

1. **Visit your Vercel URL**
2. **Test all tenant dashboards**
3. **Test Discord links**
4. **Test API connections**

### **Step 7: Custom Domain (Optional)**

1. **Go to Project Settings → Domains**
2. **Add your custom domain**
3. **Update DNS records as instructed**

## 🔧 Troubleshooting

### **Common Issues:**

1. **Build Fails:**

   - Check `package.json` scripts
   - Ensure all dependencies are in `dependencies`, not `devDependencies`

2. **API Calls Fail:**

   - Check environment variables are set correctly
   - Verify backend URLs are accessible
   - Check CORS settings on backends

3. **Routing Issues:**
   - Vercel should handle SPA routing automatically with `vercel.json`
   - Check `rewrites` configuration

### **Build Commands:**

```bash
# Test build locally
npm run build:client

# Check build output
ls -la dist/public
```

### **Environment Variables Check:**

```bash
# In Vercel dashboard, verify these are set:
- VITE_API_BASE_URL_SUPERUSER
- VITE_API_BASE_URL_SWITCHTOSWAG
- VITE_API_BASE_URL_SUDOTECHSERVE
- VITE_API_BASE_URL_STRONGTERMSTRATEGY
```

## 📊 Deployment Checklist

- [ ] Code committed to GitHub
- [ ] Vercel project created
- [ ] Build command set to `npm run build:client`
- [ ] Output directory set to `dist/public`
- [ ] Environment variables configured
- [ ] Backend APIs deployed
- [ ] API URLs updated in environment variables
- [ ] Frontend deployed successfully
- [ ] All tenant dashboards working
- [ ] Discord links working
- [ ] API connections working

## 🎉 Success!

Once deployed, your frontend will be available at:

- **Vercel URL**: `https://your-project.vercel.app`
- **Custom Domain**: `https://yourdomain.com` (if configured)

Your multi-tenant business platform frontend is now live on Vercel! 🚀
