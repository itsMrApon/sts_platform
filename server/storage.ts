import { type User, type InsertUser, type Tenant, type InsertTenant, type IntegrationLog, type InsertIntegrationLog, type SyncStatus, type InsertSyncStatus } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tenants
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined>;
  
  // Integration Logs
  createIntegrationLog(log: InsertIntegrationLog): Promise<IntegrationLog>;
  getIntegrationLogsByTenant(tenantId: string): Promise<IntegrationLog[]>;
  
  // Sync Status
  getSyncStatus(tenantId: string, source: string): Promise<SyncStatus | undefined>;
  updateSyncStatus(tenantId: string, source: string, updates: Partial<SyncStatus>): Promise<SyncStatus>;
}

// Use database storage instead of in-memory
import { DbStorage } from "./storage-db";

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tenants: Map<string, Tenant>;
  private integrationLogs: Map<string, IntegrationLog>;
  private syncStatuses: Map<string, SyncStatus>;

  constructor() {
    this.users = new Map();
    this.tenants = new Map();
    this.integrationLogs = new Map();
    this.syncStatuses = new Map();
    
    // Initialize default tenants
    this.initializeDefaultTenants();
  }

  private initializeDefaultTenants() {
    const defaultTenants: InsertTenant[] = [
      {
        name: "SudoTechServe",
        slug: "sudotechserve",
        description: "Agency & SaaS Operations",
        erpnextUrl: "http://localhost:8080",
        erpnextApiKey: "175aafefd8c448f",
        erpnextApiSecret: "1b2b919c1580ade",
        saleorUrl: "http://localhost:8000",
        saleorToken: "4xtNglUY26s6lDOptk0oUeT66bqxbt",
        isActive: true
      },
      {
        name: "SwitchToSwag",
        slug: "switchtoswag", 
        description: "E-commerce & Design Studio",
        erpnextUrl: "http://localhost:8080",
        erpnextApiKey: "175aafefd8c448f",
        erpnextApiSecret: "1b2b919c1580ade",
        saleorUrl: "http://localhost:8000",
        saleorToken: "4xtNglUY26s6lDOptk0oUeT66bqxbt",
        isActive: true
      },
      {
        name: "StrongTermStrategy",
        slug: "strongtermstrategy",
        description: "Procurement & Manufacturing",
        erpnextUrl: "http://localhost:8080",
        erpnextApiKey: "175aafefd8c448f",
        erpnextApiSecret: "1b2b919c1580ade",
        saleorUrl: "http://localhost:8000",
        saleorToken: "4xtNglUY26s6lDOptk0oUeT66bqxbt",
        isActive: true
      }
    ];

    defaultTenants.forEach(tenant => {
      this.createTenant(tenant);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id,
      role: insertUser.role || "user",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    return Array.from(this.tenants.values()).find(
      (tenant) => tenant.slug === slug,
    );
  }

  async getAllTenants(): Promise<Tenant[]> {
    return Array.from(this.tenants.values());
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const id = randomUUID();
    const tenant: Tenant = { 
      ...insertTenant,
      id,
      description: insertTenant.description || null,
      erpnextUrl: insertTenant.erpnextUrl || null,
      erpnextApiKey: insertTenant.erpnextApiKey || null,
      erpnextApiSecret: insertTenant.erpnextApiSecret || null,
      saleorUrl: insertTenant.saleorUrl || null,
      saleorToken: insertTenant.saleorToken || null,
      webhookSecret: insertTenant.webhookSecret || null,
      isActive: insertTenant.isActive ?? true,
      createdAt: new Date()
    };
    this.tenants.set(id, tenant);
    
    // Initialize sync status for both sources
    this.updateSyncStatus(id, "erpnext", { isActive: true, recordCount: 0 });
    this.updateSyncStatus(id, "saleor", { isActive: true, recordCount: 0 });
    
    return tenant;
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined> {
    const tenant = this.tenants.get(id);
    if (!tenant) return undefined;
    
    const updatedTenant = { ...tenant, ...updates };
    this.tenants.set(id, updatedTenant);
    return updatedTenant;
  }

  async createIntegrationLog(insertLog: InsertIntegrationLog): Promise<IntegrationLog> {
    const id = randomUUID();
    const log: IntegrationLog = { 
      ...insertLog,
      id,
      payload: insertLog.payload || null,
      errorMessage: insertLog.errorMessage || null,
      createdAt: new Date()
    };
    this.integrationLogs.set(id, log);
    return log;
  }

  async getIntegrationLogsByTenant(tenantId: string): Promise<IntegrationLog[]> {
    return Array.from(this.integrationLogs.values())
      .filter(log => log.tenantId === tenantId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getSyncStatus(tenantId: string, source: string): Promise<SyncStatus | undefined> {
    const key = `${tenantId}-${source}`;
    return this.syncStatuses.get(key);
  }

  async updateSyncStatus(tenantId: string, source: string, updates: Partial<SyncStatus>): Promise<SyncStatus> {
    const key = `${tenantId}-${source}`;
    const existing = this.syncStatuses.get(key);
    
    const syncStatus: SyncStatus = {
      id: existing?.id || randomUUID(),
      tenantId,
      source,
      lastSyncAt: updates.lastSyncAt || existing?.lastSyncAt || new Date(),
      recordCount: updates.recordCount ?? existing?.recordCount ?? 0,
      isActive: updates.isActive ?? existing?.isActive ?? true
    };
    
    this.syncStatuses.set(key, syncStatus);
    return syncStatus;
  }
}

// Use database storage for production, fallback to memory for development
const useDatabase = process.env.DATABASE_URL && process.env.NODE_ENV === 'production';
export const storage = useDatabase ? new DbStorage() : new MemStorage();
