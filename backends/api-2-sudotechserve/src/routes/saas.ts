import { Router } from 'express';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Get SaaS dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    // Get Stripe data for SaaS metrics
    const [customers, subscriptions, revenue] = await Promise.all([
      stripe.customers.list({ limit: 10 }),
      stripe.subscriptions.list({ limit: 10 }),
      stripe.balanceTransactions.list({ limit: 10 })
    ]);

    // Calculate metrics
    const activeSubscriptions = subscriptions.data.filter(sub => sub.status === 'active').length;
    const totalRevenue = revenue.data.reduce((sum, tx) => sum + tx.amount, 0);

    res.json({
      success: true,
      data: {
        totalCustomers: customers.data.length,
        activeSubscriptions,
        totalRevenue: totalRevenue / 100, // Convert from cents
        recentCustomers: customers.data.slice(0, 5),
        recentSubscriptions: subscriptions.data.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('SaaS dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch SaaS dashboard data' 
    });
  }
});

// Get agency conversions and customers
router.get('/conversions', async (req, res) => {
  try {
    const customers = await stripe.customers.list({ limit: 20 });
    
    const conversions = customers.data.map(customer => ({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      created: new Date(customer.created * 1000),
      totalSpent: customer.total_spent || 0,
      subscriptions: customer.subscriptions?.data?.length || 0,
      status: customer.deleted ? 'inactive' : 'active'
    }));

    res.json({
      success: true,
      data: conversions
    });
  } catch (error) {
    console.error('Conversions error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch conversions data' 
    });
  }
});

// Get client projects
router.get('/projects', async (req, res) => {
  try {
    // Mock project data - in real implementation, this would come from a database
    const projects = [
      {
        id: 'proj_1',
        name: 'E-commerce Platform',
        client: 'TechCorp Inc.',
        status: 'in_progress',
        progress: 75,
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        budget: 25000,
        team: ['John Doe', 'Jane Smith']
      },
      {
        id: 'proj_2',
        name: 'Mobile Banking App',
        client: 'FinancePro Ltd.',
        status: 'completed',
        progress: 100,
        startDate: '2023-11-01',
        endDate: '2024-01-10',
        budget: 45000,
        team: ['Mike Johnson', 'Sarah Wilson']
      },
      {
        id: 'proj_3',
        name: 'Healthcare Dashboard',
        client: 'MedTech Solutions',
        status: 'planning',
        progress: 25,
        startDate: '2024-02-01',
        endDate: '2024-05-01',
        budget: 35000,
        team: ['Alex Brown', 'Emma Davis']
      }
    ];

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch projects data' 
    });
  }
});

// Create new client
router.post('/clients', async (req, res) => {
  try {
    const { name, email, company, phone } = req.body;

    // Create customer in Stripe
    const customer = await stripe.customers.create({
      name,
      email,
      phone,
      metadata: {
        company,
        source: 'agency_dashboard'
      }
    });

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create client' 
    });
  }
});

// Get subscription analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Get subscription data based on period
    const subscriptions = await stripe.subscriptions.list({
      created: {
        gte: Math.floor((Date.now() - (30 * 24 * 60 * 60 * 1000)) / 1000) // Last 30 days
      }
    });

    const analytics = {
      totalSubscriptions: subscriptions.data.length,
      activeSubscriptions: subscriptions.data.filter(sub => sub.status === 'active').length,
      canceledSubscriptions: subscriptions.data.filter(sub => sub.status === 'canceled').length,
      mrr: subscriptions.data
        .filter(sub => sub.status === 'active')
        .reduce((sum, sub) => sum + (sub.items.data[0]?.price?.unit_amount || 0), 0) / 100,
      churnRate: 0.05 // Calculate actual churn rate
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics data' 
    });
  }
});

export { router as saasRoutes };
