/**
 * Sync status and refresh handlers
 */

import { storage } from '../../storage';
import { createClients } from '../utils/client-factory';
import { sendSuccess, sendError } from '../utils/response';
import { TenantRouteHandler, SyncStatus } from '../types';

/**
 * Get sync status for tenant
 */
export const getSyncStatus: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const liveStatus: Record<string, any> = {};

    // ERPNext live check
    let erpnextIsActive = false;
    let erpnextRecordCount = 0;
    if (tenant.erpnextUrl) {
      try {
        const { erpnext } = createClients(tenant);
        const items = await erpnext.getItems({ limit: 1 });
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
        const { saleor } = createClients(tenant);
        const products = await saleor.getProducts({ first: 1 });
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

    sendSuccess(res, liveStatus);
  } catch (error) {
    sendError(res, 500, "Failed to fetch sync status", error);
  }
};

/**
 * Refresh sync status
 */
export const refreshSyncStatus: TenantRouteHandler = async (req, res, tenant) => {
  try {
    const results: Record<string, any> = {};

    // ERPNext ping
    if (tenant.erpnextUrl) {
      try {
        const { erpnext } = createClients(tenant);
        const items = await erpnext.getItems({ limit: 20 });
        const count = Array.isArray(items) ? items.length : 0;
        await erpnext.updateSyncStatus(count).catch(() => {});
        results.erpnext = { ok: true, count };
      } catch (e: any) {
        results.erpnext = { ok: false, error: e?.message || String(e) };
      }
    }

    // Saleor ping
    if (tenant.saleorUrl) {
      try {
        const { saleor } = createClients(tenant);
        const products = await saleor.getProducts({ first: 1 });
        const count = products?.products?.edges?.length || 0;
        await saleor.updateSyncStatus(count).catch(() => {});
        results.saleor = { ok: true, count };
      } catch (e: any) {
        results.saleor = { ok: false, error: e?.message || String(e) };
      }
    }

    // n8n health check
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

    // Get latest stored status
    const erpnextStatus = await storage.getSyncStatus(tenant.id, "erpnext");
    const saleorStatus = await storage.getSyncStatus(tenant.id, "saleor");

    sendSuccess(res, {
      results,
      status: { erpnext: erpnextStatus, saleor: saleorStatus },
      n8n: { available: n8nAvailable, baseUrl: n8nBase },
    });
  } catch (error) {
    sendError(res, 500, "Failed to refresh sync status", error);
  }
};
