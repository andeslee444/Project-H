import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { AccessibilityHelper } from '../../helpers/accessibility.helper';
import { testUsers } from '../../fixtures/test-users';

test.describe('Patient Registration', () => {
  let authHelper: AuthHelper;
  let a11yHelper: AccessibilityHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    a11yHelper = new AccessibilityHelper(page);
    await page.goto('/register');
  });

  test('should display registration form with all required fields', async ({ page }) => {
    // Check page title and heading
    await expect(page).toHaveTitle(/Register/);
    await expect(page.locator('h1')).toContainText('Create Account');

    // Check user type selection
    await expect(page.locator('[data-testid="user-type-patient"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-type-provider"]')).toBeVisible();

    // Select patient type
    await page.click('[data-testid="user-type-patient"]');

    // Check all required fields are present
    const requiredFields = [
      'firstName-input',
      'lastName-input',
      'email-input',
      'password-input',
      'confirmPassword-input',
      'dateOfBirth-input',
      'phoneNumber-input',
      'insuranceProvider-input',
      'insuranceMemberId-input',
      'emergencyContactName-input',
      'emergencyContactPhone-input'
    ];

    for (const field of requiredFields) {
      await expect(page.locator(`[data-testid="${field}"]`)).toBeVisible();
    }

    // Check terms checkbox
    await expect(page.locator('[data-testid="terms-checkbox"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-button"]')).toBeVisible();
  });

  test('should successfully register a new patient', async ({ page }) => {
    const newPatient = testUsers.newPatient;
    
    // Select patient type
    await page.click('[data-testid="user-type-patient"]');

    // Fill in registration form
    await page.fill('[data-testid="firstName-input"]', newPatient.firstName);
    await page.fill('[data-testid="lastName-input"]', newPatient.lastName);
    await page.fill('[data-testid="email-input"]', newPatient.email);
    await page.fill('[data-testid="password-input"]', newPatient.password);
    await page.fill('[data-testid="confirmPassword-input"]', newPatient.password);
    await page.fill('[data-testid="dateOfBirth-input"]', newPatient.dateOfBirth);
    await page.fill('[data-testid="phoneNumber-input"]', newPatient.phoneNumber);
    await page.fill('[data-testid="insuranceProvider-input"]', newPatient.insuranceProvider);
    await page.fill('[data-testid="insuranceMemberId-input"]', newPatient.insuranceMemberId);
    await page.selectOption('[data-testid="preferredPronouns-select"]', newPatient.preferredPronouns);
    await page.fill('[data-testid="emergencyContactName-input"]', newPatient.emergencyContactName);
    await page.fill('[data-testid="emergencyContactPhone-input"]', newPatient.emergencyContactPhone);

    // Add medical information if available
    if (newPatient.conditions.length > 0) {
      await page.click('[data-testid="add-condition-button"]');
      await page.fill('[data-testid="condition-input"]', newPatient.conditions[0]);
    }

    // Accept terms
    await page.check('[data-testid="terms-checkbox"]');

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Wait for registration to complete
    await page.waitForURL(/\/dashboard|\/login/, { timeout: 10000 });

    // If redirected to login, verify success message
    if (page.url().includes('/login')) {
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Registration successful');
    }
  });

  test('should validate required fields', async ({ page }) => {
    // Select patient type
    await page.click('[data-testid="user-type-patient"]');

    // Try to submit without filling fields
    await page.click('[data-testid="register-button"]');

    // Check for validation errors
    await expect(page.locator('[data-testid="firstName-error"]')).toContainText('First name is required');
    await expect(page.locator('[data-testid="lastName-error"]')).toContainText('Last name is required');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required');
  });

  test('should validate password requirements', async ({ page }) => {
    await page.click('[data-testid="user-type-patient"]');

    // Test weak password
    await page.fill('[data-testid="password-input"]', 'weak');
    await page.fill('[data-testid="confirmPassword-input"]', 'weak');
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('[data-testid="password-error"]')).toContainText(/must be at least 8 characters|must contain/i);
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.click('[data-testid="user-type-patient"]');

    await page.fill('[data-testid="password-input"]', 'StrongPass123!');
    await page.fill('[data-testid="confirmPassword-input"]', 'DifferentPass123!');
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('[data-testid="confirmPassword-error"]')).toContainText('Passwords do not match');
  });

  test('should validate email format', async ({ page }) => {
    await page.click('[data-testid="user-type-patient"]');

    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email address');
  });

  test('should handle existing email error', async ({ page }) => {
    const existingPatient = testUsers.patient;
    
    await page.click('[data-testid="user-type-patient"]');

    // Fill form with existing user's email
    await page.fill('[data-testid="firstName-input"]', 'New');
    await page.fill('[data-testid="lastName-input"]', 'User');
    await page.fill('[data-testid="email-input"]', existingPatient.email);
    await page.fill('[data-testid="password-input"]', 'NewPass123!');
    await page.fill('[data-testid="confirmPassword-input"]', 'NewPass123!');
    await page.fill('[data-testid="dateOfBirth-input"]', '1995-01-01');
    await page.fill('[data-testid="phoneNumber-input"]', '(555) 111-2222');
    await page.fill('[data-testid="insuranceProvider-input"]', 'Test Insurance');
    await page.fill('[data-testid="insuranceMemberId-input"]', 'TEST123');
    await page.fill('[data-testid="emergencyContactName-input"]', 'Emergency Contact');
    await page.fill('[data-testid="emergencyContactPhone-input"]', '(555) 999-8888');
    
    await page.check('[data-testid="terms-checkbox"]');
    await page.click('[data-testid="register-button"]');

    // Check for error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Email already registered');
  });

  test('should meet accessibility standards', async ({ page }) => {
    await page.click('[data-testid="user-type-patient"]');
    
    // Wait for form to be fully rendered
    await page.waitForSelector('[data-testid="register-form"]');
    
    // Check accessibility
    await a11yHelper.checkPageAccessibility();
    await a11yHelper.checkFormAccessibility('[data-testid="register-form"]');
    await a11yHelper.checkHeadingStructure();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.click('[data-testid="user-type-patient"]');

    // Tab through form fields
    await page.keyboard.press('Tab'); // First name
    await expect(page.locator('[data-testid="firstName-input"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Last name
    await expect(page.locator('[data-testid="lastName-input"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Email
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

    // Continue tabbing through all fields
    const focusableElements = await page.$$('[data-testid*="-input"], [data-testid*="-select"], [data-testid*="-checkbox"], [data-testid*="-button"]');
    expect(focusableElements.length).toBeGreaterThan(10);
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.click('[data-testid="user-type-patient"]');

    // Test weak password
    await page.fill('[data-testid="password-input"]', 'weak');
    await expect(page.locator('[data-testid="password-strength"]')).toContainText(/weak/i);

    // Test medium password
    await page.fill('[data-testid="password-input"]', 'Medium123');
    await expect(page.locator('[data-testid="password-strength"]')).toContainText(/medium/i);

    // Test strong password
    await page.fill('[data-testid="password-input"]', 'StrongPass123!@#');
    await expect(page.locator('[data-testid="password-strength"]')).toContainText(/strong/i);
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.click('[data-testid="user-type-patient"]');

    const passwordInput = page.locator('[data-testid="password-input"]');
    const toggleButton = page.locator('[data-testid="toggle-password-visibility"]');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});