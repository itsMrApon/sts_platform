import { Router } from 'express';
import { SaleorClient } from '../clients/saleor-client';
import { ERPNextClient } from '../clients/erpnext-client';

const router = Router();

// Initialize clients
const saleorClient = new SaleorClient({
  url: process.env.SALEOR_URL || 'http://localhost:8000',
  token: process.env.SALEOR_TOKEN || '4xtNglUY26s6lDOptk0oUeT66bqxbt'
});

const erpnextClient = new ERPNextClient({
  url: process.env.ERPNEXT_URL || 'http://localhost:8080',
  apiKey: process.env.ERPNEXT_API_KEY || '175aafefd8c448f',
  apiSecret: process.env.ERPNEXT_API_SECRET || '1b2b919c1580ade'
});

// Get e-commerce dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const [orders, products, customers] = await Promise.all([
      saleorClient.getOrders({ limit: 10 }),
      saleorClient.getProducts({ limit: 10 }),
      saleorClient.getCustomers({ limit: 10 })
    ]);

    res.json({
      success: true,
      data: {
        orders: orders.orders?.edges?.map((edge: any) => edge.node) || [],
        products: products.products?.edges?.map((edge: any) => edge.node) || [],
        customers: customers.users?.edges?.map((edge: any) => edge.node) || []
      }
    });
  } catch (error) {
    console.error('E-commerce dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    });
  }
});

// Get order status for on-demand production
router.get('/production-status', async (req, res) => {
  try {
    const orders = await saleorClient.getOrders({ 
      filter: { status: ['UNFULFILLED', 'PARTIALLY_FULFILLED'] },
      limit: 20
    });

    const productionOrders = orders.orders?.edges?.map((edge: any) => {
      const order = edge.node;
      return {
        id: order.id,
        number: order.number,
        status: order.status,
        customer: order.user?.email,
        createdAt: order.createdAt,
        total: order.total?.gross?.amount,
        lines: order.lines?.map((line: any) => ({
          id: line.id,
          productName: line.productName,
          quantity: line.quantity,
          variant: line.variantName
        }))
      };
    }) || [];

    res.json({
      success: true,
      data: productionOrders
    });
  } catch (error) {
    console.error('Production status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch production status' 
    });
  }
});

// Update order status
router.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Update order status in Saleor
    const updatedOrder = await saleorClient.updateOrderStatus(orderId, status);

    // Sync to ERPNext if needed
    if (status === 'FULFILLED') {
      await erpnextClient.createSalesOrder({
        customer: updatedOrder.user?.email,
        items: updatedOrder.lines?.map((line: any) => ({
          item_code: line.productName,
          qty: line.quantity,
          rate: line.unitPrice?.gross?.amount
        }))
      });
    }

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update order status' 
    });
  }
});

// Get inventory levels
router.get('/inventory', async (req, res) => {
  try {
    const products = await saleorClient.getProducts({ limit: 100 });
    
    const inventory = products.products?.edges?.map((edge: any) => {
      const product = edge.node;
      return {
        id: product.id,
        name: product.name,
        variants: product.variants?.map((variant: any) => ({
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          stock: variant.stocks?.reduce((total: number, stock: any) => total + stock.quantity, 0) || 0
        }))
      };
    }) || [];

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Inventory error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch inventory' 
    });
  }
});

export { router as ecommerceRoutes };
