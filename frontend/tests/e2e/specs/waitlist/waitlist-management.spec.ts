import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { AccessibilityHelper } from '../../helpers/accessibility.helper';
import { testWaitlistPreferences } from '../../fixtures/test-data';

test.describe('Waitlist Management', () => {
  let authHelper: AuthHelper;
  let a11yHelper: AccessibilityHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    a11yHelper = new AccessibilityHelper(page);
    
    // Login as patient
    await authHelper.login('patient');
  });

  test('should join waitlist when no appointments available', async ({ page }) => {
    // Navigate to book appointment
    await page.goto('/appointments/new');
    
    // Select appointment type
    await page.click('[data-testid="appointment-type-Initial Consultation"]');
    await page.click('[data-testid="next-step-button"]');

    // If no appointments available, waitlist option should appear
    const noAvailability = await page.locator('[data-testid="no-availability-message"]');
    if (await noAvailability.isVisible()) {
      await expect(page.locator('[data-testid="join-waitlist-button"]')).toBeVisible();
      
      // Click join waitlist
      await page.click('[data-testid="join-waitlist-button"]');
      
      // Fill waitlist preferences
      await page.waitForSelector('[data-testid="waitlist-preferences-form"]');
      
      // Set preferences
      await page.selectOption('[data-testid="urgency-level"]', testWaitlistPreferences.flexible.urgency);
      await page.selectOption('[data-testid="time-preference"]', testWaitlistPreferences.flexible.timePreference);
      
      // Select preferred days
      for (const day of testWaitlistPreferences.flexible.dayPreference) {
        await page.check(`[data-testid="day-${day}"]`);
      }
      
      // Set max wait time
      await page.selectOption('[data-testid="max-wait-time"]', testWaitlistPreferences.flexible.maxWaitTime);
      
      // Accept short notice
      if (testWaitlistPreferences.flexible.acceptShortNotice) {
        await page.check('[data-testid="accept-short-notice"]');
      }
      
      // Submit preferences
      await page.click('[data-testid="submit-waitlist-button"]');
      
      // Verify confirmation
      await expect(page.locator('[data-testid="waitlist-confirmation"]')).toContainText(/added to waitlist/i);
    }
  });

  test('should display waitlist position and estimated wait time', async ({ page }) => {
    // Navigate to waitlist status
    await page.goto('/appointments/waitlist');
    
    // Check if on waitlist
    const waitlistStatus = await page.locator('[data-testid="waitlist-status"]');
    if (await waitlistStatus.isVisible()) {
      // Check position display
      await expect(page.locator('[data-testid="waitlist-position"]')).toContainText(/Position: \d+/);
      
      // Check estimated wait time
      await expect(page.locator('[data-testid="estimated-wait"]')).toContainText(/Estimated wait:/);
      
      // Check last updated
      await expect(page.locator('[data-testid="position-updated"]')).toContainText(/Last updated:/);
    }
  });

  test('should update waitlist preferences', async ({ page }) => {
    await page.goto('/appointments/waitlist');
    
    // If on waitlist, should see preferences
    const editButton = await page.locator('[data-testid="edit-preferences-button"]');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Update preferences to urgent
      await page.selectOption('[data-testid="urgency-level"]', testWaitlistPreferences.urgent.urgency);
      await page.selectOption('[data-testid="time-preference"]', testWaitlistPreferences.urgent.timePreference);
      
      // Clear all days and select any
      const dayCheckboxes = await page.$$('[data-testid^="day-"]');
      for (const checkbox of dayCheckboxes) {
        await checkbox.uncheck();
      }
      await page.check('[data-testid="day-Any"]');
      
      // Update max wait time
      await page.selectOption('[data-testid="max-wait-time"]', testWaitlistPreferences.urgent.maxWaitTime);
      
      // Save changes
      await page.click('[data-testid="save-preferences-button"]');
      
      // Verify update
      await expect(page.locator('[data-testid="preferences-updated"]')).toContainText(/Preferences updated/i);
    }
  });

  test('should receive and respond to appointment offers', async ({ page }) => {
    // Navigate to notifications
    await page.goto('/notifications');
    
    // Look for waitlist offer notifications
    const offerNotification = await page.locator('[data-testid="notification-type-waitlist_offer"]').first();
    
    if (await offerNotification.isVisible()) {
      // Click to view offer
      await offerNotification.click();
      
      // View offered slots
      await page.waitForSelector('[data-testid="appointment-offer-modal"]');
      await expect(page.locator('[data-testid="offered-slots"]')).toBeVisible();
      
      // Select a slot
      const offeredSlots = await page.$$('[data-testid="offered-slot"]');
      expect(offeredSlots.length).toBeGreaterThan(0);
      
      await offeredSlots[0].click();
      
      // Accept offer
      await page.click('[data-testid="accept-offer-button"]');
      
      // Confirm booking
      await page.waitForSelector('[data-testid="booking-confirmation"]');
      await expect(page.locator('[data-testid="confirmation-message"]')).toContainText(/appointment confirmed/i);
      
      // Should be removed from waitlist
      await page.goto('/appointments/waitlist');
      await expect(page.locator('[data-testid="not-on-waitlist"]')).toBeVisible();
    }
  });

  test('should handle waitlist cancellation', async ({ page }) => {
    await page.goto('/appointments/waitlist');
    
    const leaveWaitlistButton = await page.locator('[data-testid="leave-waitlist-button"]');
    if (await leaveWaitlistButton.isVisible()) {
      // Click leave waitlist
      await leaveWaitlistButton.click();
      
      // Confirm cancellation
      await page.waitForSelector('[data-testid="cancel-waitlist-dialog"]');
      await page.selectOption('[data-testid="cancellation-reason"]', 'Found alternative provider');
      await page.fill('[data-testid="cancellation-feedback"]', 'Found another provider with sooner availability');
      
      await page.click('[data-testid="confirm-leave-waitlist"]');
      
      // Verify removed from waitlist
      await expect(page.locator('[data-testid="waitlist-cancelled"]')).toContainText(/removed from waitlist/i);
    }
  });

  test('should show waitlist analytics', async ({ page }) => {
    await page.goto('/appointments/waitlist');
    
    // If on waitlist, check for analytics
    const analyticsSection = await page.locator('[data-testid="waitlist-analytics"]');
    if (await analyticsSection.isVisible()) {
      // Average wait time
      await expect(page.locator('[data-testid="avg-wait-time"]')).toContainText(/Average wait:/);
      
      // Movement rate
      await expect(page.locator('[data-testid="movement-rate"]')).toContainText(/positions per/);
      
      // Success rate
      await expect(page.locator('[data-testid="success-rate"]')).toContainText(/get appointments/);
    }
  });

  test('should prioritize urgent cases', async ({ page }) => {
    // Book urgent appointment
    await page.goto('/appointments/new');
    await page.click('[data-testid="appointment-type-Urgent"]');
    await page.click('[data-testid="next-step-button"]');
    
    // If no immediate availability
    const joinUrgentWaitlist = await page.locator('[data-testid="join-urgent-waitlist"]');
    if (await joinUrgentWaitlist.isVisible()) {
      await joinUrgentWaitlist.click();
      
      // Fill urgent reason
      await page.fill('[data-testid="urgent-reason"]', 'Experiencing severe anxiety attacks');
      await page.check('[data-testid="consent-to-contact"]');
      
      // Submit urgent request
      await page.click('[data-testid="submit-urgent-request"]');
      
      // Should see priority confirmation
      await expect(page.locator('[data-testid="urgent-waitlist-confirmation"]')).toContainText(/Priority waitlist/i);
      await expect(page.locator('[data-testid="contact-timeline"]')).toContainText(/within 24 hours/i);
    }
  });

  test('should manage multiple waitlists', async ({ page }) => {
    await page.goto('/appointments/waitlist');
    
    // Check if can join multiple provider waitlists
    await page.click('[data-testid="browse-other-providers"]');
    
    // View available providers
    await page.waitForSelector('[data-testid="provider-waitlist-list"]');
    
    const availableProviders = await page.$$('[data-testid="provider-waitlist-item"]');
    if (availableProviders.length > 1) {
      // Join another waitlist
      const secondProvider = availableProviders[1];
      await secondProvider.locator('[data-testid="join-provider-waitlist"]').click();
      
      // Set preferences for this provider
      await page.selectOption('[data-testid="time-preference"]', 'Afternoon');
      await page.click('[data-testid="submit-waitlist-button"]');
      
      // Should see multiple waitlist positions
      await page.goto('/appointments/waitlist');
      const waitlistCards = await page.$$('[data-testid="waitlist-card"]');
      expect(waitlistCards.length).toBeGreaterThan(1);
    }
  });

  test('should receive notifications for waitlist updates', async ({ page }) => {
    // Check notification preferences
    await page.goto('/settings/notifications');
    
    // Ensure waitlist notifications are enabled
    await page.check('[data-testid="notify-waitlist-movement"]');
    await page.check('[data-testid="notify-appointment-available"]');
    await page.check('[data-testid="notify-waitlist-offers"]');
    
    // Set notification methods
    await page.check('[data-testid="waitlist-email-notifications"]');
    await page.check('[data-testid="waitlist-sms-notifications"]');
    await page.check('[data-testid="waitlist-push-notifications"]');
    
    // Save settings
    await page.click('[data-testid="save-notification-settings"]');
    
    // Verify saved
    await expect(page.locator('[data-testid="settings-saved"]')).toBeVisible();
  });

  test('should meet accessibility standards', async ({ page }) => {
    await page.goto('/appointments/waitlist');
    
    await a11yHelper.checkPageAccessibility();
    
    // If on waitlist, check form accessibility
    const editButton = await page.locator('[data-testid="edit-preferences-button"]');
    if (await editButton.isVisible()) {
      await editButton.click();
      await a11yHelper.checkFormAccessibility('[data-testid="waitlist-preferences-form"]');
    }
  });

  test('should show waitlist history', async ({ page }) => {
    await page.goto('/appointments/waitlist/history');
    
    // Check for past waitlist entries
    const historyItems = await page.$$('[data-testid="waitlist-history-item"]');
    
    for (const item of historyItems) {
      // Each item should show
      await expect(item.locator('[data-testid="waitlist-provider"]')).toBeVisible();
      await expect(item.locator('[data-testid="waitlist-duration"]')).toBeVisible();
      await expect(item.locator('[data-testid="waitlist-outcome"]')).toBeVisible();
    }
    
    // Filter options
    await page.selectOption('[data-testid="filter-outcome"]', 'appointed');
    await page.click('[data-testid="apply-filters"]');
    
    // Verify filtered results
    const filteredItems = await page.$$('[data-testid="waitlist-history-item"]');
    for (const item of filteredItems) {
      await expect(item.locator('[data-testid="waitlist-outcome"]')).toContainText(/Appointed/i);
    }
  });

  test('should handle automatic appointment booking from waitlist', async ({ page }) => {
    await page.goto('/appointments/waitlist');
    
    // Enable auto-book if available
    const autoBookToggle = await page.locator('[data-testid="enable-auto-book"]');
    if (await autoBookToggle.isVisible()) {
      await autoBookToggle.click();
      
      // Set auto-book preferences
      await page.waitForSelector('[data-testid="auto-book-settings"]');
      await page.check('[data-testid="auto-book-first-available"]');
      await page.selectOption('[data-testid="auto-book-time-window"]', '7days');
      
      // Save auto-book settings
      await page.click('[data-testid="save-auto-book"]');
      
      // Verify enabled
      await expect(page.locator('[data-testid="auto-book-status"]')).toContainText(/Auto-book enabled/i);
    }
  });
});