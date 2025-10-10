import { Router } from 'express';
import { ERPNextClient } from '../clients/erpnext-client';

const router = Router();

// Initialize ERPNext client for manufacturing
const erpnextClient = new ERPNextClient({
  url: process.env.ERPNEXT_URL || 'http://localhost:8080',
  apiKey: process.env.ERPNEXT_API_KEY || '175aafefd8c448f',
  apiSecret: process.env.ERPNEXT_API_SECRET || '1b2b919c1580ade'
});

// Get manufacturing dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const [workOrders, items, warehouses] = await Promise.all([
      erpnextClient.getWorkOrders(),
      erpnextClient.getItems({ limit: 50 }),
      erpnextClient.getWarehouses()
    ]);

    // Calculate manufacturing metrics
    const activeOrders = workOrders.filter((order: any) => order.status === 'In Process').length;
    const completedOrders = workOrders.filter((order: any) => order.status === 'Completed').length;
    const totalInventory = items.reduce((sum: number, item: any) => sum + (item.actual_qty || 0), 0);

    res.json({
      success: true,
      data: {
        activeProduction: activeOrders,
        completedOrders,
        totalInventory,
        efficiency: Math.round((completedOrders / (activeOrders + completedOrders)) * 100) || 0,
        workOrders: workOrders.slice(0, 10),
        recentItems: items.slice(0, 10),
        warehouses: warehouses.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Manufacturing dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch manufacturing dashboard data' 
    });
  }
});

// Get production overview
router.get('/production-overview', async (req, res) => {
  try {
    const workOrders = await erpnextClient.getWorkOrders();
    
    const productionStats = {
      activeLines: workOrders.filter((order: any) => order.status === 'In Process').length,
      inventoryLevel: 85, // Calculate from actual inventory data
      shipments: workOrders.filter((order: any) => order.status === 'Completed').length,
      efficiency: 92 // Calculate from production data
    };

    res.json({
      success: true,
      data: productionStats
    });
  } catch (error) {
    console.error('Production overview error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch production overview' 
    });
  }
});

// Create manufacturing order
router.post('/orders', async (req, res) => {
  try {
    const { 
      itemCode, 
      quantity, 
      bomNo, 
      plannedStartDate, 
      plannedEndDate, 
      location 
    } = req.body;

    const workOrder = await erpnextClient.createWorkOrder({
      item_code: itemCode,
      qty: quantity,
      bom_no: bomNo,
      planned_start_date: plannedStartDate,
      planned_end_date: plannedEndDate,
      source_warehouse: location,
      status: 'Draft'
    });

    res.json({
      success: true,
      data: workOrder
    });
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create work order' 
    });
  }
});

// Get 10-step manufacturing workflow data
router.get('/workflow/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Mock workflow data - in real implementation, this would come from database
    const workflowSteps = [
      { id: 1, name: 'Fabric Selection', status: 'completed', progress: 100 },
      { id: 2, name: 'Pattern Selection', status: 'completed', progress: 100 },
      { id: 3, name: 'Pattern Editing', status: 'completed', progress: 100 },
      { id: 4, name: 'Layout/Marker', status: 'completed', progress: 100 },
      { id: 5, name: 'Layout Editing', status: 'in_progress', progress: 75 },
      { id: 6, name: 'Print/AMBO', status: 'pending', progress: 0 },
      { id: 7, name: 'Accessories', status: 'pending', progress: 0 },
      { id: 8, name: 'Finishing', status: 'pending', progress: 0 },
      { id: 9, name: 'FOB', status: 'pending', progress: 0 },
      { id: 10, name: 'Final Rate', status: 'pending', progress: 0 }
    ];

    res.json({
      success: true,
      data: {
        orderId,
        workflowSteps,
        currentStep: 5,
        estimatedCompletion: '2024-03-15',
        totalProgress: 47.5
      }
    });
  } catch (error) {
    console.error('Workflow error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch workflow data' 
    });
  }
});

// Update workflow step
router.patch('/workflow/:orderId/step/:stepId', async (req, res) => {
  try {
    const { orderId, stepId } = req.params;
    const { status, progress, notes } = req.body;

    // Update workflow step in database
    // This would typically update a database record
    
    res.json({
      success: true,
      data: {
        orderId,
        stepId,
        status,
        progress,
        notes,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Update workflow step error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update workflow step' 
    });
  }
});

// Get production locations
router.get('/locations', async (req, res) => {
  try {
    const locations = [
      {
        id: 'nyc',
        name: 'New York City',
        description: 'Premium manufacturing',
        status: 'active',
        capacity: 85,
        specialties: ['High-end garments', 'Custom designs']
      },
      {
        id: 'sweden',
        name: 'Sweden',
        description: 'Sustainable production',
        status: 'active',
        capacity: 70,
        specialties: ['Eco-friendly materials', 'Green manufacturing']
      },
      {
        id: 'bangladesh',
        name: 'Bangladesh',
        description: 'Cost-effective bulk',
        status: 'active',
        capacity: 95,
        specialties: ['Bulk production', 'Cost optimization']
      }
    ];

    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Locations error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch locations' 
    });
  }
});

export { router as manufacturingRoutes };
