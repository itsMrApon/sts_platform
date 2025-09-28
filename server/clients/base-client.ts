/**
 * Base client class with common functionality for all API clients
 */

import { storage } from '../../storage';
import { BaseConfig, ApiResponse, IntegrationLog } from './types/common';

export abstract class BaseClient {
  protected config: BaseConfig;
  protected tenantId: string;

  constructor(config: BaseConfig) {
    this.config = config;
    this.tenantId = config.tenantId;
  }

  /**
   * Log integration events for monitoring and debugging
   */
  protected async logEvent(
    action: string,
    status: 'success' | 'error' | 'pending',
    payload?: Record<string, any>,
    errorMessage?: string
  ): Promise<void> {
    try {
      await storage.createIntegrationLog({
        tenantId: this.tenantId,
        source: this.getSourceName(),
        action,
        status,
        errorMessage,
        payload: {
          ...payload,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      // Silently fail logging to prevent breaking the main flow
      console.warn('Failed to log integration event:', error);
    }
  }

  /**
   * Get the source name for logging (implemented by subclasses)
   */
  protected abstract getSourceName(): 'saleor' | 'erpnext' | 'n8n' | 'integration';

  /**
   * Make HTTP request with common error handling and logging
   */
  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    logAction?: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `HTTP ${response.status}: ${errorText}`;
        
        await this.logEvent(
          logAction || `${options.method || 'GET'} ${url}`,
          'error',
          {
            url,
            method: options.method || 'GET',
            status: response.status,
            duration,
            error: errorText
          },
          errorMessage
        );
        
        throw new Error(errorMessage);
      }

      const data: ApiResponse<T> = await response.json();
      const result = data.data || data.message || data;

      await this.logEvent(
        logAction || `${options.method || 'GET'} ${url}`,
        'success',
        {
          url,
          method: options.method || 'GET',
          status: response.status,
          duration
        }
      );

      return result as T;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await this.logEvent(
        logAction || `${options.method || 'GET'} ${url}`,
        'error',
        {
          url,
          method: options.method || 'GET',
          duration,
          error: errorMessage
        },
        errorMessage
      );
      
      throw error;
    }
  }

  /**
   * Handle webhook payloads with logging
   */
  async handleWebhook(payload: any, eventType?: string): Promise<void> {
    await this.logEvent(
      `webhook_received_${eventType || 'unknown'}`,
      'success',
      {
        eventType,
        payloadSize: JSON.stringify(payload).length,
        hasData: !!payload.data
      }
    );
  }

  /**
   * Update sync status for monitoring
   */
  async updateSyncStatus(recordCount: number): Promise<void> {
    try {
      await storage.updateSyncStatus(this.tenantId, this.getSourceName(), {
        lastSyncAt: new Date(),
        recordCount,
        isActive: true
      });
    } catch (error) {
      console.warn('Failed to update sync status:', error);
    }
  }
}
