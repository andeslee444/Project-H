import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { AccessibilityHelper } from '../../helpers/accessibility.helper';
import { testUsers } from '../../fixtures/test-users';

test.describe('User Login', () => {
  let authHelper: AuthHelper;
  let a11yHelper: AccessibilityHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    a11yHelper = new AccessibilityHelper(page);
    await page.goto('/login');
  });

  test('should display login form with required fields', async ({ page }) => {
    // Check page title and heading
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('h1')).toContainText('Sign In');

    // Check form fields
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="forgot-password-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-link"]')).toBeVisible();
  });

  test('should successfully login as patient', async ({ page }) => {
    await authHelper.login('patient');
    
    // Verify redirect to patient dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="dashboard-welcome"]')).toContainText(testUsers.patient.firstName);
  });

  test('should successfully login as provider', async ({ page }) => {
    await authHelper.login('provider');
    
    // Verify redirect to provider dashboard
    await expect(page).toHaveURL(/\/provider-dashboard/);
    await expect(page.locator('[data-testid="provider-welcome"]')).toContainText(testUsers.provider.firstName);
  });

  test('should display error for invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText(/Invalid email or password/i);
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required');
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email address');
  });

  test('should handle account lockout after failed attempts', async ({ page }) => {
    // Attempt login with wrong password multiple times
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="email-input"]', testUsers.patient.email);
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      await page.waitForTimeout(500); // Wait between attempts
    }

    // Check for lockout message
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/account has been temporarily locked/i);
  });

  test('should remember user with "Remember Me" checkbox', async ({ page, context }) => {
    // Login with remember me checked
    await page.fill('[data-testid="email-input"]', testUsers.patient.email);
    await page.fill('[data-testid="password-input"]', testUsers.patient.password);
    await page.check('[data-testid="remember-me-checkbox"]');
    await page.click('[data-testid="login-button"]');

    // Wait for successful login
    await page.waitForURL(/\/dashboard/);

    // Get cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'session' || c.name === 'auth-token');
    
    // Check cookie has extended expiry (more than 24 hours)
    if (sessionCookie && sessionCookie.expires) {
      const expiryTime = sessionCookie.expires * 1000; // Convert to milliseconds
      const dayFromNow = Date.now() + (24 * 60 * 60 * 1000);
      expect(expiryTime).toBeGreaterThan(dayFromNow);
    }
  });

  test('should redirect to forgot password page', async ({ page }) => {
    await page.click('[data-testid="forgot-password-link"]');
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.locator('h1')).toContainText('Reset Password');
  });

  test('should redirect to registration page', async ({ page }) => {
    await page.click('[data-testid="register-link"]');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h1')).toContainText('Create Account');
  });

  test('should meet accessibility standards', async ({ page }) => {
    await a11yHelper.checkPageAccessibility();
    await a11yHelper.checkFormAccessibility('[data-testid="login-form"]');
    await a11yHelper.checkHeadingStructure();
    await a11yHelper.checkColorContrast();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab to email field
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

    // Tab to password field
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

    // Tab to remember me checkbox
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="remember-me-checkbox"]')).toBeFocused();

    // Tab to login button
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="login-button"]')).toBeFocused();

    // Enter to submit
    await page.fill('[data-testid="email-input"]', testUsers.patient.email);
    await page.fill('[data-testid="password-input"]', testUsers.patient.password);
    await page.focus('[data-testid="login-button"]');
    await page.keyboard.press('Enter');

    await page.waitForURL(/\/dashboard/);
  });

  test('should show loading state during login', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', testUsers.patient.email);
    await page.fill('[data-testid="password-input"]', testUsers.patient.password);

    // Start login
    const loginPromise = page.click('[data-testid="login-button"]');

    // Check loading state appears
    await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
    await expect(page.locator('[data-testid="login-button"]')).toContainText(/Signing in/i);

    // Wait for login to complete
    await loginPromise;
    await page.waitForURL(/\/dashboard/);
  });

  test('should persist return URL after login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/appointments/new');
    
    // Should redirect to login with return URL
    await expect(page).toHaveURL(/\/login\?returnUrl=/);

    // Login
    await authHelper.login('patient');

    // Should redirect back to original URL
    await expect(page).toHaveURL('/appointments/new');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await authHelper.login('patient');
    
    // Logout
    await authHelper.logout();
    
    // Verify logged out
    await authHelper.verifyUserIsLoggedOut();
    
    // Try to access protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle session expiry gracefully', async ({ page, context }) => {
    // Login
    await authHelper.login('patient');

    // Clear session cookie to simulate expiry
    await context.clearCookies();

    // Try to navigate to protected page
    await page.goto('/dashboard');

    // Should redirect to login with session expired message
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('[data-testid="info-message"]')).toContainText(/session has expired/i);
  });
});