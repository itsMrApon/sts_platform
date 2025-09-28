/**
 * Customer synchronization handlers
 */

import { storage } from '../../storage';
import { createClients } from '../utils/client-factory';
import { sendSuccess, sendError } from '../utils/response';
import { TenantRouteHandler, SyncResult } from '../types';

/**
 * Sync customers from Saleor to ERPNext
 */
export const syncCustomers: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const { saleor, erpnext } = createClients(tenant);

    // Get all customers from Saleor
    const saleorCustomers = await saleor.getCustomers({ first: 100 });
    const customers = saleorCustomers?.customers?.edges?.map((edge: any) => edge.node) || [];

    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const results: any[] = [];

    for (const customer of customers) {
      try {
        const email = customer.email;
        const firstName = customer.firstName || "";
        const lastName = customer.lastName || "";
        const customerName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : email;

        // Check if customer already exists in ERPNext
        const existingCustomer = await erpnext.findCustomerByEmail(email);
        
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

        const createdCustomer = await erpnext.createCustomer(customerData);
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
          if (billingPayload) await erpnext.createAddress(billingPayload); 
        } catch {}
        
        try { 
          const shippingPayload = makeAddressPayload(shipping, 'Shipping');
          if (shippingPayload) await erpnext.createAddress(shippingPayload); 
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

    const result: SyncResult = {
      success: true,
      summary: {
        total: customers.length,
        synced: syncedCount,
        skipped: skippedCount,
        errors: errorCount
      },
      results
    };

    sendSuccess(res, result);
  } catch (error) {
    sendError(res, 500, "Failed to sync customers", error);
  }
};
