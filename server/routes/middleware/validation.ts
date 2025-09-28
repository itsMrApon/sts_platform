/**
 * Validation middleware for route handlers
 */

import { z } from 'zod';

/**
 * Validate request body against a Zod schema
 */
export function validateBody(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Validation failed" });
    }
  };
}

/**
 * Validate required fields in request body
 */
export function validateRequired(fields: string[]) {
  return (req: any, res: any, next: any) => {
    const missing = fields.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missing
      });
    }
    
    next();
  };
}

// Common validation schemas
export const webhookSchemas = {
  createSaleorWebhook: z.object({
    targetUrl: z.string().url(),
    secretKey: z.string().optional()
  }),
  
  updateSaleorWebhook: z.object({
    name: z.string(),
    targetUrl: z.string().url(),
    secretKey: z.string().optional()
  }),
  
  createERPNextWebhook: z.object({
    doctype: z.string(),
    event: z.string().optional(),
    targetUrl: z.string().url(),
    name: z.string().optional(),
    isEnabled: z.boolean().optional()
  }),
  
  n8nAutomation: z.object({
    action: z.enum(['sync-products', 'sync-orders', 'sync-customers', 'get-status']),
    data: z.any().optional()
  })
};
