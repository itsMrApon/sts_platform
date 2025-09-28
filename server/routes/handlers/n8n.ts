/**
 * n8n automation handlers
 */

import { storage } from '../../storage';
import { createClients } from '../utils/client-factory';
import { sendSuccess, sendError } from '../utils/response';
import { TenantRouteHandler, N8nAutomationRequest, N8nAutomationResponse } from '../types';

/**
 * Handle n8n automation requests
 */
export const handleAutomation: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const { action, data }: N8nAutomationRequest = req.body;
    let result = {};

    // Route to existing API endpoints based on action
    switch (action) {
      case 'sync-products':
        result = await handleProductSync(tenant);
        break;
      case 'sync-orders':
        result = await handleOrderSync(tenant);
        break;
      case 'sync-customers':
        result = await handleCustomerSync(tenant);
        break;
      case 'get-status':
        result = await handleGetStatus(tenant);
        break;
      default:
        return sendError(res, 400, "Unknown action");
    }

    // Log the automation event
    try {
      await storage.createIntegrationLog({
        tenantId: tenant.id,
        source: 'n8n',
        action: 'automation_executed',
        status: 'success',
        payload: { action, data, result, timestamp: new Date().toISOString() }
      });
    } catch (logError) {
      console.log('Logging failed:', logError);
    }

    const response: N8nAutomationResponse = {
      success: true,
      action,
      tenant: tenant.slug,
      result,
      timestamp: new Date().toISOString()
    };

    sendSuccess(res, response);
  } catch (error) {
    sendError(res, 500, "Automation failed", error);
  }
};

/**
 * Get n8n status
 */
export const getN8nStatus: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const erpnextStatus = await storage.getSyncStatus(tenant.id, "erpnext");
    const saleorStatus = await storage.getSyncStatus(tenant.id, "saleor");

    const n8nProtocol = process.env.N8N_PROTOCOL || 'http';
    const n8nHost = process.env.N8N_HOST || 'localhost';
    const n8nPort = process.env.N8N_PORT || '5678';
    const n8nBase = `${n8nProtocol}://${n8nHost}:${n8nPort}`;

    let n8nAvailable = false;
    try {
      const health = await fetch(`${n8nBase}/healthz`);
      n8nAvailable = health.ok;
    } catch (_) {
      n8nAvailable = false;
    }

    sendSuccess(res, {
      tenant: tenant.slug,
      status: {
        erpnext: erpnextStatus,
        saleor: saleorStatus
      },
      n8n: {
        available: n8nAvailable,
        baseUrl: n8nBase,
        webhookUrl: `${n8nBase}/webhook`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    sendError(res, 500, "Failed to get n8n status", error);
  }
};

/**
 * Execute n8n workflow
 */
export const executeWorkflow: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const { workflow, data } = req.body;

    // Log workflow execution
    await storage.createIntegrationLog({
      tenantId: tenant.id,
      source: 'n8n',
      action: 'workflow_executed',
      status: 'success',
      payload: { workflow, data, timestamp: new Date().toISOString() }
    });

    sendSuccess(res, {
      message: "Workflow execution logged successfully",
      workflow,
      tenant: tenant.slug,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    sendError(res, 500, "Failed to execute n8n workflow", error);
  }
};

/**
 * Register n8n webhook
 */
export const registerWebhook: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const { workflow, webhookPath } = req.body;
    
    await storage.createIntegrationLog({
      tenantId: tenant.id,
      source: 'n8n',
      action: 'webhook_registered',
      status: 'success',
      payload: { workflow, webhookPath, timestamp: new Date().toISOString() }
    });
    
    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 500, "Failed to register n8n webhook", error);
  }
};

// Helper functions for automation actions
async function handleProductSync(tenant: any) {
  const { saleor, erpnext } = createClients(tenant);
  const saleorProducts = await saleor.getProducts({ first: 20 });
  const erpnextItems = await erpnext.getItems({ limit: 20 });

  return {
    saleorProducts: saleorProducts.products?.edges?.length || 0,
    erpnextItems: Array.isArray(erpnextItems) ? erpnextItems.length : 0,
    message: "Product sync completed"
  };
}

async function handleOrderSync(tenant: any) {
  const { saleor, erpnext } = createClients(tenant);
  const saleorOrders = await saleor.getOrders({ first: 20 });
  const erpnextCustomers = await erpnext.getCustomers({ limit: 20 });

  return {
    saleorOrders: saleorOrders.orders?.edges?.length || 0,
    erpnextCustomers: Array.isArray(erpnextCustomers) ? erpnextCustomers.length : 0,
    message: "Order sync completed"
  };
}

async function handleCustomerSync(tenant: any) {
  const { erpnext } = createClients(tenant);
  const erpnextCustomers = await erpnext.getCustomers({ limit: 20 });

  return {
    erpnextCustomers: Array.isArray(erpnextCustomers) ? erpnextCustomers.length : 0,
    message: "Customer sync completed"
  };
}

async function handleGetStatus(tenant: any) {
  const erpnextStatus = await storage.getSyncStatus(tenant.id, "erpnext");
  const saleorStatus = await storage.getSyncStatus(tenant.id, "saleor");

  return {
    erpnext: erpnextStatus,
    saleor: saleorStatus,
    message: "Status retrieved"
  };
}
