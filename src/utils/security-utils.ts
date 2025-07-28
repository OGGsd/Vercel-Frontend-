/**
 * SIMPLIFIED Security utilities - minimal interference with React
 * Only basic URL hiding, no console overrides to prevent React issues
 */

/**
 * Simple URL sanitizer for network requests only
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return url;

  // Only hide our specific sensitive URL
  return url.replace('backend.axiestudio.se', '[BACKEND_HIDDEN]');
}

/**
 * DISABLED - No console security to prevent React interference
 */
export function setupSecureConsole() {
  // COMPLETELY DISABLED - Let React work normally
  console.debug('[SECURITY] Console security completely disabled for React compatibility');
}

/**
 * DISABLED - No network security to prevent React interference
 */
export function setupNetworkSecurity() {
  // COMPLETELY DISABLED - Let network requests work normally
  console.debug('[SECURITY] Network security completely disabled for React compatibility');
}

/**
 * DISABLED - No console disabling to prevent React interference
 */
export function disableConsoleInProduction() {
  // COMPLETELY DISABLED - Let React use console normally
  console.debug('[SECURITY] Console disabling completely disabled for React compatibility');
}

/**
 * SIMPLIFIED - Initialize minimal security (basically nothing)
 */
export function initializeSecurity() {
  // Only call the disabled functions for logging
  setupSecureConsole();
  setupNetworkSecurity();
  disableConsoleInProduction();

  console.debug('[SECURITY] All security measures disabled for React compatibility');
}
