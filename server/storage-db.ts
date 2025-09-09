import { db } from "./db";
import { users, tenants, integrationLogs, syncStatus } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { type IStorage } from "./storage";

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string) {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: any) {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Tenants
  async getTenant(id: string) {
    const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
    return result[0];
  }

  async getTenantBySlug(slug: string) {
    const result = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
    return result[0];
  }

  async getAllTenants() {
    return await db.select().from(tenants);
  }

  async createTenant(tenant: any) {
    const result = await db.insert(tenants).values(tenant).returning();
    
    // Initialize sync status for both sources
    await this.updateSyncStatus(result[0].id, "erpnext", { isActive: true, recordCount: 0 });
    await this.updateSyncStatus(result[0].id, "saleor", { isActive: true, recordCount: 0 });
    
    return result[0];
  }

  async updateTenant(id: string, updates: any) {
    const result = await db.update(tenants).set(updates).where(eq(tenants.id, id)).returning();
    return result[0];
  }

  // Integration Logs
  async createIntegrationLog(log: any) {
    const result = await db.insert(integrationLogs).values(log).returning();
    return result[0];
  }

  async getIntegrationLogsByTenant(tenantId: string) {
    return await db
      .select()
      .from(integrationLogs)
      .where(eq(integrationLogs.tenantId, tenantId))
      .orderBy(desc(integrationLogs.createdAt));
  }

  // Sync Status
  async getSyncStatus(tenantId: string, source: string) {
    const result = await db
      .select()
      .from(syncStatus)
      .where(and(eq(syncStatus.tenantId, tenantId), eq(syncStatus.source, source)))
      .limit(1);
    return result[0];
  }

  async updateSyncStatus(tenantId: string, source: string, updates: any) {
    const existing = await this.getSyncStatus(tenantId, source);
    
    if (existing) {
      const result = await db
        .update(syncStatus)
        .set(updates)
        .where(eq(syncStatus.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(syncStatus)
        .values({
          tenantId,
          source,
          ...updates
        })
        .returning();
      return result[0];
    }
  }
}
