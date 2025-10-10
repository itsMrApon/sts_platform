import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Superuser API',
    timestamp: new Date().toISOString()
  });
});

// Superuser API routes
app.get('/api/superuser/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Superuser dashboard data',
      tenants: ['switchtoswag', 'sudotechserve', 'strongtermstrategy'],
      systemStatus: 'healthy'
    }
  });
});

// n8n integration routes
app.get('/api/n8n/status/:tenant', (req, res) => {
  const { tenant } = req.params;
  res.json({
    success: true,
    data: {
      tenant,
      status: 'active',
      workflows: 3,
      lastRun: new Date().toISOString()
    }
  });
});

app.post('/api/n8n/automation/:tenant', (req, res) => {
  const { tenant } = req.params;
  const { action, data } = req.body;
  
  res.json({
    success: true,
    data: {
      tenant,
      action,
      triggered: true,
      timestamp: new Date().toISOString()
    }
  });
});

// Webhook handling
app.post('/api/webhooks/saleor/:tenant', (req, res) => {
  const { tenant } = req.params;
  const webhookData = req.body;
  
  // Log webhook for debugging
  console.log(`Webhook received for ${tenant}:`, webhookData);
  
  res.json({
    success: true,
    message: 'Webhook received',
    tenant,
    timestamp: new Date().toISOString()
  });
});

// System status
app.get('/api/system/status', (req, res) => {
  res.json({
    success: true,
    data: {
      apis: {
        'api-1-switchtoswag': 'http://localhost:4001',
        'api-2-sudotechserve': 'http://localhost:4002',
        'api-3-strongtermstrategy': 'http://localhost:4003'
      },
      services: {
        saleor: 'running',
        erpnext: 'running',
        n8n: 'running'
      },
      timestamp: new Date().toISOString()
    }
  });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Setup Vite for development
(async () => {
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app);
  } else {
    serveStatic(app);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Superuser API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 System status: http://localhost:${PORT}/api/system/status`);
  });
})();
