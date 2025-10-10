import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ecommerceRoutes } from './routes/ecommerce';
import { orderRoutes } from './routes/orders';
import { productRoutes } from './routes/products';
import { customerRoutes } from './routes/customers';
import { webhookRoutes } from './routes/webhooks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'SwitchToSwag E-commerce API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/ecommerce', ecommerceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

app.listen(PORT, () => {
  console.log(`🚀 SwitchToSwag E-commerce API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
