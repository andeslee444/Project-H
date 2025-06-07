import { Page } from '@playwright/test';
import { testUsers, TestUser } from '../fixtures/test-users';

export class AuthHelper {
  constructor(private page: Page) {}

  async login(userType: TestUser) {
    const user = testUsers[userType];
    await this.page.goto('/login');
    
    // Wait for login form to be visible
    await this.page.waitForSelector('[data-testid="login-form"]', { state: 'visible' });
    
    // Fill in login credentials
    await this.page.fill('[data-testid="email-input"]', user.email);
    await this.page.fill('[data-testid="password-input"]', user.password);
    
    // Submit form
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for navigation to complete
    await this.page.waitForURL(/\/dashboard|\/provider-dashboard/, { timeout: 10000 });
    
    // Verify successful login by checking for user menu
    await this.page.waitForSelector('[data-testid="user-menu"]', { state: 'visible' });
  }

  async logout() {
    // Click user menu
    await this.page.click('[data-testid="user-menu"]');
    
    // Click logout option
    await this.page.click('[data-testid="logout-button"]');
    
    // Wait for redirect to login page
    await this.page.waitForURL('/login');
  }

  async register(userType: TestUser) {
    const user = testUsers[userType];
    await this.page.goto('/register');
    
    // Wait for registration form
    await this.page.waitForSelector('[data-testid="register-form"]', { state: 'visible' });
    
    // Select user type
    await this.page.click(`[data-testid="user-type-${userType}"]`);
    
    // Fill basic information
    await this.page.fill('[data-testid="firstName-input"]', user.firstName);
    await this.page.fill('[data-testid="lastName-input"]', user.lastName);
    await this.page.fill('[data-testid="email-input"]', user.email);
    await this.page.fill('[data-testid="password-input"]', user.password);
    await this.page.fill('[data-testid="confirmPassword-input"]', user.password);
    
    if (userType === 'patient' && 'dateOfBirth' in user) {
      // Fill patient-specific fields
      await this.page.fill('[data-testid="dateOfBirth-input"]', user.dateOfBirth);
      await this.page.fill('[data-testid="phoneNumber-input"]', user.phoneNumber);
      await this.page.fill('[data-testid="insuranceProvider-input"]', user.insuranceProvider);
      await this.page.fill('[data-testid="insuranceMemberId-input"]', user.insuranceMemberId);
      await this.page.selectOption('[data-testid="preferredPronouns-select"]', user.preferredPronouns);
      await this.page.fill('[data-testid="emergencyContactName-input"]', user.emergencyContactName);
      await this.page.fill('[data-testid="emergencyContactPhone-input"]', user.emergencyContactPhone);
    } else if (userType === 'provider' && 'licenseNumber' in user) {
      // Fill provider-specific fields
      await this.page.fill('[data-testid="licenseNumber-input"]', user.licenseNumber);
      // Handle specializations (assuming multi-select)
      for (const specialization of user.specializations) {
        await this.page.click(`[data-testid="specialization-${specialization}"]`);
      }
    }
    
    // Accept terms and conditions
    await this.page.check('[data-testid="terms-checkbox"]');
    
    // Submit registration
    await this.page.click('[data-testid="register-button"]');
    
    // Wait for successful registration (might redirect to login or dashboard)
    await this.page.waitForURL(/\/login|\/dashboard|\/provider-dashboard/, { timeout: 10000 });
  }

  async verifyUserIsLoggedIn() {
    await this.page.waitForSelector('[data-testid="user-menu"]', { state: 'visible' });
  }

  async verifyUserIsLoggedOut() {
    await this.page.waitForURL('/login');
    await this.page.waitForSelector('[data-testid="login-form"]', { state: 'visible' });
  }
}