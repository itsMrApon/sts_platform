/**
 * Tenant middleware for route handlers
 */

import { storage } from '../../storage';
import { TenantRouteHandler } from '../types';

/**
 * Middleware to get tenant by slug and pass it to the handler
 */
export function withTenant(handler: TenantRouteHandler) {
  return async (req: any, res: any) => {
    try {
      const tenant = await storage.getTenantBySlug(req.params.slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      await handler(req, res, tenant);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to process request",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
}

/**
 * Middleware to get tenant and ensure specific service is configured
 */
export function withTenantAndService(service: 'erpnext' | 'saleor' | 'both') {
  return function(handler: TenantRouteHandler) {
    return withTenant(async (req, res, tenant) => {
      if (service === 'erpnext' && !tenant.erpnextUrl) {
        return res.status(404).json({ message: "ERPNext configuration not found" });
      }
      
      if (service === 'saleor' && !tenant.saleorUrl) {
        return res.status(404).json({ message: "Saleor configuration not found" });
      }
      
      if (service === 'both' && (!tenant.erpnextUrl || !tenant.saleorUrl)) {
        return res.status(404).json({ message: "Both ERPNext and Saleor configurations are required" });
      }
      
      await handler(req, res, tenant);
    });
  };
}
