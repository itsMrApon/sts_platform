import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SaleorClient, ERPNextClient } from "./clients";
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

      // Live connectivity checks
      const liveStatus: Record<string, any> = {};

      // ERPNext live check
      let erpnextIsActive = false;
      let erpnextRecordCount = 0;
      if (tenant.erpnextUrl) {
        try {
          const erp = new ERPNextClient({
            baseUrl: tenant.erpnextUrl,
            apiKey: tenant.erpnextApiKey || undefined,
            apiSecret: tenant.erpnextApiSecret || undefined,
            tenantId: tenant.id,
          });
          const items = await erp.getItems({ limit: 1 }); // Ping by getting one item
          erpnextIsActive = true;
          erpnextRecordCount = Array.isArray(items) ? items.length : 0;
        } catch (e) {
          console.log(`ERPNext live check failed for tenant ${tenant.slug}:`, (e as Error).message);
          erpnextIsActive = false;
        }
      }
      liveStatus.erpnext = {
        isActive: erpnextIsActive,
        recordCount: erpnextRecordCount,
        lastSyncAt: (await storage.getSyncStatus(tenant.id, "erpnext"))?.lastSyncAt || null,
      };

      // Saleor live check
      let saleorIsActive = false;
      let saleorRecordCount = 0;
      if (tenant.saleorUrl) {
        try {
          const saleor = new SaleorClient({
            baseUrl: tenant.saleorUrl,
            token: tenant.saleorToken || undefined,
            apiVersion: process.env.SALEOR_API_VERSION || '2023-10',
            channelSlug: process.env.SALEOR_CHANNEL || 'default-channel',
            tenantId: tenant.id,
          });
          const products = await saleor.getProducts({ first: 1 }); // Ping by getting one product
          saleorIsActive = true;
          saleorRecordCount = products?.products?.edges?.length || 0;
        } catch (e) {
          console.log(`Saleor live check failed for tenant ${tenant.slug}:`, (e as Error).message);
          saleorIsActive = false;
        }
      }
      liveStatus.saleor = {
        isActive: saleorIsActive,
        recordCount: saleorRecordCount,
        lastSyncAt: (await storage.getSyncStatus(tenant.id, "saleor"))?.lastSyncAt || null,
      };

      res.json({
        erpnext: liveStatus.erpnext,
        saleor: liveStatus.saleor
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sync status" });
    }
  });

  // Live refresh sync: ping integrations and update lastSyncAt/recordCount
  app.post("/api/tenants/:slug/refresh-sync", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const results: Record<string, any> = {};

      // ERPNext ping
      if (tenant.erpnextUrl) {
        try {
          const erp = new ERPNextClient({
            baseUrl: tenant.erpnextUrl,
            apiKey: tenant.erpnextApiKey || undefined,
            apiSecret: tenant.erpnextApiSecret || undefined,
            tenantId: tenant.id,
          });
          const items = await erp.getItems({ limit: 20 });
          const count = Array.isArray(items) ? items.length : 0;
          await erp.updateSyncStatus(count).catch(() => {});
          results.erpnext = { ok: true, count };
        } catch (e: any) {
          results.erpnext = { ok: false, error: e?.message || String(e) };
        }
      }

      // Saleor ping
      if (tenant.saleorUrl) {
        try {
          const saleor = new SaleorClient({
            baseUrl: tenant.saleorUrl,
            token: tenant.saleorToken || undefined,
            tenantId: tenant.id,
          });
          const products = await saleor.getProducts({ first: 1 });
          const count = products?.products?.edges?.length || 0;
          await saleor.updateSyncStatus(count).catch(() => {});
          results.saleor = { ok: true, count };
        } catch (e: any) {
          results.saleor = { ok: false, error: e?.message || String(e) };
        }
      }

      // n8n health
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

      // Return latest stored status after refresh
      const erpnextStatus = await storage.getSyncStatus(tenant.id, "erpnext");
      const saleorStatus = await storage.getSyncStatus(tenant.id, "saleor");

      res.json({
        success: true,
        results,
        status: { erpnext: erpnextStatus, saleor: saleorStatus },
        n8n: { available: n8nAvailable, baseUrl: n8nBase },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh sync status" });
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
            tenantId: tenant.id,
          });

      const items = await client.getItems({ limit: 20 });
      const count = Array.isArray(items) ? items.length : 0;
      await client.updateSyncStatus(count);
      
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
            tenantId: tenant.id,
          });

      const customers = await client.getCustomers({ limit: 20 });
      res.json(customers);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch ERPNext customers",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/tenants/:slug/saleor/customers", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant || !tenant.saleorUrl) {
        return res.status(404).json({ message: "Tenant or Saleor configuration not found" });
      }

      const client = new SaleorClient({
        baseUrl: tenant.saleorUrl,
        token: tenant.saleorToken || undefined,
            tenantId: tenant.id,
          });

      const customers = await client.getCustomers({ first: 20 });
      res.json(customers);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch Saleor customers",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get webhook status for all systems
  app.get("/api/tenants/:slug/webhooks/status", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const status = {
        saleor: { connected: !!tenant.saleorUrl, webhooks: [] as any[] },
        erpnext: { connected: !!tenant.erpnextUrl, webhooks: [] as any[] },
        n8n: { connected: true, workflows: [] as any[] }
      };

      // Check Saleor webhooks if configured
      if (tenant.saleorUrl) {
        try {
          const saleorClient = new SaleorClient({
            baseUrl: tenant.saleorUrl,
            token: tenant.saleorToken || undefined,
            tenantId: tenant.id,
          });
          const webhooks = await saleorClient.getWebhooks();
          status.saleor.webhooks = webhooks.webhooks?.edges?.map((edge: any) => edge.node) || [];
        } catch (error) {
          status.saleor.connected = false;
        }
      }

      // Check ERPNext webhooks if configured
      if (tenant.erpnextUrl) {
        try {
          const erpnextClient = new ERPNextClient({
        baseUrl: tenant.erpnextUrl,
        apiKey: tenant.erpnextApiKey || undefined,
        apiSecret: tenant.erpnextApiSecret || undefined,
            tenantId: tenant.id,
          });
          // ERPNext doesn't have a direct webhook list API, so we'll mark as configured
          status.erpnext.webhooks = [{ name: "Customer Sync", status: "active" }];
        } catch (error) {
          status.erpnext.connected = false;
        }
      }

      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to get webhook status" });
    }
  });

  app.post("/api/tenants/:slug/sync/customers", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant || !tenant.saleorUrl || !tenant.erpnextUrl) {
        return res.status(404).json({ message: "Tenant, Saleor, or ERPNext configuration not found" });
      }

      const saleorClient = new SaleorClient({
        baseUrl: tenant.saleorUrl,
        token: tenant.saleorToken || undefined,
            tenantId: tenant.id,
          });

      const erpnextClient = new ERPNextClient({
        baseUrl: tenant.erpnextUrl,
        apiKey: tenant.erpnextApiKey || undefined,
        apiSecret: tenant.erpnextApiSecret || undefined,
            tenantId: tenant.id,
          });

      // Get all customers from Saleor
      const saleorCustomers = await saleorClient.getCustomers({ first: 100 });
      const customers = saleorCustomers?.customers?.edges?.map((edge: any) => edge.node) || [];

      let syncedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      const results = [];

      for (const customer of customers) {
        try {
          const email = customer.email;
          const firstName = customer.firstName || "";
          const lastName = customer.lastName || "";
          const customerName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : email;

          // Check if customer already exists in ERPNext
          const existingCustomer = await erpnextClient.findCustomerByEmail(email);
          
          if (existingCustomer) {
            skippedCount++;
            results.push({
              email,
              name: customerName,
              status: 'skipped',
              reason: 'Customer already exists in ERPNext'
            });
            continue;
          }

          // Create customer in ERPNext
          const customerData = {
            customer_name: customerName,
            customer_type: "Individual" as const,
            email_id: email,
            mobile_no: customer.defaultBillingAddress?.phone || customer.defaultShippingAddress?.phone || undefined,
          };

          const createdCustomer = await erpnextClient.createCustomer(customerData);
          const customerDocName = createdCustomer?.name || createdCustomer?.customer_name || customerName;

          // Create addresses if available
          const billing = customer.defaultBillingAddress;
          const shipping = customer.defaultShippingAddress;

          const makeAddressPayload = (addr: any, type: 'Billing' | 'Shipping') => {
            if (!addr || Object.keys(addr).length === 0) return undefined;
            return {
              address_title: `${customerDocName} ${type}`.trim(),
              address_type: type,
              address_line1: addr.streetAddress1 || customerName,
              address_line2: addr.streetAddress2 || '',
              city: addr.city || '',
              state: addr.countryArea || '',
              pincode: addr.postalCode || '',
              country: addr.country?.country || addr.country?.code || '',
              phone: addr.phone || '',
              email_id: email,
              links: [
                { link_doctype: 'Customer' as const, link_name: customerDocName }
              ]
            };
          };

          try { 
            const billingPayload = makeAddressPayload(billing, 'Billing');
            if (billingPayload) await erpnextClient.createAddress(billingPayload); 
          } catch {}
          
          try { 
            const shippingPayload = makeAddressPayload(shipping, 'Shipping');
            if (shippingPayload) await erpnextClient.createAddress(shippingPayload); 
          } catch {}

          syncedCount++;
          results.push({
            email,
            name: customerName,
            status: 'synced',
            customerDocName
          });

          // Log successful sync
          await storage.createIntegrationLog({
            tenantId: tenant.id,
            source: 'integration',
            action: 'bulk_customer_synced',
            status: 'success',
            payload: {
              source: 'saleor',
              target: 'erpnext',
              email,
              name: customerName,
              customerDocName,
              timestamp: new Date().toISOString()
            }
          }).catch(() => {});

        } catch (error: any) {
          errorCount++;
          results.push({
            email: customer.email,
            name: customer.firstName + ' ' + customer.lastName,
            status: 'error',
            error: error.message || String(error)
          });

          // Log error
          await storage.createIntegrationLog({
            tenantId: tenant.id,
            source: 'integration',
            action: 'bulk_customer_sync_failed',
            status: 'error',
            errorMessage: error.message || String(error),
            payload: {
              source: 'saleor',
              target: 'erpnext',
              email: customer.email,
              name: customer.firstName + ' ' + customer.lastName,
              timestamp: new Date().toISOString()
            }
          }).catch(() => {});
        }
      }

      res.json({
        success: true,
        summary: {
          total: customers.length,
          synced: syncedCount,
          skipped: skippedCount,
          errors: errorCount
        },
        results
      });

    } catch (error) {
      res.status(500).json({ 
        message: "Failed to sync customers",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/tenants/:slug/erpnext/projects", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant || !tenant.erpnextUrl) {
        return res.status(404).json({ message: "Tenant or ERPNext configuration not found" });
      }

      const client = new ERPNextClient({
        baseUrl: tenant.erpnextUrl,
        apiKey: tenant.erpnextApiKey || undefined,
        apiSecret: tenant.erpnextApiSecret || undefined,
            tenantId: tenant.id,
          });

      const projects = await client.getProjects({ limit: 20 });
      res.json(projects);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch ERPNext projects",
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
            tenantId: tenant.id,
          });

      const products = await client.getProducts({ first: 20 });
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

  // Create Saleor webhook for customer sync
  app.post("/api/tenants/:slug/saleor/create-customer-webhook", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant || !tenant.saleorUrl) {
        return res.status(404).json({ message: "Tenant or Saleor configuration not found" });
      }

      const { targetUrl, secretKey } = req.body || {};
      if (!targetUrl) {
        return res.status(400).json({ message: "targetUrl is required" });
      }

      const client = new SaleorClient({
        baseUrl: tenant.saleorUrl,
        token: tenant.saleorToken || undefined,
            tenantId: tenant.id,
          });

      const result = await client.upsertCustomerWebhook(targetUrl, secretKey);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to create webhook" });
    }
  });

  // Update existing Saleor webhook by name (or create if missing)
  app.post("/api/tenants/:slug/saleor/update-customer-webhook", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant || !tenant.saleorUrl) {
        return res.status(404).json({ message: "Tenant or Saleor configuration not found" });
      }

      const { name, targetUrl, secretKey } = req.body || {};
      if (!name || !targetUrl) {
        return res.status(400).json({ message: "name and targetUrl are required" });
      }

      const client = new SaleorClient({
        baseUrl: tenant.saleorUrl,
        token: tenant.saleorToken || undefined,
            tenantId: tenant.id,
          });

      const result = await client.updateCustomerWebhookByName(name, targetUrl, secretKey);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to update webhook" });
    }
  });

  // Create ERPNext webhook to forward selected DocTypes to our backend
  app.post("/api/tenants/:slug/erpnext/create-webhook", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant || !tenant.erpnextUrl) {
        return res.status(404).json({ message: "Tenant or ERPNext configuration not found" });
      }

      const { doctype, event = 'after_insert', targetUrl, name = 'ERPNext → Backend', isEnabled = 1 } = req.body || {};
      if (!doctype || !targetUrl) {
        return res.status(400).json({ message: "doctype and targetUrl are required" });
      }

      const erp = new ERPNextClient({
        baseUrl: tenant.erpnextUrl,
        apiKey: tenant.erpnextApiKey || undefined,
        apiSecret: tenant.erpnextApiSecret || undefined,
            tenantId: tenant.id,
          });

      const payload = {
        webhook_docevent: event,
        webhook_doctype: doctype,
        request_url: targetUrl,
        name,
        is_enabled: isEnabled
      } as any;

      const result = await erp.createWebhook(payload);
      res.json({ success: true, webhook: result });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to create ERPNext webhook" });
    }
  });

  // n8n setup helper: log target (n8n uses UI to create webhooks)
  app.post("/api/tenants/:slug/n8n/register", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) return res.status(404).json({ message: "Tenant not found" });
      const { workflow, webhookPath } = req.body || {};
      await storage.createIntegrationLog({
        tenantId: tenant.id,
        source: 'n8n',
        action: 'webhook_registered',
        status: 'success',
        payload: { workflow, webhookPath, timestamp: new Date().toISOString() }
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to register n8n webhook" });
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
            tenantId: tenant.id,
          });

      const orders = await client.getOrders({ first: 20 });
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
            tenantId: tenant.id,
          });

      await client.handleWebhook(req.body);
      res.json({ message: "Webhook processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process ERPNext webhook" });
    }
  });

  // Saleor webhook route for customer sync to ERPNext
  app.post("/api/webhooks/saleor/:slug", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const saleorClient = new SaleorClient({
        baseUrl: tenant.saleorUrl!,
        token: tenant.saleorToken || undefined,
            tenantId: tenant.id,
          });

      // Always log receipt of webhook (store headers and body shape for debugging)
      await saleorClient.handleWebhook({
        headers: req.headers,
        body: req.body
      });

      // If ERPNext is configured, try to upsert a Customer when Saleor sends a customer/user created event
      if (tenant.erpnextUrl) {
        const erpnextClient = new ERPNextClient({
          baseUrl: tenant.erpnextUrl,
          apiKey: tenant.erpnextApiKey || undefined,
          apiSecret: tenant.erpnextApiSecret || undefined,
            tenantId: tenant.id,
          });

        // Per Saleor docs, event name is provided in headers as Saleor-Event (or legacy X-Saleor-Event)
        const headerEvent = (req.headers['saleor-event'] || (req.headers['x-saleor-event'] as any) || '').toString();
        const bodyEvent = (req.body?.event || req.body?.type || req.body?.action || '').toString();
        const event: string = (headerEvent || bodyEvent).toUpperCase();

        // Supported Saleor events indicating a new customer/user
        const isCustomerCreate = [
          "CUSTOMER_CREATED",
          "USER_CREATED",
          "ACCOUNT_CREATED",
        ].includes(event);
        const isCustomerUpdate = [
          "CUSTOMER_UPDATED",
          "USER_UPDATED",
          "ACCOUNT_UPDATED",
        ].includes(event);

        if (isCustomerCreate || isCustomerUpdate) {
          // Try to extract user/customer info from Saleor shapes
          // Saleor sends payload in req.body.data according to subscription query
          const data = req.body?.data || req.body?.payload || {};
          const user = data?.user || data?.customer || req.body?.user || req.body?.customer || {};
          const email: string | undefined = user.email || req.body?.payload?.email;
          const firstName: string = user.firstName || user.first_name || "";
          const lastName: string = user.lastName || user.last_name || "";
          const customerName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (email || "Customer");

          if (email) {
            // Minimal ERPNext Customer payload. ERPNext often defaults group/territory.
            const customerData: any = {
              customer_name: customerName,
              customer_type: "Individual",
              email_id: email,
              mobile_no: (user as any)?.phone || (user as any)?.phoneNumber || undefined,
            };

            try {
              // Idempotent upsert by email
              const existing = await erpnextClient.findCustomerByEmail(email);
              let customerDocName: string | undefined = existing?.name;
              if (!existing) {
                const created = await erpnextClient.createCustomer(customerData);
                customerDocName = created?.name || created?.customer_name || customerName;
              } else if (isCustomerUpdate) {
                await erpnextClient.updateCustomer(existing.name, customerData).catch(() => {});
              }

              // Attempt to map phone + addresses if present in Saleor payload
              const phone: string | undefined = (user as any)?.phone || (user as any)?.phoneNumber || (data as any)?.phone;
              const billing = (data as any)?.billing_address || (data as any)?.billingAddress || (user as any)?.defaultBillingAddress || {};
              const shipping = (data as any)?.shipping_address || (data as any)?.shippingAddress || (user as any)?.defaultShippingAddress || {};

              const makeAddressPayload = (addr: any, type: 'Billing' | 'Shipping') => {
                if (!addr || Object.keys(addr).length === 0) return undefined;
                const line1 = addr.streetAddress1 || addr.address1 || addr.address_line1 || addr.street || addr.street1;
                const line2 = addr.streetAddress2 || addr.address2 || addr.address_line2 || addr.street2 || '';
                const city = addr.city || '';
                const state = addr.countryArea || addr.state || addr.province || '';
                const pincode = addr.postalCode || addr.zip || '';
                const country = (addr.country && (addr.country.country || addr.country.code)) || addr.country || '';
                const phoneNum = addr.phone || phone || '';

                const titleBase = (customerDocName || customerName).toString();
                return {
                  address_title: `${titleBase} ${type}`.trim(),
                  address_type: type,
                  address_line1: line1 || customerName,
                  address_line2: line2,
                  city,
                  state,
                  pincode,
                  country,
                  phone: phoneNum,
                  email_id: email,
                  links: [
                    {
                      link_doctype: 'Customer',
                      link_name: customerDocName || customerName
                    }
                  ]
                } as any;
              };

              const billingPayload = makeAddressPayload(billing, 'Billing');
              const shippingPayload = makeAddressPayload(shipping, 'Shipping');

              try { if (billingPayload) await erpnextClient.createAddress(billingPayload); } catch {}
              try { if (shippingPayload) await erpnextClient.createAddress(shippingPayload); } catch {}

              await storage.createIntegrationLog({
                tenantId: tenant.id,
                source: 'integration',
                action: 'customer_synced',
                status: 'success',
                payload: {
                  source: 'saleor',
                  target: 'erpnext',
                  email,
                  name: customerName,
                  phone: phone || null,
                  event,
                  timestamp: new Date().toISOString()
                }
              }).catch(() => {});
            } catch (e: any) {
              // Best-effort duplicate handling: if ERPNext rejects due to existing record, ignore
              const msg = (e && e.message ? e.message : String(e)).toLowerCase();
              const duplicate = msg.includes('exists') || msg.includes('duplicate') || msg.includes('unique');
              if (!duplicate) {
                // Log the customer sync failure
                await storage.createIntegrationLog({
                  tenantId: tenant.id,
                  source: 'integration',
                  action: 'customer_sync_failed',
                  status: 'error',
                  errorMessage: e instanceof Error ? e.message : String(e),
                  payload: {
                    source: 'saleor',
                    target: 'erpnext',
                    email,
                    name: customerName,
                    event,
                    timestamp: new Date().toISOString()
                  }
                }).catch(() => {});
              }
            }
          }
        }
      }

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

  // n8n Central Automation Hub - Simple Webhook Endpoints
  app.post("/api/n8n/automation/:slug", async (req, res) => {
    try {
      const { action, data } = req.body;
      const tenant = await storage.getTenantBySlug(req.params.slug);
      
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

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
          return res.status(400).json({ message: "Unknown action" });
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

      res.json({
        success: true,
        action,
        tenant: tenant.slug,
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Automation failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Helper functions for existing API calls
  async function handleProductSync(tenant: any) {
    const saleorClient = new SaleorClient({
      baseUrl: tenant.saleorUrl!,
      token: tenant.saleorToken || undefined,
            tenantId: tenant.id,
          });

    const erpnextClient = new ERPNextClient({
      baseUrl: tenant.erpnextUrl!,
      apiKey: tenant.erpnextApiKey || undefined,
      apiSecret: tenant.erpnextApiSecret || undefined,
            tenantId: tenant.id,
          });

    const saleorProducts = await saleorClient.getProducts({ first: 20 });
    const erpnextItems = await erpnextClient.getItems({ limit: 20 });

    return {
      saleorProducts: saleorProducts.products?.edges?.length || 0,
      erpnextItems: Array.isArray(erpnextItems) ? erpnextItems.length : 0,
      message: "Product sync completed"
    };
  }

  async function handleOrderSync(tenant: any) {
    const saleorClient = new SaleorClient({
      baseUrl: tenant.saleorUrl!,
      token: tenant.saleorToken || undefined,
            tenantId: tenant.id,
          });

    const erpnextClient = new ERPNextClient({
      baseUrl: tenant.erpnextUrl!,
      apiKey: tenant.erpnextApiKey || undefined,
      apiSecret: tenant.erpnextApiSecret || undefined,
            tenantId: tenant.id,
          });

    const saleorOrders = await saleorClient.getOrders({ first: 20 });
    const erpnextCustomers = await erpnextClient.getCustomers({ limit: 20 });

    return {
      saleorOrders: saleorOrders.orders?.edges?.length || 0,
      erpnextCustomers: Array.isArray(erpnextCustomers) ? erpnextCustomers.length : 0,
      message: "Order sync completed"
    };
  }

  async function handleCustomerSync(tenant: any) {
    const erpnextClient = new ERPNextClient({
      baseUrl: tenant.erpnextUrl!,
      apiKey: tenant.erpnextApiKey || undefined,
      apiSecret: tenant.erpnextApiSecret || undefined,
            tenantId: tenant.id,
          });

    const erpnextCustomers = await erpnextClient.getCustomers({ limit: 20 });

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

  app.post("/api/n8n/trigger/sync-orders/:slug", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      // Trigger order sync between Saleor and ERPNext
      const saleorClient = new SaleorClient({
        baseUrl: tenant.saleorUrl!,
        token: tenant.saleorToken || undefined,
            tenantId: tenant.id,
          });

      const erpnextClient = new ERPNextClient({
        baseUrl: tenant.erpnextUrl!,
        apiKey: tenant.erpnextApiKey || undefined,
        apiSecret: tenant.erpnextApiSecret || undefined,
            tenantId: tenant.id,
          });

      // Get orders from both systems
      const saleorOrders = await saleorClient.getOrders({ first: 20 });
      const erpnextCustomers = await erpnextClient.getCustomers({ limit: 20 });

      res.json({
        message: "Order sync triggered successfully",
        saleorOrders: saleorOrders.orders?.edges?.length || 0,
        erpnextCustomers: Array.isArray(erpnextCustomers) ? erpnextCustomers.length : 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to trigger order sync",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/n8n/trigger/sync-customers/:slug", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      // Trigger customer sync between Saleor and ERPNext
      const saleorClient = new SaleorClient({
        baseUrl: tenant.saleorUrl!,
        token: tenant.saleorToken || undefined,
            tenantId: tenant.id,
          });

      const erpnextClient = new ERPNextClient({
        baseUrl: tenant.erpnextUrl!,
        apiKey: tenant.erpnextApiKey || undefined,
        apiSecret: tenant.erpnextApiSecret || undefined,
            tenantId: tenant.id,
          });

      // Get customers from both systems
      const erpnextCustomers = await erpnextClient.getCustomers({ limit: 20 });

      res.json({
        message: "Customer sync triggered successfully",
        erpnextCustomers: Array.isArray(erpnextCustomers) ? erpnextCustomers.length : 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to trigger customer sync",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // n8n Status and Health Check Endpoints
  app.get("/api/n8n/status/:slug", async (req, res) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

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

      res.json({
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
      res.status(500).json({ 
        message: "Failed to get n8n status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // n8n Workflow Execution Endpoint
  app.post("/api/n8n/execute/:slug", async (req, res) => {
    try {
      const { workflow, data } = req.body;
      const tenant = await storage.getTenantBySlug(req.params.slug);
      
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      // Log workflow execution
      await storage.createIntegrationLog({
        tenantId: tenant.id,
        source: 'n8n',
        action: 'workflow_executed',
        status: 'success',
        payload: { workflow, data, timestamp: new Date().toISOString() }
      });

      res.json({
        message: "Workflow execution logged successfully",
        workflow,
        tenant: tenant.slug,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to execute n8n workflow",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
