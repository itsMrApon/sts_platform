/**
 * ERPNext-related route handlers
 */

import { createERPNextClient } from '../utils/client-factory';
import { sendSuccess, sendError } from '../utils/response';
import { TenantRouteHandler } from '../types';

/**
 * Get ERPNext items
 */
export const getItems: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const client = createERPNextClient(tenant);
    const items = await client.getItems({ limit: 20 });
    const count = Array.isArray(items) ? items.length : 0;
    await client.updateSyncStatus(count);
    
    sendSuccess(res, items);
  } catch (error) {
    sendError(res, 500, "Failed to fetch ERPNext items", error);
  }
};

/**
 * Get ERPNext customers
 */
export const getCustomers: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const client = createERPNextClient(tenant);
    const customers = await client.getCustomers({ limit: 20 });
    sendSuccess(res, customers);
  } catch (error) {
    sendError(res, 500, "Failed to fetch ERPNext customers", error);
  }
};

/**
 * Get ERPNext projects
 */
export const getProjects: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const client = createERPNextClient(tenant);
    const projects = await client.getProjects({ limit: 20 });
    sendSuccess(res, projects);
  } catch (error) {
    sendError(res, 500, "Failed to fetch ERPNext projects", error);
  }
};

/**
 * Create ERPNext webhook
 */
export const createWebhook: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const { doctype, event = 'after_insert', targetUrl, name = 'ERPNext → Backend', isEnabled = 1 } = req.body;
    
    if (!doctype || !targetUrl) {
      return sendError(res, 400, "doctype and targetUrl are required");
    }

    const client = createERPNextClient(tenant);
    const payload = {
      webhook_docevent: event,
      webhook_doctype: doctype,
      request_url: targetUrl,
      name,
      is_enabled: isEnabled
    };

    const result = await client.createWebhook(payload);
    sendSuccess(res, { webhook: result });
  } catch (error) {
    sendError(res, 500, "Failed to create ERPNext webhook", error);
  }
};
