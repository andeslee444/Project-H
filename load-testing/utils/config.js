import { check } from 'k6';

/**
 * Base configuration for K6 tests
 * Contains environment variables and common settings
 */
export const CONFIG = {
  // API Configuration
  API_BASE_URL: __ENV.K6_API_BASE_URL || 'http://localhost:3000/api/v1',
  FRONTEND_URL: __ENV.K6_FRONTEND_URL || 'http://localhost:5173',
  
  // Database Configuration
  DB_HOST: __ENV.K6_DB_HOST || 'localhost',
  DB_PORT: __ENV.K6_DB_PORT || '5432',
  DB_NAME: __ENV.K6_DB_NAME || 'mental_health_system',
  
  // Load Testing Configuration
  VIRTUAL_USERS: parseInt(__ENV.K6_VIRTUAL_USERS) || 50,
  DURATION: __ENV.K6_DURATION || '5m',
  RAMP_UP: __ENV.K6_RAMP_UP || '30s',
  RAMP_DOWN: __ENV.K6_RAMP_DOWN || '30s',
  
  // Performance Thresholds (Healthcare SLAs)
  THRESHOLDS: {
    PAGE_LOAD_TIME: 2000,        // Page load < 2 seconds
    API_RESPONSE_TIME: 500,      // API response < 500ms
    DB_QUERY_TIME: 200,          // Database queries < 200ms
    NOTIFICATION_TIME: 100,      // Real-time notifications < 100ms
    ERROR_RATE: 0.01,            // Error rate < 1%
    AVAILABILITY: 0.99           // 99% availability
  },
  
  // Monitoring Configuration
  INFLUXDB_URL: __ENV.K6_INFLUXDB_URL || 'http://localhost:8086',
  GRAFANA_URL: __ENV.K6_GRAFANA_URL || 'http://localhost:3000',
  
  // Healthcare-specific settings
  HIPAA_COMPLIANT: true,
  USE_SYNTHETIC_DATA: true,
  AUDIT_TRAIL_ENABLED: true,
  
  // Rate limiting settings
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 100,
    REQUESTS_PER_HOUR: 6000
  }
};

/**
 * Healthcare-specific performance SLAs
 */
export const HEALTHCARE_SLAS = {
  // Critical workflows (emergency scenarios)
  CRITICAL: {
    RESPONSE_TIME: 200,
    AVAILABILITY: 0.999,
    ERROR_RATE: 0.001
  },
  
  // Standard workflows (normal operations)
  STANDARD: {
    RESPONSE_TIME: 500,
    AVAILABILITY: 0.99,
    ERROR_RATE: 0.01
  },
  
  // Non-critical workflows (reports, analytics)
  NON_CRITICAL: {
    RESPONSE_TIME: 2000,
    AVAILABILITY: 0.95,
    ERROR_RATE: 0.05
  }
};

/**
 * Test environment configuration
 */
export const ENVIRONMENTS = {
  LOCAL: {
    API_URL: 'http://localhost:3000/api/v1',
    FRONTEND_URL: 'http://localhost:5173'
  },
  STAGING: {
    API_URL: 'https://staging-api.project-h.com/api/v1',
    FRONTEND_URL: 'https://staging.project-h.com'
  },
  PRODUCTION: {
    API_URL: 'https://api.project-h.com/api/v1',
    FRONTEND_URL: 'https://app.project-h.com'
  }
};

/**
 * Get current environment configuration
 */
export function getEnvironment() {
  const env = __ENV.K6_ENVIRONMENT || 'LOCAL';
  return ENVIRONMENTS[env] || ENVIRONMENTS.LOCAL;
}

/**
 * Common HTTP headers for requests
 */
export const HTTP_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'K6-LoadTest/1.0',
  'X-Requested-With': 'K6LoadTest'
};

/**
 * Authentication headers
 */
export function getAuthHeaders(token) {
  return {
    ...HTTP_HEADERS,
    'Authorization': `Bearer ${token}`
  };
}

/**
 * HIPAA compliance headers
 */
export const HIPAA_HEADERS = {
  ...HTTP_HEADERS,
  'X-HIPAA-Audit': 'true',
  'X-Test-Environment': 'true',
  'X-Synthetic-Data': 'true'
};

/**
 * Validate response against healthcare SLAs
 */
export function validateHealthcareSLA(response, slaType = 'STANDARD') {
  const sla = HEALTHCARE_SLAS[slaType];
  
  return check(response, {
    [`${slaType} SLA - Response time < ${sla.RESPONSE_TIME}ms`]: (r) => r.timings.duration < sla.RESPONSE_TIME,
    [`${slaType} SLA - Status is 2xx`]: (r) => r.status >= 200 && r.status < 300,
    [`${slaType} SLA - Has response body`]: (r) => r.body && r.body.length > 0
  });
}

/**
 * Sleep with healthcare-appropriate delays
 */
export function healthcareSleep(min = 1, max = 3) {
  const delay = Math.random() * (max - min) + min;
  return delay;
}

/**
 * Generate test timestamps
 */
export function generateTestTimestamps() {
  const now = new Date();
  return {
    current: now.toISOString(),
    future: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // +1 day
    past: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()     // -1 day
  };
}

/**
 * Healthcare-specific error codes
 */
export const HEALTHCARE_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Validate HIPAA compliance in response
 */
export function validateHIPAACompliance(response) {
  return check(response, {
    'HIPAA - No PHI in response': (r) => {
      const body = r.body.toLowerCase();
      // Check for common PHI patterns (basic validation)
      return !body.includes('ssn') && 
             !body.includes('social security') &&
             !body.match(/\d{3}-\d{2}-\d{4}/) && // SSN pattern
             !body.match(/\d{16}/);              // Credit card pattern
    },
    'HIPAA - Audit headers present': (r) => r.headers['X-Audit-Trail'] !== undefined,
    'HIPAA - Encrypted response': (r) => r.url.startsWith('https://') || r.url.startsWith('http://localhost')
  });
}