/**
 * Shared runtime and compile-time constants for CampusPulse applications.
 */

export const APP_CONFIG = {
  name: 'CampusPulse',
  version: '0.1.0',
  description: 'University Opportunities Discovery Platform',
  defaultApiPort: 4000,
  defaultWebPort: 3000,
  apiPrefix: 'api',
} as const;

export const CORS_CONFIG = {
  allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
} as const;

export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Utility to safely read an environment variable with an optional fallback.
 */
export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value !== undefined && value !== '') {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  return '';
}

/**
 * Utility to read an integer environment variable.
 */
export function getEnvNumber(key: string, fallback: number): number {
  const value = process.env[key];
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Utility to read a boolean environment variable.
 */
export function getEnvBoolean(key: string, fallback: boolean): boolean {
  const value = process.env[key];
  if (!value) return fallback;
  return value.toLowerCase() === 'true' || value === '1';
}
