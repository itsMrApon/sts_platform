import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ERPNextClient } from "./services/erpnext-client";
import { SaleorClient } from "./services/saleor-client";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all tenants
  app.get("/api/tenants", async (req, res) => {
    try {
      const tenants = await storage.getAllTenants();
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenants" });
    }
  });

  // Get tenant by slug
  app.get("/api/tenants/:slug", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenant" });
    }
  });

  // Get sync status for tenant
  app.get("/api/tenants/:slug/sync-status", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const erpnextStatus = await storage.getSyncStatus(tenant.id, "erpnext");
      const saleorStatus = await storage.getSyncStatus(tenant.id, "saleor");

      res.json({
        erpnext: erpnextStatus,
        saleor: saleorStatus
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sync status" });
    }
  });

  // ERPNext integration endpoints
  app.get("/api/tenants/:slug/erpnext/items", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant || !tenant.erpnextUrl) {
        return res.status(404).json({ message: "Tenant or ERPNext configuration not found" });
      }

      const client = new ERPNextClient({
        baseUrl: tenant.erpnextUrl,
        apiKey: tenant.erpnextApiKey || undefined,
        apiSecret: tenant.erpnextApiSecret || undefined,
      }, tenant.id);

      const items = await client.getItems();
      await client.updateSyncStatus(items.length);
      
      res.json(items);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch ERPNext items",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/tenants/:slug/erpnext/customers", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant || !tenant.erpnextUrl) {
        return res.status(404).json({ message: "Tenant or ERPNext configuration not found" });
      }

      const client = new ERPNextClient({
        baseUrl: tenant.erpnextUrl,
        apiKey: tenant.erpnextApiKey || undefined,
        apiSecret: tenant.erpnextApiSecret || undefined,
      }, tenant.id);

      const customers = await client.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch ERPNext customers",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Saleor integration endpoints  
  app.get("/api/tenants/:slug/saleor/products", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant || !tenant.saleorUrl) {
        return res.status(404).json({ message: "Tenant or Saleor configuration not found" });
      }

      const client = new SaleorClient({
        baseUrl: tenant.saleorUrl,
        token: tenant.saleorToken || undefined,
      }, tenant.id);

      const products = await client.getProducts();
      const productCount = products.products?.edges?.length || 0;
      await client.updateSyncStatus(productCount);
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch Saleor products",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/tenants/:slug/saleor/orders", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant || !tenant.saleorUrl) {
        return res.status(404).json({ message: "Tenant or Saleor configuration not found" });
      }

      const client = new SaleorClient({
        baseUrl: tenant.saleorUrl,
        token: tenant.saleorToken || undefined,
      }, tenant.id);

      const orders = await client.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch Saleor orders",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Webhook endpoints
  app.post("/api/webhooks/erpnext/:slug", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const client = new ERPNextClient({
        baseUrl: tenant.erpnextUrl!,
        apiKey: tenant.erpnextApiKey || undefined,
        apiSecret: tenant.erpnextApiSecret || undefined,
      }, tenant.id);

      await client.handleWebhook(req.body);
      res.json({ message: "Webhook processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process ERPNext webhook" });
    }
  });

  app.post("/api/webhooks/saleor/:slug", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const client = new SaleorClient({
        baseUrl: tenant.saleorUrl!,
        token: tenant.saleorToken || undefined,
      }, tenant.id);

      await client.handleWebhook(req.body);
      res.json({ message: "Webhook processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process Saleor webhook" });
    }
  });

  // Get integration logs
  app.get("/api/tenants/:slug/logs", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const logs = await storage.getIntegrationLogsByTenant(tenant.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch integration logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
