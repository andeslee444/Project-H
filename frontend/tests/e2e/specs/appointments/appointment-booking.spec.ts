import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { AccessibilityHelper } from '../../helpers/accessibility.helper';
import { testAppointments } from '../../fixtures/test-data';

test.describe('Appointment Booking Flow', () => {
  let authHelper: AuthHelper;
  let a11yHelper: AccessibilityHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    a11yHelper = new AccessibilityHelper(page);
    
    // Login as patient
    await authHelper.login('patient');
    await page.goto('/appointments/new');
  });

  test('should display appointment booking form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Book Appointment');

    // Check form sections
    await expect(page.locator('[data-testid="appointment-type-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="provider-selection-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-time-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="reason-section"]')).toBeVisible();
  });

  test('should book a standard appointment successfully', async ({ page }) => {
    const appointment = testAppointments.standard;

    // Step 1: Select appointment type
    await page.click(`[data-testid="appointment-type-${appointment.type}"]`);
    await page.click('[data-testid="next-step-button"]');

    // Step 2: Select provider
    await page.waitForSelector('[data-testid="provider-list"]');
    const providers = await page.$$('[data-testid="provider-card"]');
    expect(providers.length).toBeGreaterThan(0);
    
    // Click first available provider
    await page.click('[data-testid="provider-card"]:first-child');
    await page.click('[data-testid="select-provider-button"]');

    // Step 3: Select date and time
    await page.waitForSelector('[data-testid="calendar-widget"]');
    
    // Select first available date
    const availableDates = await page.$$('[data-testid="available-date"]');
    expect(availableDates.length).toBeGreaterThan(0);
    await availableDates[0].click();

    // Select time slot
    await page.waitForSelector('[data-testid="time-slots"]');
    const timeSlots = await page.$$('[data-testid="time-slot"]:not([disabled])');
    expect(timeSlots.length).toBeGreaterThan(0);
    await timeSlots[0].click();

    // Step 4: Add appointment details
    await page.fill('[data-testid="appointment-reason"]', appointment.reason);
    await page.fill('[data-testid="appointment-notes"]', appointment.notes);

    // Submit booking
    await page.click('[data-testid="confirm-booking-button"]');

    // Wait for confirmation
    await page.waitForSelector('[data-testid="booking-confirmation"]');
    await expect(page.locator('[data-testid="confirmation-message"]')).toContainText(/appointment has been booked/i);
    
    // Check confirmation details
    await expect(page.locator('[data-testid="confirmation-details"]')).toContainText(appointment.type);
  });

  test('should filter providers by specialization', async ({ page }) => {
    // Select appointment type
    await page.click('[data-testid="appointment-type-Initial Consultation"]');
    await page.click('[data-testid="next-step-button"]');

    // Apply specialization filter
    await page.click('[data-testid="specialization-filter"]');
    await page.click('[data-testid="specialization-Anxiety Disorders"]');

    // Check filtered results
    await page.waitForSelector('[data-testid="provider-list"]');
    const providerCards = await page.$$('[data-testid="provider-card"]');
    
    for (const card of providerCards) {
      const specializations = await card.textContent();
      expect(specializations).toContain('Anxiety Disorders');
    }
  });

  test('should show provider availability in real-time', async ({ page }) => {
    // Navigate to provider selection
    await page.click('[data-testid="appointment-type-Initial Consultation"]');
    await page.click('[data-testid="next-step-button"]');

    // Select a provider
    await page.click('[data-testid="provider-card"]:first-child');

    // Check availability indicator
    await expect(page.locator('[data-testid="availability-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="next-available-slot"]')).toContainText(/Next available:/);
  });

  test('should handle no available appointments', async ({ page }) => {
    // Select urgent appointment type
    await page.click('[data-testid="appointment-type-Urgent"]');
    await page.click('[data-testid="next-step-button"]');

    // If no providers available
    const noProvidersMessage = await page.locator('[data-testid="no-providers-available"]');
    if (await noProvidersMessage.isVisible()) {
      await expect(noProvidersMessage).toContainText(/No providers available/i);
      await expect(page.locator('[data-testid="join-waitlist-button"]')).toBeVisible();
    }
  });

  test('should validate appointment booking form', async ({ page }) => {
    // Try to proceed without selecting appointment type
    await page.click('[data-testid="next-step-button"]');
    await expect(page.locator('[data-testid="appointment-type-error"]')).toContainText(/Please select an appointment type/i);

    // Select type and proceed
    await page.click('[data-testid="appointment-type-Initial Consultation"]');
    await page.click('[data-testid="next-step-button"]');

    // Try to proceed without selecting provider
    await page.click('[data-testid="next-step-button"]');
    await expect(page.locator('[data-testid="provider-error"]')).toContainText(/Please select a provider/i);
  });

  test('should allow rescheduling an appointment', async ({ page }) => {
    // Navigate to appointments list
    await page.goto('/appointments');
    
    // Find an upcoming appointment
    await page.waitForSelector('[data-testid="appointment-list"]');
    const upcomingAppointment = await page.locator('[data-testid="appointment-card"][data-status="upcoming"]').first();
    
    if (await upcomingAppointment.isVisible()) {
      // Click reschedule
      await upcomingAppointment.locator('[data-testid="reschedule-button"]').click();

      // Select new date/time
      await page.waitForSelector('[data-testid="calendar-widget"]');
      const availableDates = await page.$$('[data-testid="available-date"]');
      await availableDates[1].click(); // Select different date

      const timeSlots = await page.$$('[data-testid="time-slot"]:not([disabled])');
      await timeSlots[0].click();

      // Confirm reschedule
      await page.click('[data-testid="confirm-reschedule-button"]');

      // Check confirmation
      await expect(page.locator('[data-testid="reschedule-confirmation"]')).toContainText(/appointment has been rescheduled/i);
    }
  });

  test('should allow cancelling an appointment', async ({ page }) => {
    // Navigate to appointments list
    await page.goto('/appointments');
    
    // Find an upcoming appointment
    await page.waitForSelector('[data-testid="appointment-list"]');
    const upcomingAppointment = await page.locator('[data-testid="appointment-card"][data-status="upcoming"]').first();
    
    if (await upcomingAppointment.isVisible()) {
      // Click cancel
      await upcomingAppointment.locator('[data-testid="cancel-button"]').click();

      // Confirm cancellation in dialog
      await page.waitForSelector('[data-testid="cancel-confirmation-dialog"]');
      await page.fill('[data-testid="cancellation-reason"]', 'Need to reschedule due to conflict');
      await page.click('[data-testid="confirm-cancel-button"]');

      // Check confirmation
      await expect(page.locator('[data-testid="cancellation-confirmation"]')).toContainText(/appointment has been cancelled/i);
    }
  });

  test('should display appointment history', async ({ page }) => {
    await page.goto('/appointments');

    // Check tabs
    await expect(page.locator('[data-testid="appointments-tab-upcoming"]')).toBeVisible();
    await expect(page.locator('[data-testid="appointments-tab-past"]')).toBeVisible();
    await expect(page.locator('[data-testid="appointments-tab-cancelled"]')).toBeVisible();

    // Switch to past appointments
    await page.click('[data-testid="appointments-tab-past"]');
    await page.waitForSelector('[data-testid="appointment-list"]');

    // Check past appointments have session notes
    const pastAppointments = await page.$$('[data-testid="appointment-card"][data-status="completed"]');
    if (pastAppointments.length > 0) {
      const firstPast = pastAppointments[0];
      await expect(firstPast.locator('[data-testid="view-notes-button"]')).toBeVisible();
    }
  });

  test('should integrate with calendar', async ({ page }) => {
    // Book an appointment first
    await page.click('[data-testid="appointment-type-Initial Consultation"]');
    await page.click('[data-testid="next-step-button"]');
    await page.click('[data-testid="provider-card"]:first-child');
    await page.click('[data-testid="select-provider-button"]');
    
    const availableDates = await page.$$('[data-testid="available-date"]');
    await availableDates[0].click();
    
    const timeSlots = await page.$$('[data-testid="time-slot"]:not([disabled])');
    await timeSlots[0].click();
    
    await page.fill('[data-testid="appointment-reason"]', 'Test appointment');
    await page.click('[data-testid="confirm-booking-button"]');

    // Check calendar integration options
    await page.waitForSelector('[data-testid="booking-confirmation"]');
    await expect(page.locator('[data-testid="add-to-calendar-button"]')).toBeVisible();
    
    // Click add to calendar
    await page.click('[data-testid="add-to-calendar-button"]');
    
    // Check calendar options
    await expect(page.locator('[data-testid="calendar-google"]')).toBeVisible();
    await expect(page.locator('[data-testid="calendar-outlook"]')).toBeVisible();
    await expect(page.locator('[data-testid="calendar-ical"]')).toBeVisible();
  });

  test('should send appointment reminders', async ({ page }) => {
    // Navigate to appointment settings
    await page.goto('/appointments/settings');

    // Check reminder options
    await expect(page.locator('[data-testid="reminder-email"]')).toBeChecked();
    await expect(page.locator('[data-testid="reminder-sms"]')).toBeVisible();
    await expect(page.locator('[data-testid="reminder-push"]')).toBeVisible();

    // Set reminder preferences
    await page.selectOption('[data-testid="reminder-timing"]', '24hours');
    await page.check('[data-testid="reminder-sms"]');
    
    // Save settings
    await page.click('[data-testid="save-reminder-settings"]');
    await expect(page.locator('[data-testid="settings-saved"]')).toContainText(/Settings saved/i);
  });

  test('should meet accessibility standards', async ({ page }) => {
    await a11yHelper.checkPageAccessibility();
    await a11yHelper.checkFormAccessibility('[data-testid="appointment-form"]');
    
    // Check calendar accessibility
    await page.click('[data-testid="appointment-type-Initial Consultation"]');
    await page.click('[data-testid="next-step-button"]');
    await page.click('[data-testid="provider-card"]:first-child');
    await page.click('[data-testid="select-provider-button"]');
    
    await a11yHelper.checkKeyboardNavigation('[data-testid="calendar-widget"]');
  });

  test('should handle appointment conflicts', async ({ page }) => {
    // Try to book overlapping appointment
    await page.click('[data-testid="appointment-type-Initial Consultation"]');
    await page.click('[data-testid="next-step-button"]');
    await page.click('[data-testid="provider-card"]:first-child');
    await page.click('[data-testid="select-provider-button"]');
    
    // Select a time that conflicts with existing appointment
    const bookedSlot = await page.locator('[data-testid="time-slot"][data-booked="true"]').first();
    if (await bookedSlot.isVisible()) {
      await bookedSlot.click();
      await expect(page.locator('[data-testid="conflict-message"]')).toContainText(/already have an appointment/i);
    }
  });
});