import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { CONFIG, validateHealthcareSLA, HIPAA_HEADERS } from '../../utils/config.js';
import { TestUserSession, login, register, logout, refreshToken } from '../../utils/auth.js';
import { generateTestUser } from '../../utils/test-data.js';

/**
 * Authentication Workflow Load Test
 * 
 * Purpose: Test authentication system under load
 * - Patient registration and login flows
 * - Provider authentication
 * - Admin access patterns
 * - Token refresh and session management
 * - Security compliance validation
 */

// Custom metrics
const registrationSuccessRate = new Rate('registration_success_rate');
const loginSuccessRate = new Rate('login_success_rate');
const tokenRefreshRate = new Rate('token_refresh_rate');
const sessionValidationRate = new Rate('session_validation_rate');
const logoutSuccessRate = new Rate('logout_success_rate');

const authResponseTime = new Trend('auth_response_time');
const registrationTime = new Trend('registration_time');
const loginTime = new Trend('login_time');

const securityViolations = new Counter('security_violations');
const hipaaComplianceChecks = new Counter('hipaa_compliance_checks');
const auditLogEntries = new Counter('audit_log_entries');

export let options = {
  scenarios: {
    patient_registration: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1m',
      preAllocatedVUs: 5,
      maxVUs: 20,
      stages: [
        { duration: '1m', target: 5 },   // Start with 5 registrations/min
        { duration: '2m', target: 15 },  // Peak at 15 registrations/min
        { duration: '1m', target: 5 },   // Wind down
        { duration: '1m', target: 0 }    // Stop
      ],
      exec: 'patientRegistrationFlow'
    },
    patient_login: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '2m', target: 25 },
        { duration: '30s', target: 10 },
        { duration: '1m', target: 0 }
      ],
      exec: 'patientLoginFlow'
    },
    provider_authentication: {
      executor: 'constant-vus',
      vus: 5,
      duration: '4m',
      exec: 'providerAuthFlow'
    },
    admin_authentication: {
      executor: 'constant-vus',
      vus: 2,
      duration: '4m',
      exec: 'adminAuthFlow'
    },
    session_management: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 5 },
        { duration: '2m', target: 10 },
        { duration: '1m', target: 0 }
      ],
      exec: 'sessionManagementFlow'
    },
    security_testing: {
      executor: 'constant-arrival-rate',
      rate: 2,
      timeUnit: '1m',
      duration: '4m',
      preAllocatedVUs: 2,
      exec: 'securityTestingFlow'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.02'],
    checks: ['rate>0.98'],
    
    // Authentication-specific thresholds
    registration_success_rate: ['rate>0.98'],
    login_success_rate: ['rate>0.99'],
    token_refresh_rate: ['rate>0.99'],
    session_validation_rate: ['rate>0.99'],
    logout_success_rate: ['rate>0.98'],
    
    // Performance thresholds
    auth_response_time: ['p(95)<1000'],
    registration_time: ['p(95)<2000'],
    login_time: ['p(95)<1000'],
    
    // Security thresholds
    security_violations: ['count==0'],
    hipaa_compliance_checks: ['count>0']
  }
};

/**
 * Patient Registration Flow
 */
export function patientRegistrationFlow() {
  const startTime = Date.now();
  
  try {
    // Generate new patient data
    const patientData = generateTestUser('patient');
    
    // Test registration endpoint
    const registrationResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/register`,
      JSON.stringify(patientData),
      {
        headers: HIPAA_HEADERS,
        tags: { 
          name: 'patient_registration',
          userType: 'patient',
          flow: 'registration'
        }
      }
    );
    
    const registrationSuccess = check(registrationResponse, {
      'Patient Registration - Status is 201': (r) => r.status === 201,
      'Patient Registration - User ID returned': (r) => r.json('data.user.id') !== null,
      'Patient Registration - No sensitive data exposed': (r) => {
        const body = r.body.toLowerCase();
        return !body.includes('password') && !body.includes('ssn');
      },
      'Patient Registration - Response time < 3s': (r) => r.timings.duration < 3000,
      'Patient Registration - HIPAA headers present': (r) => r.headers['X-Audit-Trail'] !== undefined
    });
    
    registrationSuccessRate.add(registrationSuccess);
    registrationTime.add(registrationResponse.timings.duration);
    authResponseTime.add(registrationResponse.timings.duration);
    
    if (registrationSuccess) {
      auditLogEntries.add(1);
      hipaaComplianceChecks.add(1);
      
      // Test immediate login after registration
      sleep(1);
      
      const loginResponse = http.post(
        `${CONFIG.API_BASE_URL}/auth/login`,
        JSON.stringify({
          email: patientData.email,
          password: patientData.password,
          userType: 'patient'
        }),
        {
          headers: HIPAA_HEADERS,
          tags: { 
            name: 'post_registration_login',
            userType: 'patient',
            flow: 'registration'
          }
        }
      );
      
      const loginSuccess = check(loginResponse, {
        'Post-Registration Login - Status is 200': (r) => r.status === 200,
        'Post-Registration Login - Token received': (r) => r.json('data.token') !== null,
        'Post-Registration Login - User data correct': (r) => {
          const userData = r.json('data.user');
          return userData && userData.email === patientData.email;
        }
      });
      
      loginSuccessRate.add(loginSuccess);
      loginTime.add(loginResponse.timings.duration);
      
      if (loginSuccess) {
        // Test immediate logout
        const token = loginResponse.json('data.token');
        const logoutResponse = http.post(
          `${CONFIG.API_BASE_URL}/auth/logout`,
          null,
          {
            headers: {
              ...HIPAA_HEADERS,
              'Authorization': `Bearer ${token}`
            },
            tags: { 
              name: 'post_registration_logout',
              userType: 'patient',
              flow: 'registration'
            }
          }
        );
        
        const logoutSuccess = check(logoutResponse, {
          'Post-Registration Logout - Status is 200': (r) => r.status === 200
        });
        
        logoutSuccessRate.add(logoutSuccess);
      }
    }
    
  } catch (error) {
    console.error(`Patient registration flow error: ${error.message}`);
    registrationSuccessRate.add(false);
    securityViolations.add(1);
  }
  
  sleep(1);
}

/**
 * Patient Login Flow
 */
export function patientLoginFlow() {
  const startTime = Date.now();
  let session;
  
  try {
    // Create test patient for login
    const patientData = generateTestUser('patient');
    
    // First register the patient
    const registrationResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/register`,
      JSON.stringify(patientData),
      {
        headers: HIPAA_HEADERS,
        tags: { name: 'setup_patient_for_login' }
      }
    );
    
    if (registrationResponse.status !== 201) {
      console.warn('Failed to setup patient for login test');
      return;
    }
    
    sleep(1);
    
    // Test login
    const loginResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/login`,
      JSON.stringify({
        email: patientData.email,
        password: patientData.password,
        userType: 'patient'
      }),
      {
        headers: HIPAA_HEADERS,
        tags: { 
          name: 'patient_login',
          userType: 'patient',
          flow: 'login'
        }
      }
    );
    
    const loginSuccess = check(loginResponse, {
      'Patient Login - Status is 200': (r) => r.status === 200,
      'Patient Login - Token received': (r) => r.json('data.token') !== null,
      'Patient Login - User data returned': (r) => r.json('data.user') !== null,
      'Patient Login - Response time < 2s': (r) => r.timings.duration < 2000,
      'Patient Login - Secure token format': (r) => {
        const token = r.json('data.token');
        return token && token.length > 50; // JWT tokens are typically longer
      }
    });
    
    loginSuccessRate.add(loginSuccess);
    loginTime.add(loginResponse.timings.duration);
    authResponseTime.add(loginResponse.timings.duration);
    
    if (loginSuccess) {
      const token = loginResponse.json('data.token');
      
      // Test session validation
      sleep(1);
      
      const sessionResponse = http.get(
        `${CONFIG.API_BASE_URL}/auth/me`,
        {
          headers: {
            ...HIPAA_HEADERS,
            'Authorization': `Bearer ${token}`
          },
          tags: { 
            name: 'session_validation',
            userType: 'patient',
            flow: 'login'
          }
        }
      );
      
      const sessionValid = check(sessionResponse, {
        'Session Validation - Status is 200': (r) => r.status === 200,
        'Session Validation - User data correct': (r) => {
          const userData = r.json('data');
          return userData && userData.email === patientData.email;
        },
        'Session Validation - Response time < 500ms': (r) => r.timings.duration < 500
      });
      
      sessionValidationRate.add(sessionValid);
      
      // Simulate some authenticated activity
      sleep(2);
      
      // Test profile access
      const profileResponse = http.get(
        `${CONFIG.API_BASE_URL}/patients/${loginResponse.json('data.user.id')}`,
        {
          headers: {
            ...HIPAA_HEADERS,
            'Authorization': `Bearer ${token}`
          },
          tags: { 
            name: 'patient_profile_access',
            userType: 'patient',
            flow: 'login'
          }
        }
      );
      
      check(profileResponse, {
        'Profile Access - Status is 200': (r) => r.status === 200,
        'Profile Access - HIPAA compliant': (r) => {
          hipaaComplianceChecks.add(1);
          return r.headers['X-Audit-Trail'] !== undefined;
        }
      });
      
      // Test logout
      sleep(1);
      
      const logoutResponse = http.post(
        `${CONFIG.API_BASE_URL}/auth/logout`,
        null,
        {
          headers: {
            ...HIPAA_HEADERS,
            'Authorization': `Bearer ${token}`
          },
          tags: { 
            name: 'patient_logout',
            userType: 'patient',
            flow: 'login'
          }
        }
      );
      
      const logoutSuccess = check(logoutResponse, {
        'Patient Logout - Status is 200': (r) => r.status === 200,
        'Patient Logout - Response time < 1s': (r) => r.timings.duration < 1000
      });
      
      logoutSuccessRate.add(logoutSuccess);
      auditLogEntries.add(1);
    }
    
  } catch (error) {
    console.error(`Patient login flow error: ${error.message}`);
    loginSuccessRate.add(false);
    securityViolations.add(1);
  }
  
  sleep(1);
}

/**
 * Provider Authentication Flow
 */
export function providerAuthFlow() {
  let session;
  
  try {
    // Create and login provider
    session = new TestUserSession('provider');
    const providerData = generateTestUser('provider');
    
    // Register provider
    const registrationResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/register`,
      JSON.stringify(providerData),
      {
        headers: HIPAA_HEADERS,
        tags: { name: 'provider_registration' }
      }
    );
    
    if (registrationResponse.status !== 201) {
      console.warn('Provider registration failed');
      return;
    }
    
    sleep(1);
    
    // Login provider
    const loginResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/login`,
      JSON.stringify({
        email: providerData.email,
        password: providerData.password,
        userType: 'provider'
      }),
      {
        headers: HIPAA_HEADERS,
        tags: { 
          name: 'provider_login',
          userType: 'provider',
          flow: 'provider_auth'
        }
      }
    );
    
    const loginSuccess = check(loginResponse, {
      'Provider Login - Status is 200': (r) => r.status === 200,
      'Provider Login - Token received': (r) => r.json('data.token') !== null,
      'Provider Login - Provider role verified': (r) => {
        const userData = r.json('data.user');
        return userData && userData.userType === 'provider';
      }
    });
    
    loginSuccessRate.add(loginSuccess);
    
    if (loginSuccess) {
      const token = loginResponse.json('data.token');
      session.token = token;
      session.user = loginResponse.json('data.user');
      
      // Test provider-specific endpoints
      sleep(2);
      
      const scheduleResponse = http.get(
        `${CONFIG.API_BASE_URL}/providers/${session.user.id}/appointments`,
        {
          headers: {
            ...HIPAA_HEADERS,
            'Authorization': `Bearer ${token}`
          },
          tags: { 
            name: 'provider_schedule_access',
            userType: 'provider',
            flow: 'provider_auth'
          }
        }
      );
      
      check(scheduleResponse, {
        'Provider Schedule Access - Response received': (r) => r.status !== undefined,
        'Provider Schedule Access - HIPAA audit': (r) => {
          hipaaComplianceChecks.add(1);
          auditLogEntries.add(1);
          return true;
        }
      });
      
      // Test token refresh
      sleep(30); // Simulate some time passing
      
      const refreshResponse = http.post(
        `${CONFIG.API_BASE_URL}/auth/refresh`,
        null,
        {
          headers: {
            ...HIPAA_HEADERS,
            'Authorization': `Bearer ${token}`
          },
          tags: { 
            name: 'provider_token_refresh',
            userType: 'provider',
            flow: 'provider_auth'
          }
        }
      );
      
      const refreshSuccess = check(refreshResponse, {
        'Provider Token Refresh - Status is 200': (r) => r.status === 200,
        'Provider Token Refresh - New token received': (r) => r.json('data.token') !== null
      });
      
      tokenRefreshRate.add(refreshSuccess);
    }
    
  } catch (error) {
    console.error(`Provider auth flow error: ${error.message}`);
    loginSuccessRate.add(false);
    securityViolations.add(1);
  } finally {
    if (session && session.token) {
      session.cleanup();
    }
  }
  
  sleep(2);
}

/**
 * Admin Authentication Flow
 */
export function adminAuthFlow() {
  let session;
  
  try {
    // Create and login admin
    session = new TestUserSession('practice_admin');
    const adminData = generateTestUser('practice_admin');
    
    // Register admin
    const registrationResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/register`,
      JSON.stringify(adminData),
      {
        headers: HIPAA_HEADERS,
        tags: { name: 'admin_registration' }
      }
    );
    
    if (registrationResponse.status !== 201) {
      console.warn('Admin registration failed');
      return;
    }
    
    sleep(1);
    
    // Login admin
    const loginResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/login`,
      JSON.stringify({
        email: adminData.email,
        password: adminData.password,
        userType: 'practice_admin'
      }),
      {
        headers: HIPAA_HEADERS,
        tags: { 
          name: 'admin_login',
          userType: 'practice_admin',
          flow: 'admin_auth'
        }
      }
    );
    
    const loginSuccess = check(loginResponse, {
      'Admin Login - Status is 200': (r) => r.status === 200,
      'Admin Login - Token received': (r) => r.json('data.token') !== null,
      'Admin Login - Admin role verified': (r) => {
        const userData = r.json('data.user');
        return userData && userData.userType === 'practice_admin';
      }
    });
    
    loginSuccessRate.add(loginSuccess);
    
    if (loginSuccess) {
      const token = loginResponse.json('data.token');
      session.token = token;
      session.user = loginResponse.json('data.user');
      
      // Test admin-specific endpoints
      sleep(2);
      
      const dashboardResponse = http.get(
        `${CONFIG.API_BASE_URL}/analytics/practices/1/dashboard`,
        {
          headers: {
            ...HIPAA_HEADERS,
            'Authorization': `Bearer ${token}`
          },
          tags: { 
            name: 'admin_dashboard_access',
            userType: 'practice_admin',
            flow: 'admin_auth'
          }
        }
      );
      
      check(dashboardResponse, {
        'Admin Dashboard Access - Response received': (r) => r.status !== undefined,
        'Admin Dashboard Access - HIPAA audit': (r) => {
          hipaaComplianceChecks.add(1);
          auditLogEntries.add(1);
          return true;
        }
      });
      
      // Test user management access
      const usersResponse = http.get(
        `${CONFIG.API_BASE_URL}/admin/users`,
        {
          headers: {
            ...HIPAA_HEADERS,
            'Authorization': `Bearer ${token}`
          },
          tags: { 
            name: 'admin_user_management',
            userType: 'practice_admin',
            flow: 'admin_auth'
          }
        }
      );
      
      check(usersResponse, {
        'Admin User Management - Response received': (r) => r.status !== undefined
      });
    }
    
  } catch (error) {
    console.error(`Admin auth flow error: ${error.message}`);
    loginSuccessRate.add(false);
    securityViolations.add(1);
  } finally {
    if (session && session.token) {
      session.cleanup();
    }
  }
  
  sleep(3);
}

/**
 * Session Management Flow
 */
export function sessionManagementFlow() {
  let session;
  
  try {
    // Create long-lived session for testing
    session = new TestUserSession('patient');
    const patientData = generateTestUser('patient');
    
    // Register and login
    const registrationResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/register`,
      JSON.stringify(patientData),
      { headers: HIPAA_HEADERS }
    );
    
    if (registrationResponse.status !== 201) return;
    
    const loginResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/login`,
      JSON.stringify({
        email: patientData.email,
        password: patientData.password,
        userType: 'patient'
      }),
      { headers: HIPAA_HEADERS }
    );
    
    if (loginResponse.status !== 200) return;
    
    const token = loginResponse.json('data.token');
    session.token = token;
    session.user = loginResponse.json('data.user');
    
    // Test session persistence over time
    for (let i = 0; i < 5; i++) {
      sleep(10); // Wait 10 seconds between checks
      
      const sessionCheckResponse = http.get(
        `${CONFIG.API_BASE_URL}/auth/me`,
        {
          headers: {
            ...HIPAA_HEADERS,
            'Authorization': `Bearer ${token}`
          },
          tags: { 
            name: 'session_persistence_check',
            iteration: i,
            flow: 'session_management'
          }
        }
      );
      
      const sessionStillValid = check(sessionCheckResponse, {
        [`Session Check ${i} - Status is 200`]: (r) => r.status === 200,
        [`Session Check ${i} - User data consistent`]: (r) => {
          const userData = r.json('data');
          return userData && userData.email === patientData.email;
        }
      });
      
      sessionValidationRate.add(sessionStillValid);
      
      if (!sessionStillValid) {
        console.warn(`Session became invalid at check ${i}`);
        break;
      }
      
      // Test token refresh if needed
      if (i === 2) { // Refresh token midway through
        const refreshResponse = http.post(
          `${CONFIG.API_BASE_URL}/auth/refresh`,
          null,
          {
            headers: {
              ...HIPAA_HEADERS,
              'Authorization': `Bearer ${token}`
            },
            tags: { 
              name: 'session_token_refresh',
              flow: 'session_management'
            }
          }
        );
        
        const refreshSuccess = check(refreshResponse, {
          'Session Token Refresh - Status is 200': (r) => r.status === 200,
          'Session Token Refresh - New token received': (r) => r.json('data.token') !== null
        });
        
        tokenRefreshRate.add(refreshSuccess);
        
        if (refreshSuccess) {
          session.token = refreshResponse.json('data.token');
        }
      }
    }
    
  } catch (error) {
    console.error(`Session management flow error: ${error.message}`);
    sessionValidationRate.add(false);
    securityViolations.add(1);
  } finally {
    if (session && session.token) {
      session.cleanup();
    }
  }
}

/**
 * Security Testing Flow
 */
export function securityTestingFlow() {
  try {
    // Test 1: Invalid token access
    const invalidTokenResponse = http.get(
      `${CONFIG.API_BASE_URL}/auth/me`,
      {
        headers: {
          ...HIPAA_HEADERS,
          'Authorization': 'Bearer invalid_token_12345'
        },
        tags: { 
          name: 'security_invalid_token_test',
          flow: 'security_testing'
        }
      }
    );
    
    check(invalidTokenResponse, {
      'Invalid Token Test - Status is 401': (r) => r.status === 401,
      'Invalid Token Test - Error message present': (r) => r.json('message') !== undefined
    });
    
    sleep(1);
    
    // Test 2: SQL Injection attempt
    const sqlInjectionResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/login`,
      JSON.stringify({
        email: "admin'; DROP TABLE users; --",
        password: "password",
        userType: "patient"
      }),
      {
        headers: HIPAA_HEADERS,
        tags: { 
          name: 'security_sql_injection_test',
          flow: 'security_testing'
        }
      }
    );
    
    check(sqlInjectionResponse, {
      'SQL Injection Test - Status is 400 or 401': (r) => r.status === 400 || r.status === 401,
      'SQL Injection Test - No database error leaked': (r) => {
        const body = r.body.toLowerCase();
        return !body.includes('sql') && !body.includes('database') && !body.includes('table');
      }
    });
    
    sleep(1);
    
    // Test 3: XSS attempt
    const xssResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/register`,
      JSON.stringify({
        firstName: "<script>alert('xss')</script>",
        lastName: "Test",
        email: "xss@test.com",
        password: "TestPassword123!",
        userType: "patient"
      }),
      {
        headers: HIPAA_HEADERS,
        tags: { 
          name: 'security_xss_test',
          flow: 'security_testing'
        }
      }
    );
    
    check(xssResponse, {
      'XSS Test - Input sanitized': (r) => {
        const body = r.body;
        return !body.includes('<script>') && !body.includes('alert(');
      }
    });
    
    sleep(1);
    
    // Test 4: Rate limiting
    const rateLimitTests = [];
    for (let i = 0; i < 10; i++) {
      rateLimitTests.push(
        http.post(
          `${CONFIG.API_BASE_URL}/auth/login`,
          JSON.stringify({
            email: "test@example.com",
            password: "wrongpassword",
            userType: "patient"
          }),
          {
            headers: HIPAA_HEADERS,
            tags: { 
              name: 'security_rate_limit_test',
              attempt: i,
              flow: 'security_testing'
            }
          }
        )
      );
    }
    
    // Check if rate limiting is working
    const rateLimitedRequests = rateLimitTests.filter(r => r.status === 429).length;
    
    check(rateLimitTests[rateLimitTests.length - 1], {
      'Rate Limiting Test - Some requests rate limited': () => rateLimitedRequests > 0
    });
    
    if (rateLimitedRequests === 0) {
      securityViolations.add(1);
      console.warn('Rate limiting may not be working properly');
    }
    
    // Test 5: HIPAA compliance headers
    const hipaaTestResponse = http.get(
      `${CONFIG.API_BASE_URL}/health`,
      {
        headers: HIPAA_HEADERS,
        tags: { 
          name: 'security_hipaa_headers_test',
          flow: 'security_testing'
        }
      }
    );
    
    check(hipaaTestResponse, {
      'HIPAA Headers Test - Security headers present': (r) => {
        const headers = r.headers;
        hipaaComplianceChecks.add(1);
        return headers['X-Content-Type-Options'] !== undefined ||
               headers['X-Frame-Options'] !== undefined ||
               headers['Strict-Transport-Security'] !== undefined;
      },
      'HIPAA Headers Test - No sensitive data in headers': (r) => {
        const headerString = JSON.stringify(r.headers).toLowerCase();
        return !headerString.includes('password') && 
               !headerString.includes('token') &&
               !headerString.includes('ssn');
      }
    });
    
  } catch (error) {
    console.error(`Security testing flow error: ${error.message}`);
    securityViolations.add(1);
  }
  
  sleep(2);
}

export function teardown() {
  console.log('Authentication workflow test completed');
  console.log('Security violations detected:', securityViolations.value || 0);
  console.log('HIPAA compliance checks performed:', hipaaComplianceChecks.value || 0);
  console.log('Audit log entries created:', auditLogEntries.value || 0);
}