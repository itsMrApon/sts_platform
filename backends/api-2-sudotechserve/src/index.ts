import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { saasRoutes } from './routes/saas';
import { projectRoutes } from './routes/projects';
import { clientRoutes } from './routes/clients';
import { subscriptionRoutes } from './routes/subscriptions';
import { developerRoutes } from './routes/developer-services';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

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
    service: 'SudoTechServe SaaS API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/saas', saasRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/developer-services', developerRoutes);

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
  console.log(`🚀 SudoTechServe SaaS API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
