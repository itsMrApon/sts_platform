/**
 * Response utility functions
 */

/**
 * Send success response
 */
export function sendSuccess(res: any, data: any, message?: string) {
  res.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send error response
 */
export function sendError(res: any, status: number, message: string, error?: any) {
  res.status(status).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : error,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send validation error response
 */
export function sendValidationError(res: any, errors: any[]) {
  res.status(400).json({
    success: false,
    message: "Validation error",
    errors,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send not found response
 */
export function sendNotFound(res: any, resource: string) {
  res.status(404).json({
    success: false,
    message: `${resource} not found`,
    timestamp: new Date().toISOString()
  });
}
