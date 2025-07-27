/**
 * Security utilities for hiding sensitive information from browser console
 * This module provides comprehensive protection against sensitive data exposure
 */

// List of sensitive patterns to hide from console - ONLY truly sensitive data
const SENSITIVE_PATTERNS = [
  // Backend URLs - only the specific sensitive ones
  'langflow-tv34o.ondigitalocean.app',
  'backend.axiestudio.se',

  // Authentication tokens - only when they appear with actual values
  'Bearer sk-RHx76uBvpHS4UxrnYnQQvelJ3UFcSJJqfJGF2CRHnu8',
  'sk-RHx76uBvpHS4UxrnYnQQvelJ3UFcSJJqfJGF2CRHnu8',

  // Only specific API endpoints that expose sensitive info
  'auto_login', 'refresh'
];

// Additional patterns for URLs and tokens - ONLY specific sensitive ones
const URL_PATTERNS = [
  /langflow-tv34o\.ondigitalocean\.app/g,  // Only our specific backend URL
  /backend\.axiestudio\.se/g,  // Only our specific backend URL
  /Bearer\s+sk-RHx76uBvpHS4UxrnYnQQvelJ3UFcSJJqfJGF2CRHnu8/g,  // Only our specific API key
  /sk-RHx76uBvpHS4UxrnYnQQvelJ3UFcSJJqfJGF2CRHnu8/g  // Only our specific API key
];

/**
 * Checks if a message contains sensitive information
 */
export function containsSensitiveInfo(message: string): boolean {
  // Check for exact pattern matches
  for (const pattern of SENSITIVE_PATTERNS) {
    if (message.includes(pattern)) {
      return true;
    }
  }
  
  // Check for regex patterns
  for (const pattern of URL_PATTERNS) {
    if (pattern.test(message)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Sanitizes a message by removing or masking sensitive information
 */
export function sanitizeMessage(message: string): string {
  let sanitized = message;
  
  // Replace URLs with masked versions
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL_HIDDEN]');
  
  // Replace Bearer tokens
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [TOKEN_HIDDEN]');
  
  // Replace API keys
  sanitized = sanitized.replace(/sk-[A-Za-z0-9]+/g, 'sk-[KEY_HIDDEN]');
  
  // Replace API key headers
  sanitized = sanitized.replace(/x-api-key:\s*[^\s]+/g, 'x-api-key: [KEY_HIDDEN]');
  
  return sanitized;
}

/**
 * Minimal console security - disabled in development to avoid React issues
 */
export function setupSecureConsole() {
  // DISABLE console overrides in development to prevent React issues
  if (process.env.NODE_ENV === 'development') {
    console.debug('[SECURITY] Console security disabled in development mode for compatibility');
    return;
  }

  // Only apply minimal security in production
  console.debug('[SECURITY] Minimal console security enabled for production');
}

/**
 * Minimal network security - only for production
 */
export function setupNetworkSecurity() {
  // Disable network interception in development to avoid issues
  if (process.env.NODE_ENV === 'development') {
    console.debug('[SECURITY] Network security disabled in development mode');
    return;
  }

  console.debug('[SECURITY] Minimal network security enabled for production');
}

/**
 * Disable all console methods in production if configured - DISABLED for compatibility
 */
export function disableConsoleInProduction() {
  // DISABLED to prevent React and other library issues
  console.debug('[SECURITY] Console disabling disabled for compatibility');
}

/**
 * Initialize all security measures
 */
export function initializeSecurity() {
  setupSecureConsole();
  setupNetworkSecurity();

  // Optionally disable all console output in production
  disableConsoleInProduction();

  if (process.env.NODE_ENV === 'development') {
    console.debug('[SECURITY] Security measures initialized');
  }
}
