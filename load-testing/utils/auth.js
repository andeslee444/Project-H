import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG, HTTP_HEADERS, validateHealthcareSLA } from './config.js';
import { generateTestUser } from './test-data.js';

/**
 * Authentication utilities for load testing
 * Handles login, logout, and token management
 */

/**
 * Login a user and return authentication token
 */
export function login(email, password, userType = 'patient') {
  const loginData = {
    email: email,
    password: password,
    userType: userType
  };

  const response = http.post(
    `${CONFIG.API_BASE_URL}/auth/login`,
    JSON.stringify(loginData),
    {
      headers: HTTP_HEADERS,
      tags: { name: 'auth_login', userType: userType }
    }
  );

  const loginSuccess = check(response, {
    'Login - Status is 200': (r) => r.status === 200,
    'Login - Has token': (r) => r.json('data.token') !== null,
    'Login - Response time < 1s': (r) => r.timings.duration < 1000
  });

  validateHealthcareSLA(response, 'CRITICAL');

  if (loginSuccess && response.status === 200) {
    const responseData = response.json();
    return {
      token: responseData.data.token,
      user: responseData.data.user,
      expiresAt: responseData.data.expiresAt
    };
  }

  console.error(`Login failed for ${email}: ${response.status} - ${response.body}`);
  return null;
}

/**
 * Register a new user account
 */
export function register(userData) {
  const response = http.post(
    `${CONFIG.API_BASE_URL}/auth/register`,
    JSON.stringify(userData),
    {
      headers: HTTP_HEADERS,
      tags: { name: 'auth_register', userType: userData.userType }
    }
  );

  const registerSuccess = check(response, {
    'Register - Status is 201': (r) => r.status === 201,
    'Register - Has user data': (r) => r.json('data.user') !== null,
    'Register - Response time < 2s': (r) => r.timings.duration < 2000
  });

  validateHealthcareSLA(response, 'STANDARD');

  if (registerSuccess && response.status === 201) {
    return response.json().data;
  }

  console.error(`Registration failed: ${response.status} - ${response.body}`);
  return null;
}

/**
 * Logout user and invalidate token
 */
export function logout(token) {
  const response = http.post(
    `${CONFIG.API_BASE_URL}/auth/logout`,
    null,
    {
      headers: {
        ...HTTP_HEADERS,
        'Authorization': `Bearer ${token}`
      },
      tags: { name: 'auth_logout' }
    }
  );

  check(response, {
    'Logout - Status is 200': (r) => r.status === 200,
    'Logout - Response time < 500ms': (r) => r.timings.duration < 500
  });

  return response.status === 200;
}

/**
 * Refresh authentication token
 */
export function refreshToken(token) {
  const response = http.post(
    `${CONFIG.API_BASE_URL}/auth/refresh`,
    null,
    {
      headers: {
        ...HTTP_HEADERS,
        'Authorization': `Bearer ${token}`
      },
      tags: { name: 'auth_refresh' }
    }
  );

  const refreshSuccess = check(response, {
    'Token Refresh - Status is 200': (r) => r.status === 200,
    'Token Refresh - Has new token': (r) => r.json('data.token') !== null,
    'Token Refresh - Response time < 500ms': (r) => r.timings.duration < 500
  });

  if (refreshSuccess && response.status === 200) {
    return response.json().data.token;
  }

  return null;
}

/**
 * Validate current authentication status
 */
export function validateAuth(token) {
  const response = http.get(
    `${CONFIG.API_BASE_URL}/auth/me`,
    {
      headers: {
        ...HTTP_HEADERS,
        'Authorization': `Bearer ${token}`
      },
      tags: { name: 'auth_validate' }
    }
  );

  const authValid = check(response, {
    'Auth Validation - Status is 200': (r) => r.status === 200,
    'Auth Validation - Has user data': (r) => r.json('data') !== null,
    'Auth Validation - Response time < 300ms': (r) => r.timings.duration < 300
  });

  return authValid && response.status === 200;
}

/**
 * Create and login test users for different roles
 */
export class TestUserSession {
  constructor(userType = 'patient') {
    this.userType = userType;
    this.userData = generateTestUser(userType);
    this.token = null;
    this.user = null;
    this.loginTime = null;
  }

  /**
   * Register and login the test user
   */
  async initialize() {
    // Register user
    const registrationResult = register(this.userData);
    if (!registrationResult) {
      throw new Error(`Failed to register test user: ${this.userData.email}`);
    }

    // Login user
    const loginResult = login(this.userData.email, this.userData.password, this.userType);
    if (!loginResult) {
      throw new Error(`Failed to login test user: ${this.userData.email}`);
    }

    this.token = loginResult.token;
    this.user = loginResult.user;
    this.loginTime = new Date();

    return this;
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    return {
      ...HTTP_HEADERS,
      'Authorization': `Bearer ${this.token}`
    };
  }

  /**
   * Check if token needs refresh (refresh if older than 45 minutes)
   */
  needsTokenRefresh() {
    if (!this.loginTime) return false;
    const now = new Date();
    const minutesElapsed = (now - this.loginTime) / (1000 * 60);
    return minutesElapsed > 45;
  }

  /**
   * Refresh token if needed
   */
  refreshIfNeeded() {
    if (this.needsTokenRefresh()) {
      const newToken = refreshToken(this.token);
      if (newToken) {
        this.token = newToken;
        this.loginTime = new Date();
        return true;
      }
    }
    return false;
  }

  /**
   * Cleanup - logout user
   */
  cleanup() {
    if (this.token) {
      logout(this.token);
      this.token = null;
      this.user = null;
      this.loginTime = null;
    }
  }
}

/**
 * Pre-authenticate users for performance testing
 */
export function preAuthenticateUsers(count, userType = 'patient') {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const user = new TestUserSession(userType);
    try {
      user.initialize();
      users.push(user);
    } catch (error) {
      console.error(`Failed to pre-authenticate user ${i}: ${error.message}`);
    }
    
    // Small delay between registrations to avoid rate limiting
    sleep(0.1);
  }
  
  console.log(`Pre-authenticated ${users.length} ${userType} users`);
  return users;
}

/**
 * Simulate authentication errors for testing
 */
export function simulateAuthErrors() {
  // Invalid credentials
  const invalidLogin = http.post(
    `${CONFIG.API_BASE_URL}/auth/login`,
    JSON.stringify({
      email: 'invalid@example.com',
      password: 'wrongpassword'
    }),
    {
      headers: HTTP_HEADERS,
      tags: { name: 'auth_login_invalid' }
    }
  );

  check(invalidLogin, {
    'Invalid Login - Status is 401': (r) => r.status === 401,
    'Invalid Login - Error message': (r) => r.json('message').includes('Invalid')
  });

  // Missing fields
  const incompleteLogin = http.post(
    `${CONFIG.API_BASE_URL}/auth/login`,
    JSON.stringify({
      email: 'test@example.com'
      // missing password
    }),
    {
      headers: HTTP_HEADERS,
      tags: { name: 'auth_login_incomplete' }
    }
  );

  check(incompleteLogin, {
    'Incomplete Login - Status is 400': (r) => r.status === 400,
    'Incomplete Login - Validation error': (r) => r.json('errors') !== null
  });

  // Invalid token
  const invalidToken = http.get(
    `${CONFIG.API_BASE_URL}/auth/me`,
    {
      headers: {
        ...HTTP_HEADERS,
        'Authorization': 'Bearer invalid_token'
      },
      tags: { name: 'auth_validate_invalid' }
    }
  );

  check(invalidToken, {
    'Invalid Token - Status is 401': (r) => r.status === 401
  });
}