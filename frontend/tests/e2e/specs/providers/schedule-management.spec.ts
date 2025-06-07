import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { AccessibilityHelper } from '../../helpers/accessibility.helper';
import { testProviderSchedule } from '../../fixtures/test-data';

test.describe('Provider Schedule Management', () => {
  let authHelper: AuthHelper;
  let a11yHelper: AccessibilityHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    a11yHelper = new AccessibilityHelper(page);
    
    // Login as provider
    await authHelper.login('provider');
    await page.goto('/provider-dashboard/schedule');
  });

  test('should display provider schedule interface', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Schedule Management');

    // Check main components
    await expect(page.locator('[data-testid="schedule-calendar"]')).toBeVisible();
    await expect(page.locator('[data-testid="availability-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="appointment-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="schedule-actions"]')).toBeVisible();
  });

  test('should set regular availability hours', async ({ page }) => {
    // Click on availability settings
    await page.click('[data-testid="edit-availability-button"]');

    // Set Monday availability
    await page.click('[data-testid="day-monday-toggle"]');
    await page.fill('[data-testid="monday-start-time"]', '09:00');
    await page.fill('[data-testid="monday-end-time"]', '17:00');

    // Add lunch break
    await page.click('[data-testid="add-break-monday"]');
    await page.fill('[data-testid="monday-break-start"]', '12:00');
    await page.fill('[data-testid="monday-break-end"]', '13:00');

    // Copy to weekdays
    await page.click('[data-testid="copy-to-weekdays-button"]');

    // Set Friday different hours
    await page.fill('[data-testid="friday-end-time"]', '15:00');

    // Save availability
    await page.click('[data-testid="save-availability-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/Availability updated/i);
  });

  test('should block time slots for personal time', async ({ page }) => {
    // Navigate to specific date
    await page.click('[data-testid="calendar-next-week"]');
    
    // Click on a time slot
    await page.click('[data-testid="time-slot-10:00"]');

    // Select block time option
    await page.click('[data-testid="block-time-option"]');

    // Fill block details
    await page.fill('[data-testid="block-reason"]', 'Personal appointment');
    await page.selectOption('[data-testid="block-duration"]', '60');
    
    // Set as recurring
    await page.check('[data-testid="recurring-block"]');
    await page.selectOption('[data-testid="recurrence-pattern"]', 'weekly');
    await page.fill('[data-testid="recurrence-count"]', '4');

    // Save block
    await page.click('[data-testid="save-block-button"]');

    // Verify blocked time appears
    await expect(page.locator('[data-testid="blocked-slot-10:00"]')).toHaveClass(/blocked/);
  });

  test('should manage appointment requests', async ({ page }) => {
    // Navigate to appointment requests
    await page.click('[data-testid="appointment-requests-tab"]');

    // Check for pending requests
    const pendingRequests = await page.$$('[data-testid="appointment-request"]');
    
    if (pendingRequests.length > 0) {
      // Accept first request
      const firstRequest = pendingRequests[0];
      await firstRequest.locator('[data-testid="view-request-button"]').click();

      // Review patient information
      await expect(page.locator('[data-testid="patient-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="requested-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="appointment-reason"]')).toBeVisible();

      // Accept appointment
      await page.click('[data-testid="accept-appointment-button"]');

      // Add provider notes
      await page.fill('[data-testid="provider-notes"]', 'Looking forward to our session');
      await page.click('[data-testid="confirm-accept-button"]');

      // Verify confirmation
      await expect(page.locator('[data-testid="appointment-accepted"]')).toContainText(/Appointment accepted/i);
    }
  });

  test('should reschedule provider appointments', async ({ page }) => {
    // View today's appointments
    await page.click('[data-testid="today-appointments"]');

    const appointments = await page.$$('[data-testid="appointment-item"]');
    
    if (appointments.length > 0) {
      // Click reschedule on first appointment
      await appointments[0].locator('[data-testid="reschedule-button"]').click();

      // Propose new times
      await page.click('[data-testid="propose-times-button"]');

      // Select alternative slots
      await page.click('[data-testid="alt-slot-1"]');
      await page.click('[data-testid="alt-slot-2"]');
      await page.click('[data-testid="alt-slot-3"]');

      // Add message to patient
      await page.fill('[data-testid="reschedule-message"]', 'I need to reschedule due to an emergency. Please select from the available times.');

      // Send reschedule request
      await page.click('[data-testid="send-reschedule-button"]');

      // Verify sent
      await expect(page.locator('[data-testid="reschedule-sent"]')).toContainText(/Reschedule request sent/i);
    }
  });

  test('should set vacation/out-of-office', async ({ page }) => {
    // Click vacation mode
    await page.click('[data-testid="vacation-mode-button"]');

    // Set vacation dates
    await page.fill('[data-testid="vacation-start-date"]', '2024-07-01');
    await page.fill('[data-testid="vacation-end-date"]', '2024-07-14');

    // Set auto-reply message
    await page.fill('[data-testid="vacation-message"]', 'I will be out of office from July 1-14. For urgent matters, please contact the office.');

    // Handle existing appointments
    await page.click('[data-testid="handle-appointments-tab"]');
    
    const affectedAppointments = await page.$$('[data-testid="affected-appointment"]');
    if (affectedAppointments.length > 0) {
      // Select action for all
      await page.selectOption('[data-testid="bulk-action-select"]', 'offer-reschedule');
      await page.click('[data-testid="apply-bulk-action"]');
    }

    // Activate vacation mode
    await page.click('[data-testid="activate-vacation-button"]');

    // Verify activation
    await expect(page.locator('[data-testid="vacation-active-banner"]')).toBeVisible();
  });

  test('should manage session types and durations', async ({ page }) => {
    // Navigate to session settings
    await page.click('[data-testid="session-settings-button"]');

    // Add new session type
    await page.click('[data-testid="add-session-type-button"]');
    await page.fill('[data-testid="session-type-name"]', 'Extended Therapy Session');
    await page.fill('[data-testid="session-duration"]', '80');
    await page.fill('[data-testid="session-price"]', '200');
    await page.check('[data-testid="session-virtual-enabled"]');
    await page.click('[data-testid="save-session-type"]');

    // Edit existing session type
    const sessionTypes = await page.$$('[data-testid="session-type-item"]');
    if (sessionTypes.length > 0) {
      await sessionTypes[0].locator('[data-testid="edit-session-type"]').click();
      await page.fill('[data-testid="session-buffer-time"]', '10');
      await page.click('[data-testid="update-session-type"]');
    }

    // Verify changes
    await expect(page.locator('[data-testid="session-types-updated"]')).toBeVisible();
  });

  test('should view and export schedule', async ({ page }) => {
    // Switch to month view
    await page.click('[data-testid="view-month-button"]');
    await expect(page.locator('[data-testid="month-view"]')).toBeVisible();

    // Export schedule
    await page.click('[data-testid="export-schedule-button"]');
    
    // Select export options
    await page.selectOption('[data-testid="export-format"]', 'pdf');
    await page.selectOption('[data-testid="export-range"]', 'month');
    await page.check('[data-testid="include-patient-info"]');

    // Download export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-export-button"]');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('schedule');
  });

  test('should handle appointment modifications', async ({ page }) => {
    // View appointment details
    const appointment = await page.locator('[data-testid="appointment-item"]').first();
    if (await appointment.isVisible()) {
      await appointment.click();

      // View appointment details modal
      await page.waitForSelector('[data-testid="appointment-details-modal"]');

      // Add session notes
      await page.click('[data-testid="add-notes-button"]');
      await page.fill('[data-testid="session-notes"]', 'Patient showed good progress with coping strategies');
      
      // Mark appointment status
      await page.selectOption('[data-testid="appointment-status"]', 'completed');
      
      // Save changes
      await page.click('[data-testid="save-appointment-changes"]');

      // Verify saved
      await expect(page.locator('[data-testid="changes-saved"]')).toBeVisible();
    }
  });

  test('should integrate with video conferencing', async ({ page }) => {
    // Create virtual appointment slot
    await page.click('[data-testid="create-appointment-slot"]');
    
    // Select virtual session
    await page.click('[data-testid="session-type-virtual"]');
    
    // Generate meeting link
    await page.click('[data-testid="generate-meeting-link"]');
    
    // Verify link generated
    await expect(page.locator('[data-testid="meeting-link-input"]')).toHaveValue(/https:\/\//);
    
    // Test meeting link
    await page.click('[data-testid="test-meeting-link"]');
    
    // Should open in new tab or show test successful
    await expect(page.locator('[data-testid="meeting-test-result"]')).toContainText(/Test successful/i);
  });

  test('should meet accessibility standards', async ({ page }) => {
    await a11yHelper.checkPageAccessibility();
    
    // Check calendar accessibility
    await a11yHelper.checkKeyboardNavigation('[data-testid="schedule-calendar"]');
    
    // Check form accessibility
    await page.click('[data-testid="edit-availability-button"]');
    await a11yHelper.checkFormAccessibility('[data-testid="availability-form"]');
  });

  test('should sync with external calendars', async ({ page }) => {
    // Navigate to calendar sync
    await page.click('[data-testid="calendar-sync-button"]');

    // Check available integrations
    await expect(page.locator('[data-testid="google-calendar-option"]')).toBeVisible();
    await expect(page.locator('[data-testid="outlook-calendar-option"]')).toBeVisible();

    // Connect Google Calendar
    await page.click('[data-testid="connect-google-calendar"]');
    
    // Handle OAuth flow (mocked in tests)
    await page.waitForSelector('[data-testid="calendar-connected"]');
    
    // Configure sync settings
    await page.check('[data-testid="sync-appointments"]');
    await page.check('[data-testid="sync-availability"]');
    await page.selectOption('[data-testid="sync-frequency"]', '15min');
    
    // Save sync settings
    await page.click('[data-testid="save-sync-settings"]');
    
    // Verify sync active
    await expect(page.locator('[data-testid="sync-status"]')).toContainText(/Syncing/i);
  });

  test('should manage waitlist from provider side', async ({ page }) => {
    // Navigate to waitlist
    await page.click('[data-testid="waitlist-management"]');

    // View waitlist patients
    await expect(page.locator('[data-testid="waitlist-count"]')).toBeVisible();
    
    const waitlistItems = await page.$$('[data-testid="waitlist-patient"]');
    
    if (waitlistItems.length > 0) {
      // Contact first patient
      await waitlistItems[0].locator('[data-testid="contact-patient-button"]').click();
      
      // Offer appointment
      await page.click('[data-testid="offer-appointment-button"]');
      
      // Select available slots
      await page.click('[data-testid="available-slot-1"]');
      await page.click('[data-testid="available-slot-2"]');
      
      // Send offer
      await page.fill('[data-testid="appointment-offer-message"]', 'I have some availability this week. Please let me know if any of these times work for you.');
      await page.click('[data-testid="send-offer-button"]');
      
      // Verify sent
      await expect(page.locator('[data-testid="offer-sent"]')).toBeVisible();
    }
  });
});