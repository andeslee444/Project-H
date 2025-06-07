import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/Mental Health/);
    
    // Check for main elements
    await expect(page.locator('body')).toBeVisible();
    
    // Check no console errors
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });
    
    // Navigate to login
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText(/Sign In|Login/i);
    
    // Navigate to register
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText(/Create Account|Register/i);
    
    // Verify no console errors
    expect(consoleLogs).toHaveLength(0);
  });

  test('should have responsive design', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle 404 pages', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should show 404 or redirect to login
    const url = page.url();
    expect(url).toMatch(/404|not-found|login/);
  });
});