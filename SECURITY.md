# Axie Studio Frontend Security Documentation

## Overview

This document outlines the comprehensive security measures implemented in the Axie Studio frontend to prevent sensitive information from being exposed in the browser console and to protect against data leakage.

## Security Features Implemented

### 1. Console Security (`src/utils/security-utils.ts`)

#### Sensitive Pattern Detection
- **Backend URLs**: Automatically detects and hides references to `langflow-tv34o.ondigitalocean.app`, `backend.axiestudio.se`, and `axiestudio.se`
- **HTTP Status Codes**: Suppresses error codes like 401, 403, 400, 500, 502, 503 that might expose system information
- **Authentication Data**: Hides Bearer tokens, API keys (sk-*), and x-api-key headers
- **API Endpoints**: Conceals sensitive endpoints like `/api/v1/`, `/api/v2/`, `auto_login`, `refresh`, `login`, `logout`

#### Console Method Overrides
- **console.error**: Filtered to prevent sensitive error messages
- **console.warn**: Filtered to prevent sensitive warnings
- **console.log**: Filtered to prevent accidental sensitive data logging
- **console.info**: Filtered to prevent information leakage

#### Network Security
- **Fetch Interception**: Wraps native fetch to sanitize error messages
- **Promise Rejection Handling**: Prevents unhandled rejections from exposing sensitive data
- **Global Error Handling**: Catches and sanitizes global JavaScript errors

### 2. Production Environment Security

#### Environment Configuration (`.env.production`)
```env
GENERATE_SOURCEMAP=false
REACT_APP_DISABLE_CONSOLE_LOGS=true
REACT_APP_SECURITY_MODE=strict
REACT_APP_BUILD_MODE=production
INLINE_RUNTIME_CHUNK=false
REACT_APP_DEV_TOOLS=false
REACT_APP_DEBUG_MODE=false
```

#### Vite Build Configuration (`vite.config.mts`)
- **Source Maps**: Disabled in production builds
- **Console Removal**: All console statements stripped from production builds
- **Code Minification**: Enhanced with Terser for better obfuscation
- **Debug Removal**: All debugger statements removed

### 3. API Code Generation Security

#### JavaScript API Code (`src/modals/apiModal/utils/get-js-api-code.tsx`)
- **Sanitized Logging**: Generated API code uses safe logging practices
- **Error Handling**: Generic error messages instead of detailed error exposure
- **File Path Hiding**: Removes sensitive file path information from generated code

### 4. Development vs Production Behavior

#### Development Mode
- Sensitive information is logged to `console.debug` with `[SECURITY]` prefix
- Detailed error information available for debugging
- Source maps enabled for easier debugging

#### Production Mode
- All console output completely disabled (optional)
- No sensitive information logged anywhere
- Minified and obfuscated code
- No source maps generated

## Implementation Details

### Security Initialization

The security system is initialized in `src/index.tsx`:

```typescript
import { initializeSecurity } from "./utils/security-utils";
initializeSecurity();
```

This sets up all security measures before any other code runs.

### Pattern Matching

The system uses both exact string matching and regex patterns:

```typescript
// Exact patterns
const SENSITIVE_PATTERNS = [
  'langflow-tv34o.ondigitalocean.app',
  'backend.axiestudio.se',
  // ... more patterns
];

// Regex patterns
const URL_PATTERNS = [
  /https?:\/\/[^\s]+/g,  // Any HTTP/HTTPS URLs
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g,  // Bearer tokens
  // ... more patterns
];
```

### Message Sanitization

When sensitive information is detected, it's replaced with safe placeholders:

```typescript
sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL_HIDDEN]');
sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [TOKEN_HIDDEN]');
```

## Testing Security Measures

### Manual Testing
1. Open browser developer tools
2. Navigate through the application
3. Trigger API calls and errors
4. Verify no sensitive URLs or tokens appear in console

### Automated Testing
The security measures are tested as part of the application's test suite to ensure they work correctly.

## Best Practices for Developers

### Do's
- Use the provided security utilities for any new logging
- Test in production mode before deployment
- Review generated API code for sensitive information
- Use environment variables for configuration

### Don'ts
- Don't bypass the security system with direct console calls
- Don't log sensitive information in development
- Don't include sensitive data in error messages
- Don't expose internal API endpoints in client-side code

## Monitoring and Maintenance

### Regular Security Audits
- Review console output in production builds
- Check for new sensitive patterns that need filtering
- Update security patterns as the application evolves
- Monitor for security vulnerabilities in dependencies

### Updates and Patches
- Keep security utilities updated with new threat patterns
- Review and update environment configurations
- Test security measures after major updates
- Document any changes to security implementations

## Compliance and Standards

This security implementation helps meet various compliance requirements:
- **Data Protection**: Prevents accidental exposure of sensitive data
- **Security Best Practices**: Follows industry standards for frontend security
- **Privacy Protection**: Ensures user data and system information remain private
- **Audit Trail**: Provides clear documentation of security measures

## Support and Contact

For security-related questions or to report potential vulnerabilities, please contact the development team through appropriate channels.

---

**Note**: This security system is designed to be comprehensive but should be part of a broader security strategy that includes backend security, network security, and proper access controls.
