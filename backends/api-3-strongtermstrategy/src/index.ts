import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { manufacturingRoutes } from './routes/manufacturing';
import { supplyRoutes } from './routes/supply';
import { productionRoutes } from './routes/production';
import { sourcingRoutes } from './routes/sourcing';
import { qualityRoutes } from './routes/quality';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

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
    service: 'StrongTermStrategy Supply Chain API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/manufacturing', manufacturingRoutes);
app.use('/api/supply', supplyRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/sourcing', sourcingRoutes);
app.use('/api/quality', qualityRoutes);

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
  console.log(`🚀 StrongTermStrategy Supply Chain API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
