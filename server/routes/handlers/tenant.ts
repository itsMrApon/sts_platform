/**
 * Tenant-related route handlers
 */

import { storage } from '../../storage';
import { sendSuccess, sendError } from '../utils/response';
import { RouteHandler } from '../types';

/**
 * Get all tenants
 */
export const getAllTenants: RouteHandler = async (req, res) => {
  try {
    const tenants = await storage.getAllTenants();
    sendSuccess(res, tenants);
  } catch (error) {
    sendError(res, 500, "Failed to fetch tenants", error);
  }
};

/**
 * Get tenant by slug
 */
export const getTenantBySlug: RouteHandler = async (req, res) => {
  try {
    const tenant = await storage.getTenantBySlug(req.params.slug);
    if (!tenant) {
      return sendError(res, 404, "Tenant not found");
    }
    sendSuccess(res, tenant);
  } catch (error) {
    sendError(res, 500, "Failed to fetch tenant", error);
  }
};
