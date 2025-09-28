/**
 * Saleor-related route handlers
 */

import { createSaleorClient } from '../utils/client-factory';
import { sendSuccess, sendError } from '../utils/response';
import { TenantRouteHandler } from '../types';

/**
 * Get Saleor customers
 */
export const getCustomers: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const client = createSaleorClient(tenant);
    const customers = await client.getCustomers({ first: 20 });
    sendSuccess(res, customers);
  } catch (error) {
    sendError(res, 500, "Failed to fetch Saleor customers", error);
  }
};

/**
 * Get Saleor products
 */
export const getProducts: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const client = createSaleorClient(tenant);
    const products = await client.getProducts({ first: 20 });
    const productCount = products.products?.edges?.length || 0;
    await client.updateSyncStatus(productCount);
    
    sendSuccess(res, products);
  } catch (error) {
    sendError(res, 500, "Failed to fetch Saleor products", error);
  }
};

/**
 * Get Saleor orders
 */
export const getOrders: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const client = createSaleorClient(tenant);
    const orders = await client.getOrders({ first: 20 });
    sendSuccess(res, orders);
  } catch (error) {
    sendError(res, 500, "Failed to fetch Saleor orders", error);
  }
};

/**
 * Create Saleor customer webhook
 */
export const createCustomerWebhook: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const { targetUrl, secretKey } = req.body;
    
    if (!targetUrl) {
      return sendError(res, 400, "targetUrl is required");
    }

    const client = createSaleorClient(tenant);
    const result = await client.upsertCustomerWebhook(targetUrl, secretKey);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, 500, "Failed to create webhook", error);
  }
};

/**
 * Update Saleor customer webhook
 */
export const updateCustomerWebhook: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const { name, targetUrl, secretKey } = req.body;
    
    if (!name || !targetUrl) {
      return sendError(res, 400, "name and targetUrl are required");
    }

    const client = createSaleorClient(tenant);
    const result = await client.updateCustomerWebhookByName(name, targetUrl, secretKey);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, 500, "Failed to update webhook", error);
  }
};
