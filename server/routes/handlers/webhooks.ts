/**
 * Webhook handlers
 */

import { storage } from '../../storage';
import { createClients } from '../utils/client-factory';
import { sendSuccess, sendError } from '../utils/response';
import { TenantRouteHandler, WebhookStatus } from '../types';

/**
 * Get webhook status for all systems
 */
export const getWebhookStatus: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const status: WebhookStatus = {
      saleor: { connected: !!tenant.saleorUrl, webhooks: [] },
      erpnext: { connected: !!tenant.erpnextUrl, webhooks: [] },
      n8n: { connected: true, workflows: [] }
    };

    // Check Saleor webhooks if configured
    if (tenant.saleorUrl) {
      try {
        const { saleor } = createClients(tenant);
        const webhooks = await saleor.getWebhooks();
        status.saleor.webhooks = webhooks.webhooks?.edges?.map((edge: any) => edge.node) || [];
      } catch (error) {
        status.saleor.connected = false;
      }
    }

    // Check ERPNext webhooks if configured
    if (tenant.erpnextUrl) {
      try {
        const { erpnext } = createClients(tenant);
        // ERPNext doesn't have a direct webhook list API, so we'll mark as configured
        status.erpnext.webhooks = [{ name: "Customer Sync", status: "active" }];
      } catch (error) {
        status.erpnext.connected = false;
      }
    }

    sendSuccess(res, status);
  } catch (error) {
    sendError(res, 500, "Failed to get webhook status", error);
  }
};

/**
 * Handle ERPNext webhook
 */
export const handleERPNextWebhook: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const { erpnext } = createClients(tenant);
    await erpnext.handleWebhook(req.body);
    sendSuccess(res, { message: "Webhook processed successfully" });
  } catch (error) {
    sendError(res, 500, "Failed to process ERPNext webhook", error);
  }
};

/**
 * Handle Saleor webhook for customer sync
 */
export const handleSaleorWebhook: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const { saleor } = createClients(tenant);

    // Always log receipt of webhook
    await saleor.handleWebhook({
      headers: req.headers,
      body: req.body
    });

    // If ERPNext is configured, try to upsert a Customer when Saleor sends a customer/user created event
    if (tenant.erpnextUrl) {
      const { erpnext } = createClients(tenant);

      // Per Saleor docs, event name is provided in headers as Saleor-Event
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
        const data = req.body?.data || req.body?.payload || {};
        const user = data?.user || data?.customer || req.body?.user || req.body?.customer || {};
        const email: string | undefined = user.email || req.body?.payload?.email;
        const firstName: string = user.firstName || user.first_name || "";
        const lastName: string = user.lastName || user.last_name || "";
        const customerName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (email || "Customer");

        if (email) {
          // Minimal ERPNext Customer payload
          const customerData: any = {
            customer_name: customerName,
            customer_type: "Individual",
            email_id: email,
            mobile_no: (user as any)?.phone || (user as any)?.phoneNumber || undefined,
          };

          try {
            // Idempotent upsert by email
            const existing = await erpnext.findCustomerByEmail(email);
            let customerDocName: string | undefined = existing?.name;
            if (!existing) {
              const created = await erpnext.createCustomer(customerData);
              customerDocName = created?.name || created?.customer_name || customerName;
            } else if (isCustomerUpdate) {
              await erpnext.updateCustomer(existing.name, customerData).catch(() => {});
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

            try { if (billingPayload) await erpnext.createAddress(billingPayload); } catch {}
            try { if (shippingPayload) await erpnext.createAddress(shippingPayload); } catch {}

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

    sendSuccess(res, { message: "Webhook processed successfully" });
  } catch (error) {
    sendError(res, 500, "Failed to process Saleor webhook", error);
  }
};
