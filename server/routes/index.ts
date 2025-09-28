/**
 * Main routes configuration
 * 
 * This file organizes all routes in a clean, maintainable structure
 */

import type { Express } from "express";
import { createServer, type Server } from "http";

// Import middleware
import { withTenant, withTenantAndService } from './middleware/tenant';
import { validateBody, validateRequired, webhookSchemas } from './middleware/validation';

// Import handlers
import { getAllTenants, getTenantBySlug } from './handlers/tenant';
import { getSyncStatus, refreshSyncStatus } from './handlers/sync';
import { getItems, getCustomers, getProjects, createWebhook } from './handlers/erpnext';
import { getCustomers as getSaleorCustomers, getProducts, getOrders, createCustomerWebhook, updateCustomerWebhook } from './handlers/saleor';
import { syncCustomers } from './handlers/customer-sync';
import { getWebhookStatus, handleERPNextWebhook, handleSaleorWebhook } from './handlers/webhooks';
import { handleAutomation, getN8nStatus, executeWorkflow, registerWebhook } from './handlers/n8n';

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== TENANT ROUTES ====================
  
  app.get("/api/tenants", getAllTenants);
  app.get("/api/tenants/:slug", getTenantBySlug);
  
  // ==================== SYNC STATUS ROUTES ====================
  
  app.get("/api/tenants/:slug/sync-status", withTenant(getSyncStatus));
  app.post("/api/tenants/:slug/refresh-sync", withTenant(refreshSyncStatus));
  
  // ==================== ERPNext ROUTES ====================
  
  app.get("/api/tenants/:slug/erpnext/items", withTenantAndService('erpnext')(getItems));
  app.get("/api/tenants/:slug/erpnext/customers", withTenantAndService('erpnext')(getCustomers));
  app.get("/api/tenants/:slug/erpnext/projects", withTenantAndService('erpnext')(getProjects));
  app.post("/api/tenants/:slug/erpnext/create-webhook", 
    withTenantAndService('erpnext')(createWebhook));
  
  // ==================== SALEOR ROUTES ====================
  
  app.get("/api/tenants/:slug/saleor/customers", withTenantAndService('saleor')(getSaleorCustomers));
  app.get("/api/tenants/:slug/saleor/products", withTenantAndService('saleor')(getProducts));
  app.get("/api/tenants/:slug/saleor/orders", withTenantAndService('saleor')(getOrders));
  app.post("/api/tenants/:slug/saleor/create-customer-webhook", 
    withTenantAndService('saleor')(createCustomerWebhook));
  app.post("/api/tenants/:slug/saleor/update-customer-webhook", 
    withTenantAndService('saleor')(updateCustomerWebhook));
  
  // ==================== CUSTOMER SYNC ROUTES ====================
  
  app.post("/api/tenants/:slug/sync/customers", withTenantAndService('both')(syncCustomers));
  
  // ==================== WEBHOOK ROUTES ====================
  
  app.get("/api/tenants/:slug/webhooks/status", withTenant(getWebhookStatus));
  app.post("/api/webhooks/erpnext/:slug", withTenant(handleERPNextWebhook));
  app.post("/api/webhooks/saleor/:slug", withTenant(handleSaleorWebhook));
  
  // ==================== N8N AUTOMATION ROUTES ====================
  
  app.post("/api/n8n/automation/:slug", 
    withTenant(handleAutomation));
  app.get("/api/n8n/status/:slug", withTenant(getN8nStatus));
  app.post("/api/n8n/execute/:slug", withTenant(executeWorkflow));
  app.post("/api/tenants/:slug/n8n/register", withTenant(registerWebhook));
  
  // ==================== INTEGRATION LOGS ====================
  
  app.get("/api/tenants/:slug/logs", withTenant(async (req, res, tenant) => {
    try {
      const { storage } = await import('../storage');
      const logs = await storage.getIntegrationLogsByTenant(tenant.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch integration logs" });
    }
  }));

  const httpServer = createServer(app);
  return httpServer;
}
