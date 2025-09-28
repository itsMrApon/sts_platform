/**
 * Route types and interfaces
 */

export interface RouteHandler {
  (req: any, res: any): Promise<void>;
}

export interface TenantRouteHandler {
  (req: any, res: any, tenant: any): Promise<void>;
}

export interface SyncStatus {
  erpnext: {
    isActive: boolean;
    recordCount: number;
    lastSyncAt: Date | null;
  };
  saleor: {
    isActive: boolean;
    recordCount: number;
    lastSyncAt: Date | null;
  };
}

export interface WebhookStatus {
  saleor: {
    connected: boolean;
    webhooks: any[];
  };
  erpnext: {
    connected: boolean;
    webhooks: any[];
  };
  n8n: {
    connected: boolean;
    workflows: any[];
  };
}

export interface SyncResult {
  success: boolean;
  summary?: {
    total: number;
    synced: number;
    skipped: number;
    errors: number;
  };
  results?: any[];
  error?: string;
}

export interface N8nAutomationRequest {
  action: 'sync-products' | 'sync-orders' | 'sync-customers' | 'get-status';
  data?: any;
}

export interface N8nAutomationResponse {
  success: boolean;
  action: string;
  tenant: string;
  result: any;
  timestamp: string;
}
